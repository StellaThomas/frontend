// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";

// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import GetAppIcon from "@mui/icons-material/GetApp";

// export default function CSVGen() {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [csvData, setCSVData] = useState(null);
//   const [previewOpen, setPreviewOpen] = useState(false);

//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "error",
//   });

//   // 🌟 Handle Preview Button Click
//   const handlePreviewCSV = () => {
//     setPreviewOpen(true);
//   };

//   // Fetch Accepted Orders
//   const fetchOrders = async () => {
//     if (!fromDate || !toDate) {
//       setSnack({
//         open: true,
//         message: "Please select both From Date and To Date",
//         severity: "error",
//       });
//       return;
//     }

//     if (new Date(fromDate) > new Date(toDate)) {
//       setSnack({
//         open: true,
//         message: "From Date should be earlier than To Date",
//         severity: "error",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("📡 Fetching accepted orders from API");
//       const response = await fetch("http://192.168.1.4:8002/api/orders/Status/Accepted");
//       const result = await response.json();

//       console.log("✅ API Response received:", result);

//       if (result.success && result.data) {
//         const filteredOrders = result.data.filter((order) => {
//           const orderDate = new Date(order.createdAt);
//           return (
//             orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)
//           );
//         });

//         console.log(`📦 Total filtered orders: ${filteredOrders.length}`);

//         const transformedData = filteredOrders.map((order) => {
//           const dt = new Date(order.createdAt);

//           // Extract all item codes and quantities as arrays
//           const itemCodes = order.itemInfo.map((i) => i.itemCode);
//           const quantities = order.itemInfo.map((i) => i.quantity);

//           console.log(`Order ${order._id}: Items=${itemCodes.join(",")}, Qty=${quantities.join(",")}`);

//           return {
//             agentCode: order.agentCode ?? "N/A",
//             salesRouteCode: order.agentDetails?.SalesRouteCode ?? "N/A",
//             itemCode: itemCodes.join(";"), // Keep as array representation
//             quantity: quantities.join(";"), // Keep as array representation
//             orderDate: dt.toISOString().split("T")[0],
//             orderTime: dt.toTimeString().split(" ")[0],
//             totalOrder: order.TotalOrder ?? 0,
//             status: order.status,
//           };
//         });

//         if (transformedData.length === 0) {
//           console.warn("⚠️  No orders found in selected range");
//           setSnack({
//             open: true,
//             message: "No accepted orders found in selected range",
//             severity: "warning",
//           });
//           setCSVData(null);
//         } else {
//           console.log(`✨ Transformed ${transformedData.length} orders for CSV`);
//           setCSVData(transformedData);
//           setSnack({
//             open: true,
//             message: `${transformedData.length} accepted orders fetched successfully`,
//             severity: "success",
//           });
//         }
//       } else {
//         console.error("❌ Failed to fetch orders:", result.message);
//         setSnack({
//           open: true,
//           message: "Failed to fetch orders: " + (result.message || "Unknown error"),
//           severity: "error",
//         });
//       }
//     } catch (err) {
//       console.error("❌ Fetch error:", err);
//       setSnack({
//         open: true,
//         message: "Error: " + err.message,
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // CSV Generator
//   const generateCSVString = () => {
//     if (!csvData) return "";

//     const headers = ["agentCode", "salesRouteCode", "itemCode", "quantity", "orderDate", "orderTime", "totalOrder", "status"];

//     return [
//       headers.join(","),
//       ...csvData.map((row) =>
//         headers
//           .map((h) => '"' + String(row[h] ?? "").replace(/"/g, '""') + '"')
//           .join(",")
//       ),
//     ].join("\n");
//   };

//   // Download CSV
//   const handleDownloadCSV = () => {
//     const csvString = generateCSVString();
//     const file = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(file);
//     link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     setSnack({
//       open: true,
//       message: "CSV downloaded successfully",
//       severity: "success",
//     });
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundImage: "url('/bg.jpg')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="md">
//         <Card elevation={10} sx={{ borderRadius: 4, backgroundColor: "white" }}>
//           <CardContent sx={{ p: 4 }}>
//             <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0b5394", mb: 3, textAlign: "center" }}>
//               Generate CSV of Orders
//             </Typography>

//             {/* Dates */}
//             <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
//               <TextField
//                 label="From Date"
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{ flex: 1, minWidth: 200 }}
//               />
//               <TextField
//                 label="To Date"
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{ flex: 1, minWidth: 200 }}
//               />
//             </Box>

//             {/* Generate CSV */}
//             <Button
//               variant="contained"
//               fullWidth
//               onClick={fetchOrders}
//               disabled={loading}
//               sx={{
//                 borderRadius: 3,
//                 py: 1.3,
//                 mb: 3,
//                 fontWeight: "bold",
//                 background: "linear-gradient(135deg, #0b5394, #1976d2)",
//               }}
//             >
//               {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Generate CSV"}
//             </Button>

