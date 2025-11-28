

import axios from "axios";

/**
 * API client + helpers for fetching agent + order data.
 * - Caching to avoid duplicate network calls
 * - Deduping in-flight requests
 * - Timeouts and improved error handling
 * - Small helpers to manage cache
 */

/* ----- Configuration ----- */
// const BASE_URL = "http://192.168.1.50:8002/api";
const BASE_URL = "http://122.169.40.118:8002/api";
const AXIOS_TIMEOUT = 10_000; // 10s

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: AXIOS_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ----- In-memory caches ----- */
// agentCache: stores resolved results { agentInfo, orders }
const agentCache = Object.create(null);
// inFlightRequests: maps agentCode -> Promise currently fetching that agent
const inFlightRequests = Object.create(null);

/* ----- Utility helpers ----- */

/**
 * Safely compute totals for an order's itemInfo array.
 * @param {Array} items
 * @returns {{ totalPrice: number, totalQty: number }}
 */
function computeTotals(items = []) {
  const totals = items.reduce(
    (acc, it) => {
      const price = Number(it.totalPrice || 0) || 0;
      const qty = Number(it.quantity || 0) || 0;
      acc.totalPrice += price;
      acc.totalQty += qty;
      return acc;
    },
    { totalPrice: 0, totalQty: 0 }
  );

  // round to 2 decimal places for price
  totals.totalPrice = Number(totals.totalPrice.toFixed(2));
  return totals;
}

/* ----- Public API ----- */

/**
 * Fetch agent data + their orders. Uses cache and dedupes in-flight requests.
 * @param {string|number} agentCode
 * @returns {Promise<{ agentInfo: object, orders: Array }>}
 */
export async function fetchAgentData(agentCode) {
  if (!agentCode) throw new Error("Agent code missing!");

  const key = String(agentCode);

  // Return from cache if present
  if (agentCache[key]) {
    return agentCache[key];
  }

  // If a request is already in-flight for this agent, return the same promise
  if (inFlightRequests[key]) {
    return inFlightRequests[key];
  }

  // Create the promise and store it in inFlightRequests to dedupe concurrent calls
  const fetchPromise = (async () => {
    try {
      console.log("📡 Fetching data for agent:", key);

      // 1️⃣ Fetch Agent Info (best-effort)
      let agentData = {};
      try {
        const res = await apiClient.get(`/agent/${encodeURIComponent(key)}`);
        agentData = res.data?.data || {};
        console.log("🔍 Fetched agent data:", agentData);
      } catch (err) {
        // don't throw here; agent might still have orders
        console.warn(`⚠ No agent metadata for code ${key} (continuing):`, err?.message || err);
      }

      const agentInfo = {
        AgentCode: agentData?.AgentCode || key,
        AgentName: agentData?.AgentName || "Unknown Agent",
        SalesRouteCode: agentData?.SalesRouteCode || "-",
        RouteName: "Loading...",
        VehichleNo: "-",
        TotalOrder: 0,
      };

      // 2️⃣ Fetch Orders for this Agent
      let backendOrders = [];
      try {
        const orderRes = await apiClient.post(`/orders/by-agent`, { agentCode: key });
        backendOrders = Array.isArray(orderRes.data?.data) ? orderRes.data.data : [];
      } catch (err) {
        // If orders endpoint fails, return minimal result
        console.error(`❌ Failed to fetch orders for agent ${key}:`, err?.message || err);
        agentCache[key] = { agentInfo, orders: [] };
        return agentCache[key];
      }

      if (backendOrders.length === 0) {
        agentCache[key] = { agentInfo, orders: [] };
        return agentCache[key];
      }

      // 3️⃣ Fetch Route Info for the first order's route (best-effort)
      const firstRoute = backendOrders[0]?.route;
      if (firstRoute) {
        try {
          const routeRes = await apiClient.get(`/masters/routes/${encodeURIComponent(firstRoute)}`);
          const routeData = routeRes.data?.data || {};
          agentInfo.RouteName = routeData?.RouteNameEng || routeData?.RouteName || agentInfo.RouteName;
          agentInfo.VehichleNo = routeData?.VehichleNo || agentInfo.VehichleNo;
        } catch (err) {
          console.warn(`⚠ Failed to fetch route info for route ${firstRoute}:`, err?.message || err);
        }
      }

      // 4️⃣ Normalize orders and compute summaries
      const ordersWithSummary = backendOrders.map((order) => {
        const items = Array.isArray(order.itemInfo) ? order.itemInfo : [];
        const { totalPrice, totalQty } = computeTotals(items);

        // Prefer backend's TotalOrder if present; otherwise use computed totalPrice
        const finalTotalPrice = Number(order?.TotalOrder ?? totalPrice) || totalPrice;

        return {
          id: order?._id ?? order?.id ?? null,
          route: order?.route ?? null,
          status: order?.status ?? "Pending",
          itemInfo: items,
          totalItems: items.length,
          totalQty,
          totalPrice: finalTotalPrice,
          createdAt: order?.createdAt ?? order?.created_at ?? null,
          raw: order, // keep a reference to raw payload if needed elsewhere
        };
      });

      // Update aggregated total on agentInfo
      try {
        const aggregated = ordersWithSummary.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
        agentInfo.TotalOrder = Number(aggregated.toFixed(2));
      } catch {
        agentInfo.TotalOrder = 0;
      }

      const result = { agentInfo, orders: ordersWithSummary };
      agentCache[key] = result;

      console.log(`✅ Fetched agent ${key}: ${ordersWithSummary.length} orders`);
      return result;
    } finally {
      // always remove the in-flight marker
      delete inFlightRequests[key];
    }
  })();

  inFlightRequests[key] = fetchPromise;
  return fetchPromise;
}

/* ----- Cache management helpers ----- */

/**
 * Clear the whole agent cache.
 */
export function clearAgentCache() {
  for (const k of Object.keys(agentCache)) {
    delete agentCache[k];
  }
}

/**
 * Invalidate a single agent from cache.
 * @param {string|number} agentCode
 */
export function invalidateAgentCache(agentCode) {
  if (!agentCode) return;
  const key = String(agentCode);
  if (agentCache[key]) delete agentCache[key];
}

/**
 * Prefetch an agent into cache (returns the same shape as fetchAgentData).
 * Useful to warm the cache.
 * @param {string|number} agentCode
 */
export function prefetchAgent(agentCode) {
  // note: we deliberately don't await so the caller can fire-and-forget
  return fetchAgentData(agentCode).catch((err) => {
    // swallow errors for prefetch
    console.warn(`Prefetch failed for agent ${agentCode}:`, err?.message || err);
    return null;
  });
}

/* ----- Default export (optional) ----- */
export default {
  fetchAgentData,
  clearAgentCache,
  invalidateAgentCache,
  prefetchAgent,
};







































































