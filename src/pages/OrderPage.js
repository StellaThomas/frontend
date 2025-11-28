

// // OrdersPage.jsx (updated - fixed input remount / typing issue)
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
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
//   TextField,
//   Select,
//   MenuItem,
//   Grid,
//   IconButton,
//   useTheme,
//   useMediaQuery,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import logo from "../assets/logo.png";
// import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

// export default function OrdersPage() {
//   const navigate = useNavigate();
//   const query = useQuery();
//   const agentCode = query.get("agentCode");
//   const orderId = query.get("orderId");

//   const [orders, setOrders] = useState([]);
//   const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
//   const [agent, setAgent] = useState({});
//   const [orderMeta, setOrderMeta] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
//   const [csvContent, setCsvContent] = useState("");

//   const theme = useTheme();
//   const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

//   // fetch agent
//   const fetchAgent = async (agentId) => {
//     try {
//       setLoading(true);
//       // const response = await axios.get(`http://192.168.1.50:8002/api/agent/${agentId}`);
//       const response = await axios.get(`http://122.169.40.118:8002/api/agent/${agentId}`);
//       setAgent(response.data.data || {});
//       setError(null);
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (agentCode) fetchAgent(agentCode);
//   }, [agentCode]);

//   // Helper to create a stable uid for each item
//   const makeStableUid = (idx, item) => {
//     // prefer item.itemCode if present, otherwise combine index + orderId
//     const code = item.itemCode || item.itemCode === 0 ? String(item.itemCode) : `idx${idx}`;
//     return `${orderId ?? "noorder"}_${code}_${idx}`;
//   };

//   useEffect(() => {
//     const loadOrderById = async () => {
//       try {
//         setLoading(true);
//         // const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
//          const response = await fetch(`http://122.169.40.118:8002/api/orders/${orderId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const result = await response.json();

//         if (result.data) {
//           setOrderMeta(result.data);
//         } else {
//           setOrderMeta(null);
//         }

//         // map items and add stable _uid and ensure acceptedQuantity is a string for smooth typing
//         const items = (result.data?.itemInfo || []).map((item, idx) => {
//           const accepted = item.acceptedQty ?? item.acceptedQuantity ?? 0;
//           return {
//             ...item,
//             _uid: makeStableUid(idx, item),
//             acceptedQuantity: accepted === null ? "" : String(accepted), // store as string while editing
//             status: item.status ?? "Pending",
//           };
//         });

//         setOrders(items);
//       } catch (err) {
//         setSnack({ open: true, message: "Failed to load order", severity: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) loadOrderById();
//   }, [orderId]);

//   // Controlled handler — store the raw string so typing isn't interrupted
//   const handleAcceptedChange = (rowIndex, rawValue) => {
//     // allow only digits (or empty) — preserve input as typed
//     const allowed = rawValue === "" ? "" : rawValue.replace(/[^0-9]/g, "");
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };
//       item.acceptedQuantity = allowed;
//       const acceptedNumber = Number(allowed || 0);
//       const requiredQty = Number(item.quantity || 0);

//       if (item.status !== "Rejected") {
//         if (acceptedNumber !== requiredQty) {
//           item.status = "Modified";
//         } else {
//           item.status = "Accepted";
//         }
//       }
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const handleStatusChange = (rowIndex, newStatus) => {
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };

//       if (newStatus === "Accepted") {
//         item.acceptedQuantity = String(Number(item.quantity || 0));
//       } else if (newStatus === "Rejected") {
//         item.acceptedQuantity = "0";
//       }

//       item.status = newStatus;
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   // Controlled StatusDropdown (no internal derived state)
//   const StatusDropdown = ({ status, rowIndex }) => {
//     const getColor = (value) => {
//       switch (value) {
//         case "Pending":
//           return { bg: "#FFF3CD", color: "#856404" };
//         case "Accepted":
//           return { bg: "#D4EDDA", color: "#155724" };
//         case "Modified":
//           return { bg: "#CCE5FF", color: "#004085" };
//         case "Rejected":
//           return { bg: "#F8D7DA", color: "#721C24" };
//         default:
//           return { bg: "#E2E3E5", color: "#383D41" };
//       }
//     };

//     const { bg, color } = getColor(status);

//     return (
//       <Select
//         value={status || "Pending"}
//         onChange={(e) => handleStatusChange(rowIndex, e.target.value)}
//         size="small"
//         fullWidth={isSmDown}
//         sx={{
//           backgroundColor: bg,
//           color,
//           fontWeight: "bold",
//           borderRadius: "10px",
//           "& .MuiOutlinedInput-notchedOutline": { border: "none" },
//           "& .MuiSelect-select": { py: "6px", px: "10px" },
//         }}
//       >
//         <MenuItem value="Pending">Pending</MenuItem>
//         <MenuItem value="Accepted">Accepted</MenuItem>
//         <MenuItem value="Modified">Modified</MenuItem>
//         <MenuItem value="Rejected">Rejected</MenuItem>
//       </Select>
//     );
//   };

