

// // src/pages/DashboardPage.jsx
// import React, { useEffect, useState, useRef } from "react";
// import {
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   Container,
//   Paper,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   IconButton,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Button,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import GetAppIcon from "@mui/icons-material/GetApp";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
// import DownloadIcon from "@mui/icons-material/Download";

// import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";

// export default function DashboardPage() {
//   const navigate = useNavigate();

//   // Data & UI state
//   const [loading, setLoading] = useState(false);
//   const [allOrders, setAllOrders] = useState([]);
//   const [todayOrders, setTodayOrders] = useState([]);
//   const [yesterdayOrders, setYesterdayOrders] = useState([]);
//   const [olderOrders, setOlderOrders] = useState({});

//   const [routes, setRoutes] = useState([]);
//   const [selectedRouteKey, setSelectedRouteKey] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
//   const [fetchError, setFetchError] = useState(null);

//   // Exclusive open section (only one open at a time). default "Today"
//   const [openSection, setOpenSection] = useState("Today");

//   // track which section was last accepted (so Create CSV shows for that section)
//   const [lastAcceptedSection, setLastAcceptedSection] = useState(null);

//   // acceptedSections holds accepted orders per sectionTitle (Today/Yesterday/DD/MM/YYYY)
//   const [acceptedSections, setAcceptedSections] = useState({});

//   // helper: today's IST date string (YYYY-MM-DD)
//   const getTodayIST = () => {
//     const now = new Date();
//     const ist = new Date(now.getTime() + 19800000);
//     return ist.toISOString().substring(0, 10);
//   };

//   // Normalizes various createdAt fields to a Date object (or null)
//   const parseOrderDate = (order) => {
//     if (!order) return null;
//     const candidates = [
//       order.CreatedAt,
//       order.createdAt,
//       order.orderDate,
//       order.raw?.CreatedAt,
//       order.raw?.createdAt,
//       order.raw?.orderDate,
//       order.raw?.order_date,
//       order.raw?.date,
//     ].filter(Boolean);
//     for (const c of candidates) {
//       const dt = new Date(c);
//       if (!Number.isNaN(dt.getTime())) return dt;
//     }
//     const ts = order.raw && (order.raw.timestamp || order.raw.time || order.raw.ts);
//     if (typeof ts === "number" && !Number.isNaN(ts)) {
//       const dt = new Date(ts);
//       if (!Number.isNaN(dt.getTime())) return dt;
//     }
//     return null;
//   };

//   const toISTDateString = (d) => {
//     if (!d) return null;
//     const utc = new Date(d);
//     if (Number.isNaN(utc.getTime())) return null;
//     const ist = new Date(utc.getTime() + 19800000);
//     return ist.toISOString().substring(0, 10);
//   };

//   const formatDate = (d) => {
//     if (!d) return "";
//     const dt = new Date(d);
//     if (Number.isNaN(dt.getTime())) return "";
//     return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
//   };

//   const computeTotalFromItems = (itemInfo) => {
//     if (!Array.isArray(itemInfo)) return 0;
//     return itemInfo.reduce((s, it) => s + Number(it.totalPrice ?? 0), 0);
//   };

//   // CSV enabled state — start false so Create CSV is hidden until user ACCEPTS
//   const [csvEnabled, setCsvEnabled] = useState(false);

//   // Keep track of pending Today count to detect when new orders arrive.
//   const [pendingTodayCount, setPendingTodayCount] = useState(0);
//   const prevPendingTodayCountRef = useRef(0);

//   // Confirm dialog
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmPayload, setConfirmPayload] = useState({ action: "", section: "", orders: [] });

//   // Accepted info popup
//   const [acceptedInfoOpen, setAcceptedInfoOpen] = useState(false);
//   const [acceptedInfoCount, setAcceptedInfoCount] = useState(0);

//   // CSV success UI
//   const [csvSnackOpen, setCsvSnackOpen] = useState(false);
//   const [csvSnackInfo, setCsvSnackInfo] = useState({ filename: "", count: 0 });
//   const [lastCSVBlob, setLastCSVBlob] = useState(null);

//   // API base (change if needed)
//   const BASE_URL = "http://192.168.1.4:8002/api";

//   // Fetch pending orders once (no auto-refresh)
//   const refreshData = async () => {
//     setSnack({ open: false, message: "", severity: "success" });
//     setFetchError(null);
//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/orders/Status/Pending`, { cache: "no-store" });
//       if (!res.ok) {
//         const txt = await res.text().catch(() => "");
//         throw new Error(`Network error ${res.status} ${res.statusText} ${txt}`);
//       }
//       const result = await res.json();
//       if (!result || !result.success) {
//         const msg = result?.message || "Failed to fetch orders";
//         setSnack({ open: true, message: msg, severity: "error" });
//         setAllOrders([]);
//         setRoutes([]);
//         setFetchError(msg);
//         setLoading(false);
//         return;
//       }

//       const list = Array.isArray(result.data) ? result.data : [];

//       const mapped = list.map((o) => {
//         const agent = o.agentDetails ?? o.agent ?? {};
//         const route = o.routeInfo ?? o.routeDetails ?? o.route ?? {};
//         const total = Number(o.TotalOrder ?? o.totalPrice ?? 0) || computeTotalFromItems(o.itemInfo || []);
//         const salesRouteCode =
//           agent.SalesRouteCode ?? agent.RouteCode ?? o.routeCode ?? o.SalesRouteCode ?? route.SalesRouteCode ?? "";
//         const routeName = route.RouteName ?? agent.RouteName ?? o.routeName ?? o.RouteName ?? "";
//         return {
//           OrderId: o._id ?? o.OrderId ?? o.id ?? "",
//           AgentCode: agent.AgentCode ?? o.agentCode ?? agent.code ?? null,
//           AgentName:
//             (agent.AgentNameEng && agent.AgentNameEng.trim()) ||
//             (agent.AgentName && agent.AgentName.trim()) ||
//             (o.agentDetails?.AgentName ?? o.agentName ?? "Unknown"),
//           SalesRouteCode: salesRouteCode,
//           RouteName: routeName,
//           VehichleNo: route.VehicleNo ?? route.VehichleNo ?? o.vehicleNo ?? o.VehicleNo ?? "",
//           TotalOrder: Number(total),
//           status: (o.status ?? "pending").toLowerCase(),
//           CreatedAt: o.createdAt ?? o.CreatedAt ?? o.orderDate ?? null,
//           raw: o,
//         };
//       });

//       // if some orders were previously accepted (persisted) mark them accepted in-memory
//       const persistedRaw = localStorage.getItem("accepted_orders_list");
//       const persisted = persistedRaw ? JSON.parse(persistedRaw) : [];
//       const acceptedIds = new Set((persisted || []).map((x) => x.OrderId).filter(Boolean));
//       const merged = mapped.map((m) => (acceptedIds.has(m.OrderId) ? { ...m, status: "accepted" } : m));