//             {/* Preview & Download */}
//             {csvData && (
//               <Box sx={{ display: "flex", gap: 2 }}>
//                 <Button
//                   variant="outlined"
//                   fullWidth
//                   startIcon={<VisibilityIcon />}
//                   onClick={handlePreviewCSV}
//                 >
//                   Preview CSV
//                 </Button>

//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<FileDownloadIcon />}
//                   onClick={handleDownloadCSV}
//                   sx={{ background: "linear-gradient(135deg, #28a745, #20c997)" }}
//                 >
//                   Download CSV
//                 </Button>
//               </Box>
//             )}
//           </CardContent>
//         </Card>

//         {/* Preview Modal */}
//         <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
//           <DialogTitle sx={{ color: "#0b5394", fontWeight: "bold" }}>CSV Preview</DialogTitle>
//           <DialogContent>
//             <TableContainer component={Paper}>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "#0b5394" }}>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Agent Code</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Sales Route Code</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Item Code(s)</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Quantity(ies)</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Order Date</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Order Time</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Total Order</TableCell>
//                     <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Status</TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {csvData?.map((row, i) => (
//                     <TableRow key={i}>
//                       <TableCell align="center">{row.agentCode}</TableCell>
//                       <TableCell align="center">{row.salesRouteCode}</TableCell>
//                       <TableCell align="center">{row.itemCode}</TableCell>
//                       <TableCell align="center">{row.quantity}</TableCell>
//                       <TableCell align="center">{row.orderDate}</TableCell>
//                       <TableCell align="center">{row.orderTime}</TableCell>
//                       <TableCell align="center">{row.totalOrder?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0"}</TableCell>
//                       <TableCell align="center">{row.status}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </DialogContent>

//           <DialogActions>
//             <Button onClick={() => setPreviewOpen(false)} sx={{ color: "#0b5394" }}>Close</Button>
//             <Button variant="contained" startIcon={<GetAppIcon />} onClick={handleDownloadCSV} sx={{ background: "#28a745" }}>
//               Download
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Snackbar */}
//         <Snackbar
//           open={snack.open}
//           autoHideDuration={3000}
//           onClose={() => setSnack({ ...snack, open: false })}
//         >
//           <Alert severity={snack.severity} variant="filled">
//             {snack.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </Box>
//   );
// }






























































import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GetAppIcon from "@mui/icons-material/GetApp";

/**
 * CSVGen reads accepted orders from localStorage key 'accepted_orders_list',
 * filters by selected from/to dates (YYYY-MM-DD), expands items so each CSV
 * row is a single item, and allows Preview + Download.
 */