//   // Memoize columns WITHOUT depending on `orders` so cell renderers remain stable
//   const columns = useMemo(
//     () => [
//       { header: "Sr. No", cell: ({ row }) => row.index + 1 },
//       { header: "Item Code", accessorKey: "itemCode" },
//       { header: "Item Name", accessorKey: "itemName" },
//       { header: "Required Qty", accessorKey: "quantity" },
//       {
//         header: "Accepted Qty",
//         accessorKey: "acceptedQuantity",
//         cell: ({ row }) => {
//           // row.index is stable for the row model
//           return (
//             <TextField
//               type="text" // use "text" to avoid some browser number quirks; we validate/filter digits manually
//               size="small"
//               value={row.original.acceptedQuantity ?? ""}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 // allow only digits or empty string
//                 if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
//               }}
//               inputProps={{ inputMode: "numeric", style: { textAlign: "center", width: 100 } }}
//             />
//           );
//         },
//       },
//       {
//         header: "Rate (₹)",
//         accessorKey: "price",
//         cell: ({ row }) =>
//           `₹ ${parseFloat(row.original.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//       },
//       {
//         header: "Total (₹)",
//         accessorKey: "totalPrice",
//         cell: ({ row }) => {
//           const rate = Number(row.original.price || 0);
//           const accepted = Number(row.original.acceptedQuantity || 0);
//           const total = rate * accepted;
//           return `₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
//         },
//       },
//       {
//         header: "Status",
//         accessorKey: "status",
//         cell: ({ row }) => <StatusDropdown status={row.original.status} rowIndex={row.index} />,
//       },
//     ],
//     [isSmDown] // no `orders` here
//   );

//   // Important: tell react-table to use our stable row ids by providing each row data with '_uid'
//   const table = useReactTable({
//     data: orders,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     // react-table will create ids; since our data has stable _uid values, rows won't remount unnecessarily
//   });

//   const grandTotal = orders.reduce((sum, o) => {
//     const rate = Number(o.price || 0);
//     const accepted = Number(o.acceptedQuantity || 0);
//     return sum + rate * accepted;
//   }, 0);

//   if (loading)
//     return (
//       <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
//         <CircularProgress />
//       </Box>
//     );

//   const csvEscape = (val) => {
//     if (val === null || val === undefined) return "";
//     const s = String(val);
//     if (/[",\n\r]/.test(s)) {
//       return '"' + s.replace(/"/g, '""') + '"';
//     }
//     return s;
//   };

//   const formatDateTime = (dateInput) => {
//     try {
//       if (!dateInput) return "";
//       const d = new Date(dateInput);
//       if (Number.isNaN(d.getTime())) return "";
//       return d.toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//       });
//     } catch (e) {
//       return "";
//     }
//   };

//   const buildCsvString = () => {
//     const generatedAt = formatDateTime(new Date());
//     const orderCreatedAt = orderMeta?.createdAt ? formatDateTime(orderMeta.createdAt) : "";
//     const orderStatus = orderMeta?.status ?? "";

//     const orderLabels = ["Generated At", "Order ID", "Order Created At", "Order Status", "Agent Code", "Agent Name", "Route"];
//     const orderValues = [generatedAt, orderId || "", orderCreatedAt, orderStatus, agentCode || "", agent.AgentName || "", agent.RouteName || ""];

//     const itemLabels = [];
//     const itemValues = [];

//     orders.forEach((it, index) => {
//       const i = index + 1;
//       itemLabels.push(`Item${i}_Code`, `Item${i}_Name`, `Item${i}_RequiredQty`, `Item${i}_AcceptedQty`, `Item${i}_Rate`, `Item${i}_Total`, `Item${i}_Status`);
//       const rate = Number(it.price || 0);
//       const accepted = Number(it.acceptedQuantity || 0);
//       const total = rate * accepted;
//       itemValues.push(it.itemCode ?? "", it.itemName ?? "", it.quantity ?? 0, it.acceptedQuantity ?? 0, rate.toFixed(2), total.toFixed(2), it.status ?? "");
//     });

//     itemLabels.push("Grand_Total");
//     itemValues.push(grandTotal.toFixed(2));

//     const headerRow = [...orderLabels, ...itemLabels].map(csvEscape).join(",");
//     const valueRow = [...orderValues, ...itemValues].map(csvEscape).join(",");

//     return `${headerRow}\r\n${valueRow}`;
//   };

//   const downloadCsv = (csvString, filename) => {
//     const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   };

//   const handleAcceptOrder = async () => {
//     try {
//       const payload = {
//         orderId,
//         items: orders.map((item) => ({
//           itemCode: item.itemCode,
//           acceptedQuantity: Number(item.acceptedQuantity || 0),
//           price: item.price,
//           status: item.status,
//         })),
//         status: "Accepted",
//       };

//       // const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
//       const response = await fetch(`http://122.169.40.118:8002/api/orders/${orderId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSnack({ open: true, message: "Order updated successfully!", severity: "success" });

//         const csvStr = buildCsvString();
//         setCsvContent(csvStr);

//         const ts = new Date().toISOString().replace(/[:.]/g, "-");
//         const filename = `order-${orderId || "unknown"}-${ts}.csv`;

//         downloadCsv(csvStr, filename);
//         setCsvPreviewOpen(true);
//       } else {
//         setSnack({ open: true, message: result.message || "Failed to update order", severity: "error" });
//       }
//     } catch (err) {
//       setSnack({ open: true, message: "Failed to update order", severity: "error" });
//     }
//   };