//       setAllOrders(merged);

//       // build unique route options
//       const unique = {};
//       merged.forEach((m) => {
//         const code = m.SalesRouteCode ?? "";
//         const name = m.RouteName ?? "(No name)";
//         const key = `${code}||${name}`;
//         if (!unique[key]) unique[key] = { key, code, name };
//       });
//       const routeList = Object.values(unique).sort((a, b) => (a.name > b.name ? 1 : -1));
//       setRoutes(routeList);

//       setSnack({ open: true, message: "Data Loaded", severity: "success" });
//       setFetchError(null);
//     } catch (err) {
//       console.error("refreshData error:", err);
//       const msg = err?.message || "Unknown fetch error";
//       setSnack({ open: true, message: "Error loading data: " + msg, severity: "error" });
//       setAllOrders([]);
//       setRoutes([]);
//       setFetchError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshData();
//     // eslint-disable-next-line
//   }, []);

//   // grouping logic with route & date filter
//   useEffect(() => {
//     if (!allOrders.length) {
//       setTodayOrders([]);
//       setYesterdayOrders([]);
//       setOlderOrders({});
//       setPendingTodayCount(0);
//       return;
//     }

//     // only show pending orders on dashboard
//     let pending = allOrders.filter((o) => (o.status ?? "").toLowerCase() === "pending");

//     if (selectedRouteKey) {
//       pending = pending.filter((o) => {
//         const code = o.SalesRouteCode ?? "";
//         const name = o.RouteName ?? "(No name)";
//         const key = `${code}||${name}`;
//         return key === selectedRouteKey;
//       });
//     }

//     if (fromDate && toDate) {
//       pending = pending.filter((o) => {
//         const orderDate = toISTDateString(o.CreatedAt);
//         return orderDate && orderDate >= fromDate && orderDate <= toDate;
//       });
//     }

//     const now = new Date();
//     const istNow = new Date(now.getTime() + 19800000);
//     const todayStr = istNow.toISOString().substring(0, 10);

//     const y = new Date(istNow);
//     y.setDate(y.getDate() - 1);
//     const yesterdayStr = y.toISOString().substring(0, 10);

//     const todayList = [];
//     const yesterdayList = [];
//     const olderGrouped = {};

//     pending.forEach((order) => {
//       const dt = parseOrderDate(order) || (order.CreatedAt ? new Date(order.CreatedAt) : null);
//       const dateStr =
//         dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : "";
//       if (dateStr === todayStr) {
//         todayList.push(order);
//       } else if (dateStr === yesterdayStr) {
//         yesterdayList.push(order);
//       } else {
//         const label = formatDate(order.CreatedAt || dt);
//         if (!olderGrouped[label]) olderGrouped[label] = [];
//         olderGrouped[label].push(order);
//       }
//     });

//     // sort groups descending
//     const sortedGroups = {};
//     Object.keys(olderGrouped)
//       .sort((a, b) => new Date(b) - new Date(a))
//       .forEach((k) => (sortedGroups[k] = olderGrouped[k]));

//     setTodayOrders(todayList);
//     setYesterdayOrders(yesterdayList);
//     setOlderOrders(sortedGroups);

//     // update pending today count
//     const newPendingTodayCount = todayList.length;
//     prevPendingTodayCountRef.current = newPendingTodayCount;
//     setPendingTodayCount(newPendingTodayCount);
//   }, [allOrders, fromDate, toDate, selectedRouteKey]);

//   // --- CSV builder (robust) ---
//   const buildCSV = (orders) => {
//     if (!orders || !orders.length) return null;

//     const fields = ["agentCode", "salesRouteCode", "itemCode", "quantity", "rate", "orderDate", "orderTime", "totalOrder", "status"];

//     const rows = orders.map((o) => {
//       const raw = o.raw || {};
//       const itemInfo = Array.isArray(raw.itemInfo) ? raw.itemInfo : raw.itemInfo ?? [];

//       const itemCodes = itemInfo.map((i) => i.itemCode ?? i.ItemCode ?? "N/A");
//       const quantities = itemInfo.map((i) => i.quantity ?? i.qty ?? 0);
//       const rates = itemInfo.map(
//         (i) => i.rate ?? i.price ?? i.unitPrice ?? i.pricePerUnit ?? i.ratePerUnit ?? i.totalPrice ?? 0
//       );

//       const dt = parseOrderDate(o);
//       const orderDateStr = dt && !Number.isNaN(dt.getTime()) ? dt.toISOString().split("T")[0] : "";
//       const orderTimeStr = dt && !Number.isNaN(dt.getTime()) ? dt.toTimeString().split(" ")[0] : "";

//       return {
//         agentCode: o.AgentCode ?? "",
//         salesRouteCode: o.SalesRouteCode ?? "",
//         itemCode: itemCodes.join(";"),
//         quantity: quantities.join(";"),
//         rate: rates.join(";"),
//         orderDate: orderDateStr,
//         orderTime: orderTimeStr,
//         totalOrder: Number(o.TotalOrder || 0).toFixed(2),
//         status: o.status ?? "",
//       };
//     });

//     const header = fields.join(",") + "\n";
//     const body = rows
//       .map((r) =>
//         fields
//           .map((f) => `"${(r[f] ?? "").toString().replace(/"/g, '""')}"`)
//           .join(",")
//       )
//       .join("\n");

//     return "\uFEFF" + header + body; // BOM for Excel
//   };

//   const createCSVAndNotify = (orders, filename) => {
//     const csv = buildCSV(orders);
//     if (!csv) {
//       setSnack({ open: true, message: "Nothing to export", severity: "warning" });
//       return null;
//     }

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     setLastCSVBlob(blob);
//     const safeName = filename || `accepted_${new Date().toISOString().split("T")[0]}.csv`;
//     setCsvSnackInfo({ filename: safeName, count: orders.length });

//     // immediate download
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = safeName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);

//     // After creating the CSV, hide the Create CSV button until new Accept happens
//     setCsvEnabled(false);

//     setCsvSnackOpen(true);
//     return { blob, filename: safeName };
//   };

//   const redownloadLastCSV = () => {
//     if (!lastCSVBlob) {
//       setSnack({ open: true, message: "No CSV to re-download", severity: "warning" });
//       return;
//     }
//     const url = URL.createObjectURL(lastCSVBlob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = csvSnackInfo.filename || `export_${new Date().toISOString().split("T")[0]}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // When user clicks Accept on a section (any section title)
//   const onAcceptSection = (sectionTitle, orders) => {
//     // allow any section (Today, Yesterday, DD/MM/YYYY labels)
//     setConfirmPayload({ action: "accept", section: sectionTitle, orders });
//     setConfirmOpen(true);
//   };