export default function CSVGen() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvRows, setCsvRows] = useState([]); // array of expanded rows (one per item)
  const [previewOpen, setPreviewOpen] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // -----------------------------
  // Helpers: normalize and IST
  // -----------------------------
  // Try to normalize many possible createdAt formats to ISO string
  const normalizeCreatedAt = (raw) => {
    if (!raw) return new Date().toISOString();
    const candidates = [
      raw.CreatedAt,
      raw.createdAt,
      raw.orderDate,
      raw.Created_Date,
      raw.date,
      raw.raw?.CreatedAt,
      raw.raw?.createdAt,
      raw.raw?.orderDate,
      raw.raw?.date,
    ].filter(Boolean);

    for (const c of candidates) {
      // numeric timestamps (seconds or ms)
      if (typeof c === "number") {
        const ms = c < 1e12 ? c * 1000 : c;
        const dt = new Date(ms);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString();
      }
      // numeric strings
      try {
        const maybeNum = Number(String(c).trim());
        if (!Number.isNaN(maybeNum)) {
          const ms = maybeNum < 1e12 ? maybeNum * 1000 : maybeNum;
          const dt2 = new Date(ms);
          if (!Number.isNaN(dt2.getTime())) return dt2.toISOString();
        }
      } catch {}
      const dt = new Date(c);
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }

    // fallback
    if (raw.CreatedAt) {
      const dt = new Date(raw.CreatedAt);
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }
    return new Date().toISOString();
  };

  // Convert ISO or other date -> YYYY-MM-DD in IST
  const toISTDateString = (isoOrDate) => {
    if (!isoOrDate) return null;
    const utc = new Date(isoOrDate);
    if (Number.isNaN(utc.getTime())) return null;
    const ist = new Date(utc.getTime() + 19800000); // +5:30
    return ist.toISOString().substring(0, 10);
  };

  const toISTDateTimeString = (isoOrDate) => {
    if (!isoOrDate) return null;
    const utc = new Date(isoOrDate);
    if (Number.isNaN(utc.getTime())) return null;
    const ist = new Date(utc.getTime() + 19800000);
    // return date and time
    return {
      date: ist.toISOString().substring(0, 10),
      time: ist.toTimeString().split(" ")[0],
    };
  };

  // -----------------------------
  // Load & transform from localStorage
  // -----------------------------
  const fetchFromLocalStorage = async () => {
    if (!fromDate || !toDate) {
      setSnack({ open: true, message: "Select both From and To dates", severity: "error" });
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setSnack({ open: true, message: "From Date must be earlier than or equal to To Date", severity: "error" });
      return;
    }

    setLoading(true);

    try {
      const raw = localStorage.getItem("accepted_orders_list");
      const list = raw ? JSON.parse(raw) : [];

      // Normalize orders and expand each item
      const expandedRows = [];

      (list || []).forEach((order) => {
        const createdIso = normalizeCreatedAt(order);
        const { date: orderDate, time: orderTime } = toISTDateTimeString(createdIso) || { date: "", time: "" };

        // Filter by date range (inclusive). using YYYY-MM-DD strings
        if (!(orderDate >= fromDate && orderDate <= toDate)) return;

        // get agent and route info from common places
        const agentCode = order.AgentCode ?? order.agentCode ?? order.agent?.code ?? "N/A";
        const salesRouteCode =
          order.SalesRouteCode ??
          order.salesRouteCode ??
          order.agentDetails?.SalesRouteCode ??
          order.routeCode ??
          "";

        // itemInfo can vary. try to normalize
        const items = Array.isArray(order.itemInfo)
          ? order.itemInfo
          : Array.isArray(order.items)
          ? order.items
          : order.raw?.itemInfo ?? [];

        if (!Array.isArray(items) || items.length === 0) {
          // push a row even if no items (so user sees the order)
          expandedRows.push({
            agentCode,
            salesRouteCode,
            itemCode: "N/A",
            quantity: 0,
            orderDate,
            orderTime,
            totalOrder: order.TotalOrder ?? order.totalPrice ?? 0,
            status: order.status ?? "accepted",
            orderId: order.OrderId ?? order.orderId ?? order.id ?? "",
          });
        } else {
          items.forEach((it) => {
            const itemCode = it.itemCode ?? it.code ?? it.sku ?? String(it.name ?? "UNKNOWN");
            const quantity = it.quantity ?? it.qty ?? it.Qty ?? 0;
            expandedRows.push({
              agentCode,
              salesRouteCode,
              itemCode,
              quantity,
              orderDate,
              orderTime,
              totalOrder: order.TotalOrder ?? order.totalPrice ?? 0,
              status: order.status ?? "accepted",
              orderId: order.OrderId ?? order.orderId ?? order.id ?? "",
            });
          });
        }
      });

      if (expandedRows.length === 0) {
        setCsvRows([]);
        setSnack({ open: true, message: "No accepted orders found in selected range", severity: "warning" });
      } else {
        // optional: sort by orderDate desc then time desc
        expandedRows.sort((a, b) => {
          if (a.orderDate === b.orderDate) return b.orderTime.localeCompare(a.orderTime);
          return b.orderDate.localeCompare(a.orderDate);
        });
        setCsvRows(expandedRows);
        setSnack({ open: true, message: `${expandedRows.length} rows ready for CSV`, severity: "success" });
      }
    } catch (err) {
      console.error("fetchFromLocalStorage error", err);
      setSnack({ open: true, message: "Error reading accepted orders: " + (err.message || err), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // CSV generation (one row per item)
  // -----------------------------
  const generateCSVString = () => {
    if (!csvRows || csvRows.length === 0) return "";

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

    const lines = [
      headers.join(","),
      ...csvRows.map((r) =>
        headers
          .map((h) => {
            const val = r[h.charAt(0).toLowerCase() + h.slice(1)] ?? r[h] ?? "";
            // make sure to escape quotes
            return `"${String(val ?? "").replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    // Add BOM for Excel compatibility
    return "\uFEFF" + lines.join("\n");
  };

  const handleDownloadCSV = () => {
    const csvString = generateCSVString();
    if (!csvString) {
      setSnack({ open: true, message: "No CSV data to download", severity: "error" });
      return;
    }

    const file = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnack({ open: true, message: "CSV downloaded", severity: "success" });
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "#f6f8fb",
      }}
    >
      <Container maxWidth="md">
        <Card elevation={6} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
              Generate CSV from Accepted Orders
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <TextField
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 160 }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={fetchFromLocalStorage}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Load Orders for CSV"}
            </Button>

            {csvRows && csvRows.length > 0 && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button startIcon={<VisibilityIcon />} variant="outlined" fullWidth onClick={() => setPreviewOpen(true)}>
                  Preview CSV
                </Button>
                <Button
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  fullWidth
                  onClick={handleDownloadCSV}
                  sx={{ background: "linear-gradient(135deg,#28a745,#20c997)" }}
                >
                  Download CSV
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>CSV Preview (one row per item)</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>OrderId</TableCell>
                  <TableCell>AgentCode</TableCell>
                  <TableCell>SalesRouteCode</TableCell>
                  <TableCell>ItemCode</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>OrderDate</TableCell>
                  <TableCell>OrderTime</TableCell>
                  <TableCell>TotalOrder</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {csvRows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.orderId}</TableCell>
                    <TableCell>{r.agentCode}</TableCell>
                    <TableCell>{r.salesRouteCode}</TableCell>
                    <TableCell>{r.itemCode}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.orderDate}</TableCell>
                    <TableCell>{r.orderTime}</TableCell>
                    <TableCell>{Number(r.totalOrder || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<GetAppIcon />} onClick={handleDownloadCSV}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