//   // UI render
//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394", borderBottom: "1px solid #ddd" }}>
//         <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
//           <IconButton edge="start" onClick={() => navigate(-1)} aria-label="back" sx={{ mr: 1 }}>
//             <ArrowBackIcon sx={{ color: "#0b5394" }} />
//           </IconButton>
//           <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 40, sm: 64, md: 80 }, mr: 2 }} />
//           <Box sx={{ flexGrow: 1 }}>
//             <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
//               श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
//             </Typography>
//             <Typography variant="body2" sx={{ color: "#0b5394", fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
//               Tal: Hatkangale, Dist. Kolhapur (Maharastra-27) 416236 (FSSC 22000 Certified Society)
//             </Typography>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Agent Details */}
//       <Container sx={{ mt: 2 }}>
//         <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 1, sm: 2 } }}>
//           <Box sx={{ background: "linear-gradient(135deg, #0b5394 0%, #1e88e5 100%)", p: 1, borderRadius: 1 }}>
//             <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>📋 Details of Receiver (Billed To & Shipped To)</Typography>
//           </Box>
//           <Box sx={{ p: { xs: 1, sm: 3 } }}>
//             <Grid container spacing={2}>
//               {[
//                 [
//                   { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//                 ],
//                 [
//                   { label: "रूट नाव", value: agent.RouteName, key: "RouteName" },
//                 ],
//                 [
//                   { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//                 ],
//               ].map((column, columnIndex) => (
//                 <Grid item xs={12} md={4} key={columnIndex}>
//                   <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", background: "white" }}>
//                     {column.map((item, itemIndex) => (
//                       <Box
//                         key={item.key}
//                         sx={{
//                           p: 1,
//                           borderBottom: itemIndex < column.length - 1 ? "1px solid #f0f0f0" : "none",
//                           background: itemIndex % 2 === 0 ? "#fafbfc" : "white",
//                         }}
//                       >
//                         <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0b5394", fontSize: "0.85rem" }}>
//                           {item.label}
//                         </Typography>
//                         <Typography variant="body1" sx={{ fontWeight: 500, color: "#2c3e50", fontSize: "0.95rem" }}>
//                           {item.value || "N/A"}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         </Paper>
//       </Container>

//       {/* Order Details */}
//       <Container sx={{ mt: 2, pb: 4 }}>
//         <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
//           <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", mb: 2 }}>
//             Order Details
//           </Typography>

//           <TableContainer sx={{ overflowX: "auto" }}>
//             <Table size="small">
//               <TableHead>
//                 {table.getHeaderGroups().map((hg) => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map((header) => (
//                       <TableCell key={header.id} sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHead>

//               <TableBody>
//                 {table.getRowModel().rows.map((row) => (
//                   // react-table's row.id is stable; row.original._uid exists in data
//                   <TableRow key={row.original._uid ?? row.id}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}

//                 <TableRow>
//                   {table.getHeaderGroups()[0].headers.map((header, index) => (
//                     <TableCell key={index}>
//                       {header.column.columnDef.accessorKey === "totalPrice" ? (
//                         <Typography sx={{ fontWeight: "bold", color: "#0b5394" }}>
//                           ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                         </Typography>
//                       ) : index === 0 ? (
//                         <Typography sx={{ fontWeight: "bold" }}>Grand Total:</Typography>
//                       ) : (
//                         ""
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
//             <Button
//               variant="outlined"
//               color="primary"
//               onClick={() => {
//                 const csvStr = buildCsvString();
//                 setCsvContent(csvStr);
//                 setCsvPreviewOpen(true);
//               }}
//             >
//               Preview CSV
//             </Button>

//             <Button variant="contained" color="success" onClick={handleAcceptOrder} sx={{ background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)", fontWeight: 600, px: 3 }}>
//               ✅ Accept Order
//             </Button>
//           </Box>
//         </Paper>
//       </Container>

//       <Snackbar open={snack.open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={() => setSnack({ ...snack, open: false })}>
//         <Alert severity={snack.severity} variant="filled" sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}>
//           {snack.message}
//         </Alert>
//       </Snackbar>

//       <Dialog open={csvPreviewOpen} onClose={() => setCsvPreviewOpen(false)} maxWidth="md" fullWidth>
//         <DialogTitle>CSV Preview</DialogTitle>
//         <DialogContent>
//           <Box component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.9rem" }}>
//             {csvContent}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setCsvPreviewOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }






























































































// // OrdersPage.jsx (updated - simplified success dialog: only message + OK button)
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
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
//   TextField,
//   Select,
//   MenuItem,
//   Grid,
//   IconButton,
//   useTheme,
//   useMediaQuery,
//   Dialog,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import logo from "../assets/logo.png";
// import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

// export default function OrdersPage() {
//   const navigate = useNavigate();
//   const query = useQuery();
//   const agentCode = query.get("agentCode");
//   const orderId = query.get("orderId");

//   const [orders, setOrders] = useState([]);
//   const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
//   const [agent, setAgent] = useState({});
//   const [orderMeta, setOrderMeta] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Dialog state for success popup (only message + OK)
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   const theme = useTheme();
//   const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

//   const BASE_URL = "http://122.169.40.118:8002/api";

//   // fetch agent
//   const fetchAgent = async (agentId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${BASE_URL}/agent/${agentId}`);
//       setAgent(response.data.data || {});
//       setError(null);
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (agentCode) fetchAgent(agentCode);
//   }, [agentCode]);

//   // stable uid
//   const makeStableUid = (idx, item) => {
//     const code = item.itemCode || item.itemCode === 0 ? String(item.itemCode) : `idx${idx}`;
//     return `${orderId ?? "noorder"}_${code}_${idx}`;
//   };

//   useEffect(() => {
//     const loadOrderById = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const result = await response.json();

//         if (result.data) {
//           setOrderMeta(result.data);
//         } else {
//           setOrderMeta(null);
//         }

//         const items = (result.data?.itemInfo || []).map((item, idx) => {
//           const accepted = item.acceptedQty ?? item.acceptedQuantity ?? 0;
//           return {
//             ...item,
//             _uid: makeStableUid(idx, item),
//             acceptedQuantity: accepted === null ? "" : String(accepted),
//             status: item.status ?? "Pending",
//           };
//         });

//         setOrders(items);
//       } catch (err) {
//         setSnack({ open: true, message: "Failed to load order", severity: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) loadOrderById();
//   }, [orderId]);