//   // helper: convert a sectionTitle ("Today","Yesterday" or "DD/MM/YYYY") into YYYY-MM-DD ISO string
//   const sectionTitleToISO = (sectionTitle) => {
//     const now = new Date();
//     const istNow = new Date(now.getTime() + 19800000);
//     const todayStr = istNow.toISOString().substring(0, 10);
//     const y = new Date(istNow);
//     y.setDate(y.getDate() - 1);
//     const yesterdayStr = y.toISOString().substring(0, 10);

//     if (sectionTitle === "Today") return todayStr;
//     if (sectionTitle === "Yesterday") return yesterdayStr;

//     // expect label format "DD/MM/YYYY" (from formatDate)
//     const parts = sectionTitle.split("/");
//     if (parts.length === 3) {
//       const [dd, mm, yyyy] = parts;
//       if (dd.length && mm.length && yyyy.length) {
//         return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
//       }
//     }
//     return null;
//   };

//   // Confirm result (Accept)
//   const doConfirm = () => {
//     const { action, section, orders } = confirmPayload;
//     if (action === "accept") {
//       // mark orders accepted in allOrders state (so table updates)
//       const acceptedIds = new Set((orders || []).map((o) => o.OrderId).filter(Boolean));
//       const updatedAll = allOrders.map((o) => {
//         if (acceptedIds.has(o.OrderId)) {
//           return { ...o, status: "accepted" };
//         }
//         return o;
//       });
//       setAllOrders(updatedAll);

//       // persist accepted orders in localStorage under accepted_orders_list (avoid duplicates)
//       try {
//         const raw = localStorage.getItem("accepted_orders_list");
//         const existing = raw ? JSON.parse(raw) : [];
//         const existingIds = new Set(existing.map((x) => x.OrderId));
//         // ensure CreatedAt exists on the record (take from order if missing)
//         const toAdd = (orders || [])
//           .filter((o) => !existingIds.has(o.OrderId))
//           .map((o) => ({ ...o, status: "accepted", CreatedAt: o.CreatedAt ?? new Date().toISOString() }));
//         const merged = [...existing, ...toAdd];
//         localStorage.setItem("accepted_orders_list", JSON.stringify(merged));

//         // Also update acceptedSections for this sectionTitle using the persisted merged list filtered by section date
//         const targetISO = sectionTitleToISO(section);
//         const forSection = merged.filter((m) => {
//           const dt = parseOrderDate(m) || (m.CreatedAt ? new Date(m.CreatedAt) : null);
//           const ds = dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : null;
//           return ds === targetISO;
//         });

//         setAcceptedSections((prev) => ({ ...prev, [section]: forSection }));
//       } catch (e) {
//         console.warn("persist accepted orders failed", e);
//         // fallback: store the accepted orders directly under the section
//         setAcceptedSections((prev) => ({ ...prev, [section]: orders.map((o) => ({ ...o, status: "accepted" })) }));
//       }

//       // show attractive popup with count
//       const count = (orders || []).length || 0;
//       setAcceptedInfoCount(count);
//       setAcceptedInfoOpen(true);

//       // ENABLE Create CSV button and remember which section
//       setCsvEnabled(true);
//       setLastAcceptedSection(section);
//     }
//     setConfirmOpen(false);
//     setConfirmPayload({ action: "", section: "", orders: [] });
//   };

//   // Create CSV (direct). Uses accepted orders for the given sectionTitle (filters by section date)
//   const onCreateCSVSection = (sectionTitle) => {
//     const persistedRaw = localStorage.getItem("accepted_orders_list");
//     const persisted = persistedRaw ? JSON.parse(persistedRaw) : [];

//     const targetISO = sectionTitleToISO(sectionTitle);
//     if (!targetISO) {
//       setSnack({ open: true, message: "Unable to determine section date for CSV", severity: "warning" });
//       return;
//     }

//     // filter persisted accepted orders to those that match the section date
//     const ordersForSection = (persisted || []).filter((o) => {
//       const dt = parseOrderDate(o) || (o.CreatedAt ? new Date(o.CreatedAt) : null);
//       const ds = dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : null;
//       return ds === targetISO;
//     });

//     if (!ordersForSection || !ordersForSection.length) {
//       setSnack({ open: true, message: "Please accept the section first", severity: "warning" });
//       return;
//     }

//     const filename = `accepted_${sectionTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
//     const res = createCSVAndNotify(ordersForSection, filename);

//     if (res) {
//       setSnack({ open: true, message: `CSV created for ${ordersForSection.length} order(s)`, severity: "success" });
//     }
//   };

//   // Section header
//   const sectionHeader = (title, list) => {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           px: 2,
//           py: 1.25,
//           background: "#073763",
//           color: "white",
//           borderTopLeftRadius: 8,
//           borderTopRightRadius: 8,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//           <IconButton
//             size="small"
//             sx={{ color: "white" }}
//             onClick={(e) => {
//               e.stopPropagation();
//               setOpenSection((prev) => (prev === title ? null : title));
//             }}
//           >
//             {openSection === title ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//           <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
//             {title}
//           </Typography>
//         </Box>

//         <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} />
//       </Box>
//     );
//   };

//   // render rows
//   const renderRows = (list) =>
//     list.map((o, i) => (
//       <TableRow
//         key={o.OrderId || `${o.AgentCode}-${i}`}
//         hover
//         sx={{ cursor: "pointer" }}
//         onClick={() => {
//           const statusParam = encodeURIComponent(o.raw?.status ?? o.status ?? "");
//           navigate(`/orders?orderId=${o.OrderId}&agentCode=${o.AgentCode}&status=${statusParam}`);
//         }}
//       >
//         <TableCell sx={{ width: 40, pl: 2 }}>{i + 1}</TableCell>
//         <TableCell sx={{ width: 120 }}>{o.SalesRouteCode ?? "N/A"}</TableCell>
//         <TableCell sx={{ minWidth: 160 }}>{o.RouteName ?? "N/A"}</TableCell>
//         <TableCell sx={{ width: 140 }}>{o.VehichleNo ?? "N/A"}</TableCell>
//         <TableCell sx={{ minWidth: 180 }}>{o.AgentName}</TableCell>
//         <TableCell sx={{ width: 120 }}>{o.AgentCode ?? "N/A"}</TableCell>
//         <TableCell sx={{ width: 150 }}>
//           ₹{" "}
//           {Number(o.TotalOrder || 0).toLocaleString("en-IN", {
//             minimumFractionDigits: 2,
//           })}
//         </TableCell>
//         <TableCell sx={{ width: 160, pr: 2, textAlign: "center" }}>
//           {o.status === "accepted" ? (
//             <Button
//               variant="contained"
//               size="small"
//               disabled
//               sx={{
//                 background: "linear-gradient(90deg,#28a745,#1e7e34)",
//                 color: "#fff",
//                 borderRadius: 6,
//                 textTransform: "none",
//                 px: 2,
//                 py: 0.5,
//                 boxShadow: "none",
//               }}
//             >
//               Order Accepted
//             </Button>
//           ) : (
//             <Box
//               sx={{
//                 px: 1,
//                 py: 0.4,
//                 bgcolor: "#fff3cd",
//                 color: "#c77e00",
//                 borderRadius: "8px",
//                 fontWeight: "bold",
//                 fontSize: 13,
//                 display: "inline-block",
//               }}
//             >
//               प्रलंबित
//             </Box>
//           )}
//         </TableCell>
//       </TableRow>
//     ));