//   // handlers
//   const handleAcceptedChange = (rowIndex, rawValue) => {
//     const allowed = rawValue === "" ? "" : rawValue.replace(/[^0-9]/g, "");
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };
//       item.acceptedQuantity = allowed;
//       const acceptedNumber = Number(allowed || 0);
//       const requiredQty = Number(item.quantity || 0);

//       if (item.status !== "Rejected") {
//         if (acceptedNumber !== requiredQty) {
//           item.status = "Modified";
//         } else {
//           item.status = "Accepted";
//         }
//       }
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const handleStatusChange = (rowIndex, newStatus) => {
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };

//       if (newStatus === "Accepted") {
//         item.acceptedQuantity = String(Number(item.quantity || 0));
//       } else if (newStatus === "Rejected") {
//         item.acceptedQuantity = "0";
//       }

//       item.status = newStatus;
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const StatusDropdown = ({ status, rowIndex }) => {
//     const getColor = (value) => {
//       switch (value) {
//         case "Pending":
//           return { bg: "#FFF3CD", color: "#856404" };
//         case "Accepted":
//           return { bg: "#D4EDDA", color: "#155724" };
//         case "Modified":
//           return { bg: "#CCE5FF", color: "#004085" };
//         case "Rejected":
//           return { bg: "#F8D7DA", color: "#721C24" };
//         default:
//           return { bg: "#E2E3E5", color: "#383D41" };
//       }
//     };

//     const { bg, color } = getColor(status);

//     return (
//       <Select
//         value={status || "Pending"}
//         onChange={(e) => handleStatusChange(rowIndex, e.target.value)}
//         size="small"
//         fullWidth={isSmDown}
//         sx={{
//           backgroundColor: bg,
//           color,
//           fontWeight: "bold",
//           borderRadius: "10px",
//           "& .MuiOutlinedInput-notchedOutline": { border: "none" },
//           "& .MuiSelect-select": { py: "6px", px: "10px" },
//         }}
//       >
//         <MenuItem value="Pending">Pending</MenuItem>
//         <MenuItem value="Accepted">Accepted</MenuItem>
//         <MenuItem value="Modified">Modified</MenuItem>
//         <MenuItem value="Rejected">Rejected</MenuItem>
//       </Select>
//     );
//   };

//   const columns = useMemo(
//     () => [
//       { header: "Sr. No", cell: ({ row }) => row.index + 1 },
//       { header: "Item Code", accessorKey: "itemCode" },
//       { header: "Item Name", accessorKey: "itemName" },
//       { header: "Required Qty", accessorKey: "quantity" },
//       {
//         header: "Accepted Qty",
//         accessorKey: "acceptedQuantity",
//         cell: ({ row }) => {
//           return (
//             <TextField
//               type="text"
//               size="small"
//               value={row.original.acceptedQuantity ?? ""}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
//               }}
//               inputProps={{ inputMode: "numeric", style: { textAlign: "center", width: 100 } }}
//             />
//           );
//         },
//       },
//       {
//         header: "Rate (₹)",
//         accessorKey: "price",
//         cell: ({ row }) =>
//           `₹ ${parseFloat(row.original.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//       },
//       {
//         header: "Total (₹)",
//         accessorKey: "totalPrice",
//         cell: ({ row }) => {
//           const rate = Number(row.original.price || 0);
//           const accepted = Number(row.original.acceptedQuantity || 0);
//           const total = rate * accepted;
//           return `₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
//         },
//       },
//       {
//         header: "Status",
//         accessorKey: "status",
//         cell: ({ row }) => <StatusDropdown status={row.original.status} rowIndex={row.index} />,
//       },
//     ],
//     [isSmDown]
//   );

//   const table = useReactTable({
//     data: orders,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   const grandTotal = orders.reduce((sum, o) => {
//     const rate = Number(o.price || 0);
//     const accepted = Number(o.acceptedQuantity || 0);
//     return sum + rate * accepted;
//   }, 0);

//   if (loading)
//     return (
//       <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
//         <CircularProgress />
//       </Box>
//     );

//   const formatDateTime = (dateInput) => {
//     try {
//       if (!dateInput) return "";
//       const d = new Date(dateInput);
//       if (Number.isNaN(d.getTime())) return "";
//       return d.toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//       });
//     } catch (e) {
//       return "";
//     }
//   };

//   // Accept order -> show simplified success dialog on success
//   const handleAcceptOrder = async () => {
//     try {
//       setLoading(true);
//       const payload = {
//         orderId,
//         items: orders.map((item) => ({
//           itemCode: item.itemCode,
//           acceptedQuantity: Number(item.acceptedQuantity || 0),
//           price: item.price,
//           status: item.status,
//         })),
//         status: "Accepted",
//       };

//       const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSnack({ open: true, message: "Order updated successfully!", severity: "success" });
//         setConfirmOpen(true); // show simplified dialog
//       } else {
//         setSnack({ open: true, message: result.message || "Failed to update order", severity: "error" });
//       }
//     } catch (err) {
//       setSnack({ open: true, message: "Failed to update order", severity: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDialogOk = () => {
//     setConfirmOpen(false);
//     navigate("/dashboard");
//   };

//   // UI
//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394", borderBottom: "1px solid #ddd" }}>
//         <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
//           <IconButton edge="start" onClick={() => navigate(-1)} aria-label="back" sx={{ mr: 1 }}>
//             <ArrowBackIcon sx={{ color: "#0b5394" }} />
//           </IconButton>
//           <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 40, sm: 64, md: 80 }, mr: 2 }} />
//           <Box sx={{ flexGrow: 1 }}>
//             <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
//               श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
//             </Typography>
//             <Typography variant="body2" sx={{ color: "#0b5394", fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
//               Tal: Hatkangale, Dist. Kolhapur (Maharastra-27) 416236 (FSSC 22000 Certified Society)
//             </Typography>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Agent Details */}
//       <Container sx={{ mt: 2 }}>
//         <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 1, sm: 2 } }}>
//           <Box sx={{ background: "linear-gradient(135deg, #0b5394 0%, #1e88e5 100%)", p: 1, borderRadius: 1 }}>
//             <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>📋 Details of Receiver (Billed To & Shipped To)</Typography>
//           </Box>
//           <Box sx={{ p: { xs: 1, sm: 3 } }}>
//             <Grid container spacing={2}>
//               {[
//                 [
//                   { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//                 ],
//                 [
//                   { label: "रूट नाव", value: agent.RouteName, key: "RouteName" },
//                 ],
//                 [
//                   { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//                 ],
//               ].map((column, columnIndex) => (
//                 <Grid item xs={12} md={4} key={columnIndex}>
//                   <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", background: "white" }}>
//                     {column.map((item, itemIndex) => (
//                       <Box
//                         key={item.key}
//                         sx={{
//                           p: 1,
//                           borderBottom: itemIndex < column.length - 1 ? "1px solid #f0f0f0" : "none",
//                           background: itemIndex % 2 === 0 ? "#fafbfc" : "white",
//                         }}
//                       >
//                         <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0b5394", fontSize: "0.85rem" }}>
//                           {item.label}
//                         </Typography>
//                         <Typography variant="body1" sx={{ fontWeight: 500, color: "#2c3e50", fontSize: "0.95rem" }}>
//                           {item.value || "N/A"}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         </Paper>
//       </Container>

//       {/* Order Details */}
//       <Container sx={{ mt: 2, pb: 4 }}>
//         <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
//           <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", mb: 2 }}>
//             Order Details
//           </Typography>

//           <TableContainer sx={{ overflowX: "auto" }}>
//             <Table size="small">
//               <TableHead>
//                 {table.getHeaderGroups().map((hg) => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map((header) => (
//                       <TableCell key={header.id} sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHead>

//               <TableBody>
//                 {table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.original._uid ?? row.id}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}

//                 <TableRow>
//                   {table.getHeaderGroups()[0].headers.map((header, index) => (
//                     <TableCell key={index}>
//                       {header.column.columnDef.accessorKey === "totalPrice" ? (
//                         <Typography sx={{ fontWeight: "bold", color: "#0b5394" }}>
//                           ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                         </Typography>
//                       ) : index === 0 ? (
//                         <Typography sx={{ fontWeight: "bold" }}>Grand Total:</Typography>
//                       ) : (
//                         ""
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
//             <Button
//               variant="contained"
//               color="success"
//               onClick={handleAcceptOrder}
//               sx={{ background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)", fontWeight: 600, px: 3 }}
//             >
//               ✅ Accept Order
//             </Button>
//           </Box>
//         </Paper>
//       </Container>

//       {/* Simplified Attractive Confirmation Dialog (ONLY message + OK) */}
//       <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
//         <Box sx={{ background: "linear-gradient(90deg,#4caf50,#2e7d32)", color: "white", display: "flex", alignItems: "center", gap: 2, px: 3, py: 2 }}>
//           <CheckCircleIcon sx={{ fontSize: 40 }} />
//           <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Your order is successfully accepted</Typography>
//         </Box>

//         <DialogContent sx={{ pt: 3, pb: 2 }}>
//           {/* Intentionally empty except the header message */}
//         </DialogContent>

//         <DialogActions sx={{ p: 2, justifyContent: "center" }}>
//           <Button
//             onClick={handleDialogOk}
//             variant="contained"
//             autoFocus
//             sx={{
//               background: "linear-gradient(90deg,#4caf50,#2e7d32)",
//               color: "white",
//               px: 4,
//               py: 1,
//               fontWeight: 700,
//               borderRadius: 2,
//               boxShadow: "0 6px 18px rgba(46,125,50,0.2)",
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snack.open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={() => setSnack({ ...snack, open: false })}>
//         <Alert severity={snack.severity} variant="filled" sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}>
//           {snack.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }































































































// src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
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
  TextField,
  Select,
  MenuItem,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const orderIdFromQuery = query.get("orderId");
  const statusFromQuery = query.get("status");
  const agentCodeFromQuery = query.get("agentCode");

  const [orders, setOrders] = useState([]); // mapped item rows for selected order
  const [orderMeta, setOrderMeta] = useState(null); // selected order meta
  const [orderList, setOrderList] = useState([]); // list from status-details
  const [selectedOrderId, setSelectedOrderId] = useState(orderIdFromQuery || null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // change if your server differs
  const BASE_URL = "http://192.168.1.4:8002/api";

  const makeStableUid = (orderId, idx, item) => {
    const code = item.itemCode ?? `idx${idx}`;
    return `${orderId ?? "noorder"}_${String(code)}_${idx}`;
  };

  const computeTotalFromItems = (itemInfo) => {
    if (!Array.isArray(itemInfo)) return 0;
    return itemInfo.reduce((s, it) => s + Number(it.totalPrice ?? 0), 0);
  };

  const formatDateTime = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return d;
    }
  };

  const selectOrder = (orderObj) => {
    if (!orderObj) {
      console.log("⚠️  No order object provided");
      setOrderMeta(null);
      setOrders([]);
      setSelectedOrderId(null);
      return;
    }

    console.log("\n📍 Selecting Order ID:", orderObj._id);
    console.log("📦 Agent Details:", orderObj.agentDetails);
    console.log("🛣️  Route Details:", orderObj.routeDetails);
    console.log("👤 Supervisor Details:", orderObj.supervisorDetails);

    // map items exactly from your JSON shape
    const mappedItems = (orderObj.itemInfo || []).map((item, idx) => {
      const qty = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      const accepted = item.acceptedQuantity ?? item.acceptedQty ?? qty;
      const totalPrice = Number(item.totalPrice ?? price * accepted);

      console.log(`   Item ${idx + 1}: ${item.itemCode} - ${item.itemName}`);
      console.log(`      Qty: ${qty}, Price: ₹${price}, Accepted: ${accepted}, Total: ₹${totalPrice}`);

      return {
        _uid: makeStableUid(orderObj._id, idx, item),
        originalItemId: item._id ?? null,
        itemCode: item.itemCode ?? "",
        itemName: item.itemName ?? "",
        quantity: qty,
        price,
        acceptedQuantity: String(accepted), // controlled input expects string
        status: item.status ?? "Pending",
        totalPrice,
      };
    });

    const meta = {
      _id: orderObj._id,
      agentCode: orderObj.agentCode ?? "",
      route: orderObj.route ?? "",
      TotalOrder: orderObj.TotalOrder ?? orderObj.totalPrice ?? computeTotalFromItems(orderObj.itemInfo),
      status: orderObj.status ?? "Pending",
      createdAt: orderObj.createdAt,
      updatedAt: orderObj.updatedAt,
      agentDetails: {
        AgentName: orderObj.agentDetails?.AgentName ?? "N/A",
        Address: orderObj.agentDetails?.Address2 ?? "N/A",
        Mobile: orderObj.agentDetails?.Mobile ?? "N/A",
        SalesRouteCode: orderObj.agentDetails?.SalesRouteCode ?? "N/A",
      },
      routeDetails: {
        RouteName: (orderObj.routeDetails?.RouteName ?? orderObj.routeInfo?.RouteName) ?? "N/A",
        VehicleNo: (orderObj.routeDetails?.VehicleNo ?? orderObj.routeDetails?.VehichleNo ?? orderObj.routeInfo?.VehicleNo) ?? "N/A",
        SupervisorCode: orderObj.routeDetails?.SupervisorCode ?? "N/A",
      },
      supervisorDetails: {
        SupervisorName: orderObj.supervisorDetails?.SupervisorName ?? "N/A",
        PhoneNo: orderObj.supervisorDetails?.PhoneNo ?? "N/A",
      },
    };

    setOrderMeta(meta);
    setOrders(mappedItems);
    setSelectedOrderId(orderObj._id);

    console.log("✨ Order metadata set:", meta);
    console.log("✨ Mapped items set:", mappedItems);
    console.log(`✅ Order ${orderObj._id} ready for display\n`);
  };

  const fetchOrdersByStatus = async (status = "Pending") => {
    try {
      setLoading(true);
      
      // Use agent-specific endpoint if agentCode is available, otherwise fetch all
      let endpoint = `${BASE_URL}/orders/status-details/${status}`;
      if (agentCodeFromQuery) {
        endpoint = `${BASE_URL}/orders/agent/${agentCodeFromQuery}/status/Pending`;
        console.log(`📡 Fetching pending orders for Agent: ${agentCodeFromQuery}`);
      } else {
        console.log(`📡 Fetching orders with status: ${status}`);
      }
      
      const res = await axios.get(endpoint);
      console.log("✅ API Response received:", res.data);
      
      const list = res.data?.data ?? [];
      console.log(`📦 Total orders fetched: ${list.length}`);
      
      // Log full structure of first order to debug
      if (list.length > 0) {
        console.log("🔍 First order full structure:", JSON.stringify(list[0], null, 2));
      }
      
      // Map and transform the list
      const mappedList = list.map((order, idx) => {
        console.log(`\n📋 Processing Order ${idx + 1}:`);
        console.log(`   Order ID: ${order._id}`);
        console.log(`   Agent: ${order.agentDetails?.AgentName || "N/A"}`);
        console.log(`   Route: ${order.routeInfo?.RouteName || "N/A"}`);
        console.log(`   Total: ₹${order.TotalOrder || 0}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items Count: ${order.itemInfo?.length || 0}`);
        
        return {
          ...order,
          totalPrice: order.TotalOrder || computeTotalFromItems(order.itemInfo),
          // Map routeInfo to routeDetails for consistency
          routeDetails: order.routeInfo ? {
            RouteName: order.routeInfo.RouteName,
            VehicleNo: order.routeInfo.VehicleNo,
          } : undefined,
        };
      });
      
      setOrderList(mappedList);
      console.log("\n✨ Order list state updated with", mappedList.length, "orders");

      if (!Array.isArray(mappedList) || mappedList.length === 0) {
        console.warn("⚠️  No orders found");
        setOrderMeta(null);
        setOrders([]);
        setSelectedOrderId(null);
        setSnack({ open: true, message: `No ${status} orders found`, severity: "info" });
        return;
      }

      if (orderIdFromQuery) {
        const found = mappedList.find((o) => String(o._id) === String(orderIdFromQuery));
        if (found) {
          console.log("🎯 Found order from query param in list:", orderIdFromQuery);
          setSelectedOrderId(orderIdFromQuery);
          // Don't call selectOrder here - let fetchOrderById handle that
          return;
        }
      }

      console.log("🎯 Selecting first order from list");
      selectOrder(mappedList[0]);
    } catch (err) {
      console.error("❌ fetchOrdersByStatus error:", err);
      setSnack({ open: true, message: "Failed to fetch orders", severity: "error" });
      setOrderList([]);
      setOrderMeta(null);
      setOrders([]);
      setSelectedOrderId(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (id) => {
    try {
      setLoading(true);
      console.log(`📡 Fetching order by ID: ${id}`);
      
      const res = await axios.get(`${BASE_URL}/orders/${id}`);
      console.log("✅ Full API Response for fetchOrderById:", res.data);
      
      const data = res.data?.data ?? res.data;
      console.log("🔍 Order data structure:", JSON.stringify(data, null, 2));
      console.log("🔍 Agent Details in response:", data?.agentDetails);
      console.log("🔍 Route Details in response:", data?.routeDetails);
      console.log("🔍 Supervisor Details in response:", data?.supervisorDetails);
      
      if (!data) {
        console.error("❌ No order data found");
        setSnack({ open: true, message: "Order not found", severity: "error" });
        setOrderMeta(null);
        setOrders([]);
        setSelectedOrderId(null);
        return;
      }
      selectOrder(data);

      // If a status was passed in the query params (from AdminDashboard), prefer that for UI
      if (statusFromQuery) {
        setOrderMeta((prev) => ({ ...(prev || {}), status: statusFromQuery }));
        console.log("ℹ️ Overriding selected order status with query param:", statusFromQuery);
      }
    } catch (err) {
      console.error("❌ fetchOrderById error:", err);
      setSnack({ open: true, message: "Failed to fetch order", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 OrderPage mounted");
    console.log("📝 Query params - orderIdFromQuery:", orderIdFromQuery, "statusFromQuery:", statusFromQuery, "agentCodeFromQuery:", agentCodeFromQuery);

    if (orderIdFromQuery) {
      console.log("🎯 Fetching specific order by ID AND pending orders list");
      // Fetch BOTH the specific order AND the list of pending orders
      fetchOrderById(orderIdFromQuery).catch(() => {
        console.log("⚠️  Failed to fetch by ID");
      });
      // Also fetch the pending orders list for left panel
      fetchOrdersByStatus(statusFromQuery || "Pending");
    } else {
      console.log("📋 Fetching orders by status", statusFromQuery || "Pending");
      fetchOrdersByStatus(statusFromQuery || "Pending");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromQuery, statusFromQuery, agentCodeFromQuery]);

  // handlers
  const handleAcceptedChange = (rowIndex, rawValue) => {
    const allowed = rawValue === "" ? "" : rawValue.replace(/[^0-9]/g, "");
    setOrders((prev) => {
      const copy = [...prev];
      const item = { ...copy[rowIndex] };
      item.acceptedQuantity = allowed;
      const acceptedNum = Number(allowed || 0);
      const required = Number(item.quantity || 0);
      if (item.status !== "Rejected") item.status = acceptedNum === required ? "Accepted" : "Modified";
      copy[rowIndex] = item;
      return copy;
    });
  };

  const handleStatusChange = (rowIndex, newStatus) => {
    setOrders((prev) => {
      const copy = [...prev];
      const item = { ...copy[rowIndex] };
      if (newStatus === "Accepted") item.acceptedQuantity = String(Number(item.quantity || 0));
      else if (newStatus === "Rejected") item.acceptedQuantity = "0";
      item.status = newStatus;
      copy[rowIndex] = item;
      return copy;
    });
  };

  const StatusDropdown = ({ status, rowIndex }) => {
    const getColor = (v) => {
      switch (v) {
        case "Pending":
          return { bg: "#FFF3CD", color: "#856404" };
        case "Accepted":
          return { bg: "#D4EDDA", color: "#155724" };
        case "Modified":
          return { bg: "#CCE5FF", color: "#004085" };
        case "Rejected":
          return { bg: "#F8D7DA", color: "#721C24" };
        default:
          return { bg: "#E2E3E5", color: "#383D41" };
      }
    };
    const { bg, color } = getColor(status);
    return (
      <Select
        value={status || "Pending"}
        onChange={(e) => handleStatusChange(rowIndex, e.target.value)}
        size="small"
        fullWidth={isSmDown}
        sx={{
          backgroundColor: bg,
          color,
          fontWeight: "bold",
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiSelect-select": { py: "6px", px: "8px" },
        }}
      >
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Accepted">Accepted</MenuItem>
        <MenuItem value="Modified">Modified</MenuItem>
        <MenuItem value="Rejected">Rejected</MenuItem>
      </Select>
    );
  };

  const columns = useMemo(
    () => [
      { header: "Sr. No", cell: ({ row }) => row.index + 1 },
      { header: "Item Code", accessorKey: "itemCode" },
      { header: "Item Name", accessorKey: "itemName" },
      { header: "Required Qty", accessorKey: "quantity" },
      {
        header: "Accepted Qty",
        accessorKey: "acceptedQuantity",
        cell: ({ row }) => (
          <TextField
            size="small"
            value={row.original.acceptedQuantity ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) handleAcceptedChange(row.index, v);
            }}
            inputProps={{ inputMode: "numeric", style: { textAlign: "center", width: 100 } }}
          />
        ),
      },
      {
        header: "Rate (₹)",
        accessorKey: "price",
        cell: ({ row }) => `₹ ${Number(row.original.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        header: "Total (₹)",
        accessorKey: "totalPrice",
        cell: ({ row }) => {
          const rate = Number(row.original.price || 0);
          const accepted = Number(row.original.acceptedQuantity || 0);
          return `₹ ${(rate * accepted).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusDropdown status={row.original.status} rowIndex={row.index} />,
      },
    ],
    [isSmDown]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const grandTotal = orders.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.acceptedQuantity || 0), 0);

  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleAcceptOrder = async () => {
    if (!selectedOrderId) {
      console.warn("⚠️  No order selected");
      setSnack({ open: true, message: "No order selected", severity: "error" });
      return;
    }
    try {
      setLoading(true);
      console.log("🔄 Processing order acceptance for Order ID:", selectedOrderId);
      
      const payload = {
        orderId: selectedOrderId,
        items: orders.map((it) => ({
          itemCode: it.itemCode,
          acceptedQuantity: Number(it.acceptedQuantity || 0),
          price: Number(it.price || 0),
          status: it.status,
        })),
        status: "Accepted",
      };

      console.log("📤 Sending payload:", payload);

      const res = await fetch(`${BASE_URL}/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      console.log("📬 API Response:", json);
      
      if (json?.success) {
        console.log("✅ Order updated successfully");
        setSnack({ open: true, message: "Order updated successfully", severity: "success" });
        setConfirmOpen(true);
      } else {
        console.error("❌ API returned error:", json?.message);
        setSnack({ open: true, message: json?.message ?? "Failed to update order", severity: "error" });
      }
    } catch (err) {
      console.error("❌ handleAcceptOrder exception:", err);
      setSnack({ open: true, message: "Failed to update order", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOk = () => {
    setConfirmOpen(false);
    navigate("/dashboard");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394", borderBottom: "1px solid #ddd" }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton edge="start" onClick={() => navigate(-1)} aria-label="back" sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ color: "#0b5394" }} />
          </IconButton>
          <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 40, sm: 64, md: 80 }, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
              श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
            </Typography>
            <Typography variant="body2" sx={{ color: "#0b5394", fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
              Tal: Hatkangale, Dist. Kolhapur (Maharastra-27) 416236 (FSSC 22000 Certified Society)
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Left: order list */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 1, height: "100%" }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Pending Orders</Typography>
              <Divider />
              <List dense sx={{ maxHeight: "70vh", overflowY: "auto" }}>
                {orderList.map((o) => (
                  <ListItem key={o._id} disablePadding>
                    <ListItemButton
                      selected={String(o._id) === String(selectedOrderId)}
                      onClick={() => {
                        console.log("📌 User clicked order:", o._id);
                        setSelectedOrderId(o._id);
                        console.log("🔄 Fetching full details for selected order");
                        fetchOrderById(o._id);
                      }}
                    >
                      <ListItemText
                        primary={`Order: ${o._id}`}
                        secondary={
                          <span>
                            Agent: {o.agentDetails?.AgentName || "N/A"} • Total: ₹{(o.TotalOrder ?? o.totalPrice ?? computeTotalFromItems(o.itemInfo || [])).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Right: details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 1, sm: 2 } }}>
              <Box sx={{ background: "linear-gradient(135deg, #0b5394 0%, #1e88e5 100%)", p: 1, borderRadius: 1 }}>
                <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>📋 Details of Receiver (Billed To & Shipped To)</Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 1.5, background: "#fafbfc" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0b5394", fontSize: "0.9rem" }}>🧑 Agent Details</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Agent Code</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.agentCode || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Agent Name</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.agentDetails?.AgentName || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Mobile</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.agentDetails?.Mobile || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Address</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.agentDetails?.Address || "N/A"}</Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 1.5, background: "#fafbfc" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0b5394", fontSize: "0.9rem" }}>🛣️ Route & Supervisor</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Route Code</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.route || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Route Name</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.routeDetails?.RouteName || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Vehicle No</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.routeDetails?.VehicleNo || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Supervisor</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.supervisorDetails?.SupervisorName || "N/A"}</Typography>
                      
                      <Typography sx={{ fontWeight: 600, mt: 1, fontSize: "0.85rem" }}>Supervisor Phone</Typography>
                      <Typography sx={{ fontSize: "0.95rem" }}>{orderMeta?.supervisorDetails?.PhoneNo || "N/A"}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", mb: 1 }}>
                Order Items
              </Typography>

              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                          <TableCell key={header.id} sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>

                  <TableBody>
                    {table.getRowModel().rows.map((row, rowIdx) => (
                      <TableRow key={`${row.original._uid}-${rowIdx}`}>
                        {row.getVisibleCells().map((cell, cellIdx) => (
                          <TableCell key={`${row.original._uid}-cell-${cellIdx}`}>{flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}

                    <TableRow key="grand-total-row">
                      {table.getHeaderGroups()[0].headers.map((header, idx) => (
                        <TableCell key={idx}>
                          {header.column.columnDef.accessorKey === "totalPrice" ? (
                            <Typography sx={{ fontWeight: "bold", color: "#0b5394" }}>
                              ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </Typography>
                          ) : idx === 0 ? (
                            <Typography sx={{ fontWeight: "bold" }}>Grand Total:</Typography>
                          ) : (
                            ""
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2">Order ID: {orderMeta?._id ?? "N/A"}</Typography>
                  <Typography variant="body2">Created: {formatDateTime(orderMeta?.createdAt)}</Typography>
                </Box>

                <Button variant="contained" color="success" onClick={handleAcceptOrder} sx={{ background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)", fontWeight: 600, px: 3 }}>
                  ✅ Accept Order
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{ background: "linear-gradient(90deg,#4caf50,#2e7d32)", color: "white", display: "flex", alignItems: "center", gap: 2, px: 3, py: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 40 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Your order is successfully accepted</Typography>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2 }} />

        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button onClick={handleDialogOk} variant="contained" autoFocus sx={{ background: "linear-gradient(90deg,#4caf50,#2e7d32)", color: "white", px: 4, py: 1, fontWeight: 700, borderRadius: 2 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