//   // renderSection: show Accept button under table rows for every section with orders
//   const renderSection = (title, list) => {
//     const isAcceptable = list && list.length > 0; // show Accept for any non-empty section
//     return (
//       <TableRow>
//         <TableCell colSpan={8} sx={{ p: 0 }}>
//           <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }}>
//             {sectionHeader(title, list)}
//             {openSection === title ? (
//               <>
//                 {list.length === 0 ? (
//                   <Box sx={{ py: 3, textAlign: "center" }}>
//                     <Typography color="text.secondary">No Orders</Typography>
//                   </Box>
//                 ) : (
//                   <Table size="small">
//                     <TableBody>{renderRows(list)}</TableBody>
//                   </Table>
//                 )}

//                 {/* Accept button for any non-empty section */}
//                 {isAcceptable && (
//                   <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
//                     <Button
//                       variant="contained"
//                       size="large"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onAcceptSection(title, list);
//                       }}
//                       sx={{
//                         background: "linear-gradient(90deg,#28a745,#1e7e34)",
//                         color: "#fff",
//                         borderRadius: 6,
//                         textTransform: "none",
//                         px: 3,
//                         boxShadow: "0 10px 24px rgba(46,125,50,0.16)",
//                       }}
//                     >
//                       Accept Orders
//                     </Button>
//                   </Box>
//                 )}

//                 {/* Create CSV button only for the section that was most recently accepted */}
//                 {csvEnabled && lastAcceptedSection === title && (
//                   <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
//                     <Button
//                       variant="contained"
//                       startIcon={<DownloadIcon />}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onCreateCSVSection(title);
//                       }}
//                       sx={{
//                         background: "linear-gradient(90deg,#28a745,#1e7e34)",
//                         color: "#fff",
//                         borderRadius: 6,
//                         textTransform: "none",
//                         px: 3,
//                         boxShadow: "0 8px 18px rgba(46,125,50,0.12)",
//                       }}
//                     >
//                       Create CSV
//                     </Button>
//                   </Box>
//                 )}
//               </>
//             ) : null}
//           </Paper>
//         </TableCell>
//       </TableRow>
//     );
//   };

//   return (
//     <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f4f7fb" }}>
//       {/* Sidebar */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: 260,
//           "& .MuiDrawer-paper": {
//             width: 260,
//             background: "linear-gradient(180deg,#073763,#021e3a)",
//             color: "white",
//           },
//         }}
//       >
//         <Box sx={{ textAlign: "center", py: 4 }}>
//           <Typography variant="h6">Admin Panel</Typography>
//         </Box>

//         <Divider sx={{ background: "rgba(255,255,255,0.12)" }} />

//         <List>
//           <ListItem disablePadding>
//             <ListItemButton onClick={() => navigate("/dashboard")}>
//               <ListItemIcon sx={{ color: "white" }}>
//                 <DashboardIcon />
//               </ListItemIcon>
//               <ListItemText primary="Dashboard" />
//             </ListItemButton>
//           </ListItem>

//           <ListItem disablePadding>
//             <ListItemButton onClick={() => navigate("/accepted-orders")}>
//               <ListItemIcon sx={{ color: "white" }}>
//                 <FileDownloadIcon />
//               </ListItemIcon>
//               <ListItemText primary="Accepted Orders" />
//             </ListItemButton>
//           </ListItem>

//           <ListItem disablePadding>
//             <ListItemButton onClick={() => navigate("/create-csv")}>
//               <ListItemIcon sx={{ color: "white" }}>
//                 <GetAppIcon />
//               </ListItemIcon>
//               <ListItemText primary="Generate CSV" />
//             </ListItemButton>
//           </ListItem>
//         </List>
//       </Drawer>

//       {/* MAIN AREA */}
//       <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
//         <AppBar position="sticky" elevation={1} sx={{ background: "white", color: "#073763" }}>
//           <Toolbar sx={{ py: 2.5, px: 3 }}>
//             <Box component="img" src={logo} sx={{ height: 54, mr: 3 }} />
//             <Box sx={{ flexGrow: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: "700" }}>
//                 श्री हनुमान सहकारी दूध संस्था, यळगुड.
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Tal: Hatkangale, Dist. Kolhapur (Maharashtra)
//               </Typography>
//             </Box>

//             <Tooltip title="Refresh">
//               <IconButton onClick={() => refreshData()} sx={{ borderRadius: 2 }}>
//                 <RefreshIcon sx={{ color: "#073763", fontSize: 26 }} />
//               </IconButton>
//             </Tooltip>
//           </Toolbar>
//         </AppBar>

//         <Container sx={{ py: 4 }}>
//           <Paper elevation={6} sx={{ p: 3, borderRadius: 2 }}>
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
//               <Typography variant="h6" sx={{ fontWeight: "bold", color: "#073763", borderLeft: "6px solid #073763", pl: 1.5 }}>
//                 Requirements
//               </Typography>

//               <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//                 <FormControl size="small" sx={{ minWidth: 260 }}>
//                   <InputLabel id="route-filter-label">
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <FilterListIcon sx={{ fontSize: 16 }} /> Filter by Route
//                     </Box>
//                   </InputLabel>
//                   <Select
//                     labelId="route-filter-label"
//                     label="Filter by Route"
//                     value={selectedRouteKey}
//                     onChange={(e) => setSelectedRouteKey(e.target.value)}
//                     sx={{ minWidth: 260 }}
//                   >
//                     <MenuItem value="">All Routes</MenuItem>
//                     {routes.map((r) => (
//                       <MenuItem key={r.key} value={r.key}>
//                         {r.name} {r.code ? `(${r.code})` : ""}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <TextField
//                   type="date"
//                   size="small"
//                   label="From Date"
//                   InputLabelProps={{ shrink: true }}
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                 />
//                 <TextField
//                   type="date"
//                   size="small"
//                   label="To Date"
//                   InputLabelProps={{ shrink: true }}
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                 />
//               </Box>
//             </Box>

//             {loading ? (
//               <Box sx={{ textAlign: "center", py: 6 }}>
//                 <CircularProgress />
//               </Box>
//             ) : fetchError ? (
//               <Box sx={{ py: 6, textAlign: "center" }}>
//                 <Typography variant="body1" sx={{ mb: 2 }}>
//                   Could not load orders: {fetchError}
//                 </Typography>
//                 <Button variant="contained" onClick={() => refreshData()}>
//                   Try Again
//                 </Button>
//               </Box>
//             ) : (
//               <TableContainer>
//                 <Table>
//                   <TableHead>
//                     <TableRow sx={{ background: "#f0f4f9" }}>
//                       <TableCell sx={{ fontWeight: "bold", width: 40  }}>अ. क्रं</TableCell>
//                       <TableCell sx={{ fontWeight: "bold", width: 140 }}>रूट कोड</TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>रूट नाव</TableCell>
//                       <TableCell sx={{ fontWeight: "bold", width: 140 }}>वाहन क्रमांक</TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>एजंट नाव</TableCell>
//                       <TableCell sx={{ fontWeight: "bold", width: 120 }}>एजंट कोड</TableCell>
//                       <TableCell sx={{ fontWeight: "bold", width: 150 }}>एकूण ऑर्डर (₹)</TableCell>
//                       <TableCell sx={{ fontWeight: "bold", width: 160, textAlign: "center", pr: 2 }}>स्थिती</TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {renderSection("Today", todayOrders)}
//                     {renderSection("Yesterday", yesterdayOrders)}
//                     {Object.keys(olderOrders).map((date) => renderSection(date, olderOrders[date]))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </Paper>
//         </Container>
//       </Box>

//       {/* normal snack */}
//       <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
//         <Alert severity={snack.severity}>{snack.message}</Alert>
//       </Snackbar>

//       {/* CSV success snack */}
//       <Snackbar
//         open={csvSnackOpen}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         onClose={() => setCsvSnackOpen(false)}
//         autoHideDuration={9000}
//       >
//         <Alert
//           severity="success"
//           sx={{ display: "flex", alignItems: "center", gap: 1, boxShadow: 6 }}
//           action={
//             <>
//               <Button startIcon={<DownloadIcon />} size="small" color="inherit" onClick={() => redownloadLastCSV()}>
//                 Download again
//               </Button>
//               <IconButton size="small" aria-label="close" color="inherit" onClick={() => setCsvSnackOpen(false)}>
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </>
//           }
//         >
//           <strong>CSV Created —</strong>&nbsp; {csvSnackInfo.count} order(s) exported as <em>{csvSnackInfo.filename}</em>
//         </Alert>
//       </Snackbar>

//       {/* Confirm Accept */}
//       <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
//         <DialogTitle>Confirm</DialogTitle>
//         <DialogContent>
//           <Typography>
//             You are about to accept {confirmPayload.orders?.length || 0} order(s) for {confirmPayload.section}. Continue?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
//           <Button onClick={() => doConfirm()} variant="contained">
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }





































































// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GetAppIcon from "@mui/icons-material/GetApp";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";

import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Data & UI state
  const [loading, setLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [yesterdayOrders, setYesterdayOrders] = useState([]);
  const [olderOrders, setOlderOrders] = useState({});

  const [routes, setRoutes] = useState([]);
  const [selectedRouteKey, setSelectedRouteKey] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [fetchError, setFetchError] = useState(null);

  // Exclusive open section (only one open at a time). default "Today"
  const [openSection, setOpenSection] = useState("Today");

  // track which section was last accepted (so Create CSV shows for that section)
  const [lastAcceptedSection, setLastAcceptedSection] = useState(null);

  // acceptedSections holds accepted orders per sectionTitle (Today/Yesterday/DD/MM/YYYY)
  const [acceptedSections, setAcceptedSections] = useState({});

  // helper: today's IST date string (YYYY-MM-DD)
  const getTodayIST = () => {
    const now = new Date();
    const ist = new Date(now.getTime() + 19800000);
    return ist.toISOString().substring(0, 10);
  };

  // Normalizes various createdAt fields to a Date object (or null)
  const parseOrderDate = (order) => {
    if (!order) return null;
    const candidates = [
      order.CreatedAt,
      order.createdAt,
      order.orderDate,
      order.raw?.CreatedAt,
      order.raw?.createdAt,
      order.raw?.orderDate,
      order.raw?.order_date,
      order.raw?.date,
    ].filter(Boolean);
    for (const c of candidates) {
      const dt = new Date(c);
      if (!Number.isNaN(dt.getTime())) return dt;
    }
    const ts = order.raw && (order.raw.timestamp || order.raw.time || order.raw.ts);
    if (typeof ts === "number" && !Number.isNaN(ts)) {
      const dt = new Date(ts);
      if (!Number.isNaN(dt.getTime())) return dt;
    }
    return null;
  };

  const toISTDateString = (d) => {
    if (!d) return null;
    const utc = new Date(d);
    if (Number.isNaN(utc.getTime())) return null;
    const ist = new Date(utc.getTime() + 19800000);
    return ist.toISOString().substring(0, 10);
  };

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const computeTotalFromItems = (itemInfo) => {
    if (!Array.isArray(itemInfo)) return 0;
    return itemInfo.reduce((s, it) => s + Number(it.totalPrice ?? 0), 0);
  };

  // CSV enabled state — start false so Create CSV is hidden until user ACCEPTS
  const [csvEnabled, setCsvEnabled] = useState(false);

  // Keep track of pending Today count to detect when new orders arrive.
  const [pendingTodayCount, setPendingTodayCount] = useState(0);
  const prevPendingTodayCountRef = useRef(0);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({ action: "", section: "", orders: [] });

  // Accepted info popup
  const [acceptedInfoOpen, setAcceptedInfoOpen] = useState(false);
  const [acceptedInfoCount, setAcceptedInfoCount] = useState(0);

  // CSV success UI
  const [csvSnackOpen, setCsvSnackOpen] = useState(false);
  const [csvSnackInfo, setCsvSnackInfo] = useState({ filename: "", count: 0 });
  const [lastCSVBlob, setLastCSVBlob] = useState(null);

  // API base (change if needed)
  const BASE_URL = "http://192.168.1.4:8002/api";

  // Fetch pending orders once (no auto-refresh)
  const refreshData = async () => {
    setSnack({ open: false, message: "", severity: "success" });
    setFetchError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/Status/Pending`, { cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Network error ${res.status} ${res.statusText} ${txt}`);
      }
      const result = await res.json();
      if (!result || !result.success) {
        const msg = result?.message || "Failed to fetch orders";
        setSnack({ open: true, message: msg, severity: "error" });
        setAllOrders([]);
        setRoutes([]);
        setFetchError(msg);
        setLoading(false);
        return;
      }

      const list = Array.isArray(result.data) ? result.data : [];

      const mapped = list.map((o) => {
        const agent = o.agentDetails ?? o.agent ?? {};
        const route = o.routeInfo ?? o.routeDetails ?? o.route ?? {};
        const total = Number(o.TotalOrder ?? o.totalPrice ?? 0) || computeTotalFromItems(o.itemInfo || []);
        const salesRouteCode =
          agent.SalesRouteCode ?? agent.RouteCode ?? o.routeCode ?? o.SalesRouteCode ?? route.SalesRouteCode ?? "";
        const routeName = route.RouteName ?? agent.RouteName ?? o.routeName ?? o.RouteName ?? "";
        return {
          OrderId: o._id ?? o.OrderId ?? o.id ?? "",
          AgentCode: agent.AgentCode ?? o.agentCode ?? agent.code ?? null,
          AgentName:
            (agent.AgentNameEng && agent.AgentNameEng.trim()) ||
            (agent.AgentName && agent.AgentName.trim()) ||
            (o.agentDetails?.AgentName ?? o.agentName ?? "Unknown"),
          SalesRouteCode: salesRouteCode,
          RouteName: routeName,
          VehichleNo: route.VehicleNo ?? route.VehichleNo ?? o.vehicleNo ?? o.VehicleNo ?? "",
          TotalOrder: Number(total),
          status: (o.status ?? "pending").toLowerCase(),
          CreatedAt: o.createdAt ?? o.CreatedAt ?? o.orderDate ?? null,
          raw: o,
        };
      });

      // if some orders were previously accepted (persisted) mark them accepted in-memory
      const persistedRaw = localStorage.getItem("accepted_orders_list");
      const persisted = persistedRaw ? JSON.parse(persistedRaw) : [];
      const acceptedIds = new Set((persisted || []).map((x) => x.OrderId).filter(Boolean));
      const merged = mapped.map((m) => (acceptedIds.has(m.OrderId) ? { ...m, status: "accepted" } : m));

      setAllOrders(merged);

      // build unique route options
      const unique = {};
      merged.forEach((m) => {
        const code = m.SalesRouteCode ?? "";
        const name = m.RouteName ?? "(No name)";
        const key = `${code}||${name}`;
        if (!unique[key]) unique[key] = { key, code, name };
      });
      const routeList = Object.values(unique).sort((a, b) => (a.name > b.name ? 1 : -1));
      setRoutes(routeList);

      setSnack({ open: true, message: "Data Loaded", severity: "success" });
      setFetchError(null);
    } catch (err) {
      console.error("refreshData error:", err);
      const msg = err?.message || "Unknown fetch error";
      setSnack({ open: true, message: "Error loading data: " + msg, severity: "error" });
      setAllOrders([]);
      setRoutes([]);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line
  }, []);

  // grouping logic with route & date filter
  useEffect(() => {
    if (!allOrders.length) {
      setTodayOrders([]);
      setYesterdayOrders([]);
      setOlderOrders({});
      setPendingTodayCount(0);
      return;
    }

    // only show pending orders on dashboard
    let pending = allOrders.filter((o) => (o.status ?? "").toLowerCase() === "pending");

    if (selectedRouteKey) {
      pending = pending.filter((o) => {
        const code = o.SalesRouteCode ?? "";
        const name = o.RouteName ?? "(No name)";
        const key = `${code}||${name}`;
        return key === selectedRouteKey;
      });
    }

    if (fromDate && toDate) {
      pending = pending.filter((o) => {
        const orderDate = toISTDateString(o.CreatedAt);
        return orderDate && orderDate >= fromDate && orderDate <= toDate;
      });
    }

    const now = new Date();
    const istNow = new Date(now.getTime() + 19800000);
    const todayStr = istNow.toISOString().substring(0, 10);

    const y = new Date(istNow);
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toISOString().substring(0, 10);

    const todayList = [];
    const yesterdayList = [];
    const olderGrouped = {};

    pending.forEach((order) => {
      const dt = parseOrderDate(order) || (order.CreatedAt ? new Date(order.CreatedAt) : null);
      const dateStr =
        dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : "";
      if (dateStr === todayStr) {
        todayList.push(order);
      } else if (dateStr === yesterdayStr) {
        yesterdayList.push(order);
      } else {
        const label = formatDate(order.CreatedAt || dt);
        if (!olderGrouped[label]) olderGrouped[label] = [];
        olderGrouped[label].push(order);
      }
    });

    // sort groups descending
    const sortedGroups = {};
    Object.keys(olderGrouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach((k) => (sortedGroups[k] = olderGrouped[k]));

    setTodayOrders(todayList);
    setYesterdayOrders(yesterdayList);
    setOlderOrders(sortedGroups);

    // update pending today count
    const newPendingTodayCount = todayList.length;
    prevPendingTodayCountRef.current = newPendingTodayCount;
    setPendingTodayCount(newPendingTodayCount);
  }, [allOrders, fromDate, toDate, selectedRouteKey]);

  // --- CSV builder (UPDATED) ---
  // Build CSV where each row is a single ITEM (matching CSVGen format)
  const buildCSVExpanded = (orders) => {
    if (!orders || !orders.length) return null;

    const headers = [
      "OrderId",
      "AgentCode",
      "SalesRouteCode",
      "ItemCode",
      "Quantity",
      "OrderDate",
      "OrderTime",
      "TotalOrder",
      "Status",
    ];

    const rows = [];

    orders.forEach((o) => {
      const raw = o.raw || o;
      // items - try multiple places
      const items =
        Array.isArray(raw.itemInfo) ? raw.itemInfo : Array.isArray(raw.items) ? raw.items : raw.itemInfo ?? [];

      // get CreatedAt -> IST split
      let dt = parseOrderDate(o) || parseOrderDate(raw) || (o.CreatedAt ? new Date(o.CreatedAt) : null);
      if (!dt || Number.isNaN(dt.getTime())) {
        // fallback try raw.CreatedAt string
        dt = raw.CreatedAt ? new Date(raw.CreatedAt) : new Date();
      }
      const ist = new Date(dt.getTime() + 19800000);
      const orderDateStr = ist.toISOString().split("T")[0];
      const orderTimeStr = ist.toTimeString().split(" ")[0];

      const agentCode = o.AgentCode ?? raw.AgentCode ?? raw.agentCode ?? raw.agent?.code ?? "";
      const salesRouteCode =
        o.SalesRouteCode ??
        raw.SalesRouteCode ??
        raw.salesRouteCode ??
        raw.agentDetails?.SalesRouteCode ??
        raw.routeCode ??
        "";

      if (!Array.isArray(items) || items.length === 0) {
        rows.push({
          OrderId: o.OrderId ?? o.OrderId ?? o._id ?? raw.OrderId ?? raw._id ?? "",
          AgentCode: agentCode,
          SalesRouteCode: salesRouteCode,
          ItemCode: "N/A",
          Quantity: 0,
          OrderDate: orderDateStr,
          OrderTime: orderTimeStr,
          TotalOrder: Number(o.TotalOrder ?? raw.TotalOrder ?? raw.totalPrice ?? 0).toFixed(2),
          Status: o.status ?? raw.status ?? "accepted",
        });
      } else {
        items.forEach((it) => {
          const itemCode = it.itemCode ?? it.ItemCode ?? it.code ?? it.sku ?? String(it.name ?? "UNKNOWN");
          const quantity = it.quantity ?? it.qty ?? it.Qty ?? 0;
          rows.push({
            OrderId: o.OrderId ?? o._id ?? raw.OrderId ?? raw._id ?? "",
            AgentCode: agentCode,
            SalesRouteCode: salesRouteCode,
            ItemCode: itemCode,
            Quantity: quantity,
            OrderDate: orderDateStr,
            OrderTime: orderTimeStr,
            TotalOrder: Number(o.TotalOrder ?? raw.TotalOrder ?? raw.totalPrice ?? 0).toFixed(2),
            Status: o.status ?? raw.status ?? "accepted",
          });
        });
      }
    });

    // build CSV string with BOM
    const headerLine = headers.join(",") + "\n";
    const body = rows
      .map((r) =>
        headers
          .map((h) => {
            const v = r[h] ?? "";
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    return "\uFEFF" + headerLine + body;
  };

  const createCSVAndNotifyExpanded = (orders, filename) => {
    const csv = buildCSVExpanded(orders);
    if (!csv) {
      setSnack({ open: true, message: "Nothing to export", severity: "warning" });
      return null;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    setLastCSVBlob(blob);
    const safeName = filename || `accepted_${new Date().toISOString().split("T")[0]}.csv`;
    setCsvSnackInfo({ filename: safeName, count: orders.length });

    // immediate download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // After creating the CSV, hide the Create CSV button until new Accept happens
    setCsvEnabled(false);

    setCsvSnackOpen(true);
    return { blob, filename: safeName };
  };

  const redownloadLastCSV = () => {
    if (!lastCSVBlob) {
      setSnack({ open: true, message: "No CSV to re-download", severity: "warning" });
      return;
    }
    const url = URL.createObjectURL(lastCSVBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvSnackInfo.filename || `export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // When user clicks Accept on a section (any section title)
  const onAcceptSection = (sectionTitle, orders) => {
    // allow any section (Today, Yesterday, DD/MM/YYYY labels)
    setConfirmPayload({ action: "accept", section: sectionTitle, orders });
    setConfirmOpen(true);
  };

  // helper: convert a sectionTitle ("Today","Yesterday" or "DD/MM/YYYY") into YYYY-MM-DD ISO string
  const sectionTitleToISO = (sectionTitle) => {
    const now = new Date();
    const istNow = new Date(now.getTime() + 19800000);
    const todayStr = istNow.toISOString().substring(0, 10);
    const y = new Date(istNow);
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toISOString().substring(0, 10);

    if (sectionTitle === "Today") return todayStr;
    if (sectionTitle === "Yesterday") return yesterdayStr;

    // expect label format "DD/MM/YYYY" (from formatDate)
    const parts = sectionTitle.split("/");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      if (dd.length && mm.length && yyyy.length) {
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }
    }
    return null;
  };

  // Confirm result (Accept)
  const doConfirm = () => {
    const { action, section, orders } = confirmPayload;
    if (action === "accept") {
      // mark orders accepted in allOrders state (so table updates)
      const acceptedIds = new Set((orders || []).map((o) => o.OrderId).filter(Boolean));
      const updatedAll = allOrders.map((o) => {
        if (acceptedIds.has(o.OrderId)) {
          return { ...o, status: "accepted" };
        }
        return o;
      });
      setAllOrders(updatedAll);

      // persist accepted orders in localStorage under accepted_orders_list (avoid duplicates)
      try {
        const raw = localStorage.getItem("accepted_orders_list");
        const existing = raw ? JSON.parse(raw) : [];
        const existingIds = new Set(existing.map((x) => x.OrderId));
        // ensure CreatedAt exists on the record (take from order if missing)
        const toAdd = (orders || [])
          .filter((o) => !existingIds.has(o.OrderId))
          .map((o) => ({ ...o, status: "accepted", CreatedAt: o.CreatedAt ?? new Date().toISOString() }));
        const merged = [...existing, ...toAdd];
        localStorage.setItem("accepted_orders_list", JSON.stringify(merged));

        // Also update acceptedSections for this sectionTitle using the persisted merged list filtered by section date
        const targetISO = sectionTitleToISO(section);
        const forSection = merged.filter((m) => {
          const dt = parseOrderDate(m) || (m.CreatedAt ? new Date(m.CreatedAt) : null);
          const ds = dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : null;
          return ds === targetISO;
        });

        setAcceptedSections((prev) => ({ ...prev, [section]: forSection }));
      } catch (e) {
        console.warn("persist accepted orders failed", e);
        // fallback: store the accepted orders directly under the section
        setAcceptedSections((prev) => ({ ...prev, [section]: orders.map((o) => ({ ...o, status: "accepted" })) }));
      }

      // show attractive popup with count
      const count = (orders || []).length || 0;
      setAcceptedInfoCount(count);
      setAcceptedInfoOpen(true);

      // ENABLE Create CSV button and remember which section
      setCsvEnabled(true);
      setLastAcceptedSection(section);
    }
    setConfirmOpen(false);
    setConfirmPayload({ action: "", section: "", orders: [] });
  };

  // Create CSV (direct). Uses accepted orders for the given sectionTitle (filters by section date)
  const onCreateCSVSection = (sectionTitle) => {
    const persistedRaw = localStorage.getItem("accepted_orders_list");
    const persisted = persistedRaw ? JSON.parse(persistedRaw) : [];

    const targetISO = sectionTitleToISO(sectionTitle);
    if (!targetISO) {
      setSnack({ open: true, message: "Unable to determine section date for CSV", severity: "warning" });
      return;
    }

    // filter persisted accepted orders to those that match the section date
    const ordersForSection = (persisted || []).filter((o) => {
      const dt = parseOrderDate(o) || (o.CreatedAt ? new Date(o.CreatedAt) : null);
      const ds = dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() + 19800000).toISOString().substring(0, 10) : null;
      return ds === targetISO;
    });

    if (!ordersForSection || !ordersForSection.length) {
      setSnack({ open: true, message: "Please accept the section first", severity: "warning" });
      return;
    }

    const filename = `accepted_${sectionTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    const res = createCSVAndNotifyExpanded(ordersForSection, filename);

    if (res) {
      setSnack({ open: true, message: `CSV created for ${ordersForSection.length} order(s)`, severity: "success" });
    }
  };

  // Section header
  const sectionHeader = (title, list) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          background: "#073763",
          color: "white",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            size="small"
            sx={{ color: "white" }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenSection((prev) => (prev === title ? null : title));
            }}
          >
            {openSection === title ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} />
      </Box>
    );
  };

  // render rows — improved alignment & vertical centering
  const renderRows = (list) =>
    list.map((o, i) => (
      <TableRow
        key={o.OrderId || `${o.AgentCode}-${i}`}
        hover
        sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 } }}
        onClick={() => {
          const statusParam = encodeURIComponent(o.raw?.status ?? o.status ?? "");
          navigate(`/orders?orderId=${o.OrderId}&agentCode=${o.AgentCode}&status=${statusParam}`);
        }}
      >
        <TableCell sx={{ width: 40, pl: 2, verticalAlign: "middle" }}>{i + 1}</TableCell>
        <TableCell sx={{ width: 140, verticalAlign: "middle" }}>{o.SalesRouteCode ?? "N/A"}</TableCell>
        <TableCell sx={{ minWidth: 160, verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {o.RouteName ?? "N/A"}
        </TableCell>
        <TableCell sx={{ width: 140, verticalAlign: "middle" }}>{o.VehichleNo ?? "N/A"}</TableCell>
        <TableCell sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {o.AgentName}
        </TableCell>
        <TableCell sx={{ width: 120, verticalAlign: "middle" }}>{o.AgentCode ?? "N/A"}</TableCell>
        <TableCell sx={{ width: 150, verticalAlign: "middle" }}>
          ₹{" "}
          {Number(o.TotalOrder || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell sx={{ width: 160, pr: 2, textAlign: "center", verticalAlign: "middle" }}>
          {o.status === "accepted" ? (
            <Button
              variant="contained"
              size="small"
              disabled
              sx={{
                background: "linear-gradient(90deg,#28a745,#1e7e34)",
                color: "#fff",
                borderRadius: 6,
                textTransform: "none",
                px: 2,
                py: 0.5,
                boxShadow: "none",
              }}
            >
              Order Accepted
            </Button>
          ) : (
            <Box
              sx={{
                px: 1,
                py: 0.4,
                bgcolor: "#fff3cd",
                color: "#c77e00",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: 13,
                display: "inline-block",
              }}
            >
              प्रलंबित
            </Box>
          )}
        </TableCell>
      </TableRow>
    ));

  // renderSection: show Accept button under table rows for every section with orders
  const renderSection = (title, list) => {
    const isAcceptable = list && list.length > 0; // show Accept for any non-empty section
    return (
      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0 }}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }}>
            {sectionHeader(title, list)}
            {openSection === title ? (
              <>
                {list.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">No Orders</Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableBody>{renderRows(list)}</TableBody>
                  </Table>
                )}

                {/* Accept button for any non-empty section */}
                {isAcceptable && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptSection(title, list);
                      }}
                      sx={{
                        background: "linear-gradient(90deg,#28a745,#1e7e34)",
                        color: "#fff",
                        borderRadius: 6,
                        textTransform: "none",
                        px: 3,
                        boxShadow: "0 10px 24px rgba(46,125,50,0.16)",
                      }}
                    >
                      Accept Orders
                    </Button>
                  </Box>
                )}

                {/* Create CSV button only for the section that was most recently accepted */}
                {csvEnabled && lastAcceptedSection === title && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateCSVSection(title);
                      }}
                      sx={{
                        background: "linear-gradient(90deg,#28a745,#1e7e34)",
                        color: "#fff",
                        borderRadius: 6,
                        textTransform: "none",
                        px: 3,
                        boxShadow: "0 8px 18px rgba(46,125,50,0.12)",
                      }}
                    >
                      Create CSV
                    </Button>
                  </Box>
                )}
              </>
            ) : null}
          </Paper>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f4f7fb" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          "& .MuiDrawer-paper": {
            width: 260,
            background: "linear-gradient(180deg,#073763,#021e3a)",
            color: "white",
          },
        }}
      >
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6">Admin Panel</Typography>
        </Box>

        <Divider sx={{ background: "rgba(255,255,255,0.12)" }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/dashboard")}>
              <ListItemIcon sx={{ color: "white" }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/accepted-orders")}>
              <ListItemIcon sx={{ color: "white" }}>
                <FileDownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Accepted Orders" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/create-csv")}>
              <ListItemIcon sx={{ color: "white" }}>
                <GetAppIcon />
              </ListItemIcon>
              <ListItemText primary="Generate CSV" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* MAIN AREA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <AppBar position="sticky" elevation={1} sx={{ background: "white", color: "#073763" }}>
          <Toolbar sx={{ py: 2.5, px: 3 }}>
            <Box component="img" src={logo} sx={{ height: 54, mr: 3 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "700" }}>
                श्री हनुमान सहकारी दूध संस्था, यळगुड.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tal: Hatkangale, Dist. Kolhapur (Maharashtra)
              </Typography>
            </Box>

            <Tooltip title="Refresh">
              <IconButton onClick={() => refreshData()} sx={{ borderRadius: 2 }}>
                <RefreshIcon sx={{ color: "#073763", fontSize: 26 }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 4 }}>
          <Paper elevation={6} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#073763", borderLeft: "6px solid #073763", pl: 1.5 }}>
                Requirements
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel id="route-filter-label">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FilterListIcon sx={{ fontSize: 16 }} /> Filter by Route
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="route-filter-label"
                    label="Filter by Route"
                    value={selectedRouteKey}
                    onChange={(e) => setSelectedRouteKey(e.target.value)}
                    sx={{ minWidth: 260 }}
                  >
                    <MenuItem value="">All Routes</MenuItem>
                    {routes.map((r) => (
                      <MenuItem key={r.key} value={r.key}>
                        {r.name} {r.code ? `(${r.code})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="date"
                  size="small"
                  label="From Date"
                  InputLabelProps={{ shrink: true }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <TextField
                  type="date"
                  size="small"
                  label="To Date"
                  InputLabelProps={{ shrink: true }}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : fetchError ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Could not load orders: {fetchError}
                </Typography>
                <Button variant="contained" onClick={() => refreshData()}>
                  Try Again
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#f0f4f9" }}>
                      <TableCell sx={{ fontWeight: "bold", width: 40  }}>अ. क्रं</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 140 }}>रूट कोड</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>रूट नाव</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 140 }}>वाहन क्रमांक</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>एजंट नाव</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 120 }}>एजंट कोड</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 150 }}>एकूण ऑर्डर (₹)</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 160, textAlign: "center", pr: 2 }}>स्थिती</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {renderSection("Today", todayOrders)}
                    {renderSection("Yesterday", yesterdayOrders)}
                    {Object.keys(olderOrders).map((date) => renderSection(date, olderOrders[date]))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>

      {/* normal snack */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>

      {/* CSV success snack */}
      <Snackbar
        open={csvSnackOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setCsvSnackOpen(false)}
        autoHideDuration={9000}
      >
        <Alert
          severity="success"
          sx={{ display: "flex", alignItems: "center", gap: 1, boxShadow: 6 }}
          action={
            <>
              <Button startIcon={<DownloadIcon />} size="small" color="inherit" onClick={() => redownloadLastCSV()}>
                Download again
              </Button>
              <IconButton size="small" aria-label="close" color="inherit" onClick={() => setCsvSnackOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          <strong>CSV Created —</strong>&nbsp; {csvSnackInfo.count} order(s) exported as <em>{csvSnackInfo.filename}</em>
        </Alert>
      </Snackbar>

      {/* Confirm Accept */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to accept {confirmPayload.orders?.length || 0} order(s) for {confirmPayload.section}. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={() => doConfirm()} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
