

// // OrdersPage.jsx (updated)
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
//   Card,
//   CardContent,
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

//   const fetchAgent = async (agentId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://192.168.1.11:8001/api/orders/masters/agents/${agentId}`);
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

//   useEffect(() => {
//     const loadOrderById = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`http://192.168.1.11:8001/api/orders/${orderId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const result = await response.json();

//         if (result.data) {
//           setOrderMeta(result.data);
//         } else {
//           setOrderMeta(null);
//         }

//         const items = (result.data?.itemInfo || []).map((item) => ({
//           ...item,
//           acceptedQuantity: item.acceptedQty ?? item.acceptedQuantity ?? 0,
//           status: item.status ?? "Pending",
//         }));
//         setOrders(items);
//       } catch (err) {
//         setSnack({ open: true, message: "Failed to load order", severity: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) loadOrderById();
//   }, [orderId]);

//   const handleAcceptedChange = (rowIndex, value) => {
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };
//       const acceptedQuantity = Number(value || 0);
//       const requiredQty = Number(item.quantity || 0);

//       item.acceptedQuantity = acceptedQuantity;

//       if (item.status !== "Rejected") {
//         if (acceptedQuantity !== requiredQty) {
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
//         item.acceptedQuantity = Number(item.quantity || 0);
//       } else if (newStatus === "Rejected") {
//         item.acceptedQuantity = 0;
//       }

//       item.status = newStatus;
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const StatusDropdown = ({ initialStatus, rowIndex }) => {
//     const [status, setStatus] = React.useState(initialStatus || "Pending");

//     useEffect(() => {
//       setStatus(initialStatus || "Pending");
//     }, [initialStatus]);

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

//     const handleChange = (event) => {
//       const newStatus = event.target.value;
//       setStatus(newStatus);
//       handleStatusChange(rowIndex, newStatus);
//     };

//     const { bg, color } = getColor(status);

//     return (
//       <Select
//         value={status}
//         onChange={handleChange}
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
//         cell: ({ row }) => (
//           <TextField
//             type="number"
//             size="small"
//             value={row.original.acceptedQuantity ?? ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
//             }}
//             inputProps={{ min: 0, inputMode: "numeric", style: { textAlign: "center" } }}
//           />
//         ),
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
//         cell: ({ row }) => <StatusDropdown initialStatus={row.original.status} rowIndex={row.index} />,
//       },
//     ],
//     [orders, isSmDown]
//   );

//   const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });

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

//   const agentInfoColumns = [
//     [
//       { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//       { label: "GSTIN", value: agent.STNO, key: "gstin" },
//       { label: "एजंट लाइसन्स", value: agent.LicNo, key: "license" },
//     ],
//     [
//       { label: "एजंट गाव", value: agent.Address1, key: "address" },
//       { label: "फोन", value: agent.Phone, key: "phone" },
//       { label: "सुपरवायझर", value: agent.SupervisorName, key: "supervisor" },
//     ],
//     [
//       { label: "रूट नाव", value: agent.RouteName, key: "route" },
//       { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//     ],
//   ];

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

//     const headerRows = [
//       ["Generated At", generatedAt],
//       ["Order ID", orderId || ""],
//       ["Order Created At", orderCreatedAt],
//       ["Order Status", orderStatus],
//       ["Agent Code", agentCode || ""],
//       ["Agent Name", agent.AgentName || ""],
//       ["Route", agent.RouteName || agent.route || ""],
//       ["Agent Phone", agent.Phone || ""],
//       ["GSTIN", agent.STNO || ""],
//       [],
//       ["Item Code", "Item Name", "Required Qty", "Accepted Qty", "Rate", "Total", "Status"],
//     ];

//     const itemRows = orders.map((it) => {
//       const rate = Number(it.price || 0);
//       const accepted = Number(it.acceptedQuantity || 0);
//       const total = rate * accepted;
//       return [
//         it.itemCode ?? "",
//         it.itemName ?? "",
//         it.quantity ?? 0,
//         it.acceptedQuantity ?? 0,
//         rate.toFixed(2),
//         total.toFixed(2),
//         it.status ?? "",
//       ];
//     });

//     const grand = [["", "", "", "", "Grand Total", grandTotal.toFixed(2)]];

//     const lines = [];
//     headerRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
//     lines.push("");
//     itemRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
//     lines.push("");
//     grand.forEach((r) => lines.push(r.map(csvEscape).join(",")));

//     return lines.join("\r\n");
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
//           acceptedQuantity: item.acceptedQuantity,
//           price: item.price,
//           status: item.status,
//         })),
//         status: "Accepted",
//       };

//       const response = await fetch(`http://192.168.1.11:8001/api/orders/${orderId}`, {
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

//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       {/* Header */}
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
//             <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>
//               📋 Details of Receiver (Billed To & Shipped To)
//             </Typography>
//           </Box>

//           <Box sx={{ p: { xs: 1, sm: 3 } }}>
//             <Grid container spacing={2}>
//               {agentInfoColumns.map((column, columnIndex) => (
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

//           {/* Table */}
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
//                   <TableRow key={row.id}>
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

//       {/* Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={3000}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//         onClose={() => setSnack({ ...snack, open: false })}
//       >
//         <Alert
//           severity={snack.severity}
//           variant="filled"
//           sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}
//         >
//           {snack.message}
//         </Alert>
//       </Snackbar>

//       {/* CSV Preview */}
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





















































































































// // OrdersPage.jsx (updated)
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
//   Card,
//   CardContent,
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

//   const fetchAgent = async (agentId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://192.168.1.50:8002/api/agent/${agentId}`);
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

//   useEffect(() => {
//     const loadOrderById = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const result = await response.json();

//         if (result.data) {
//           setOrderMeta(result.data);
//         } else {
//           setOrderMeta(null);
//         }

//         const items = (result.data?.itemInfo || []).map((item) => ({
//           ...item,
//           acceptedQuantity: item.acceptedQty ?? item.acceptedQuantity ?? 0,
//           status: item.status ?? "Pending",
//         }));
//         setOrders(items);
//       } catch (err) {
//         setSnack({ open: true, message: "Failed to load order", severity: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) loadOrderById();
//   }, [orderId]);

//   const handleAcceptedChange = (rowIndex, value) => {
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };
//       const acceptedQuantity = Number(value || 0);
//       const requiredQty = Number(item.quantity || 0);

//       item.acceptedQuantity = acceptedQuantity;

//       if (item.status !== "Rejected") {
//         if (acceptedQuantity !== requiredQty) {
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
//         item.acceptedQuantity = Number(item.quantity || 0);
//       } else if (newStatus === "Rejected") {
//         item.acceptedQuantity = 0;
//       }

//       item.status = newStatus;
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const StatusDropdown = ({ initialStatus, rowIndex }) => {
//     const [status, setStatus] = React.useState(initialStatus || "Pending");

//     useEffect(() => {
//       setStatus(initialStatus || "Pending");
//     }, [initialStatus]);

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

//     const handleChange = (event) => {
//       const newStatus = event.target.value;
//       setStatus(newStatus);
//       handleStatusChange(rowIndex, newStatus);
//     };

//     const { bg, color } = getColor(status);

//     return (
//       <Select
//         value={status}
//         onChange={handleChange}
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
//         cell: ({ row }) => (
//           <TextField
//             type="number"
//             size="small"
//             value={row.original.acceptedQuantity ?? ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
//             }}
//             inputProps={{ min: 0, inputMode: "numeric", style: { textAlign: "center" } }}
//           />
//         ),
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
//         cell: ({ row }) => <StatusDropdown initialStatus={row.original.status} rowIndex={row.index} />,
//       },
//     ],
//     [orders, isSmDown]
//   );

//   const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });

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

//   // const agentInfoColumns = [
//   //   [
//   //     { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//   //     // { label: "GSTIN", value: agent.STNO, key: "gstin" },
//   //     // { label: "एजंट लाइसन्स", value: agent.LicNo, key: "license" },
//   //   ],
//   //   [
//   //     // { label: "एजंट गाव", value: agent.Address1, key: "address" },
//   //     // { label: "फोन", value: agent.Phone, key: "phone" },
//   //     // { label: "सुपरवायझर", value: agent.SupervisorName, key: "supervisor" },
//   //   ],
//   //   [
//   //     { label: "रूट नाव", value: agent.RouteName, key: "RouteName"},
//   //     { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//   //   ],
//   // ];






//   const agentInfoColumns = [
//     [
//       { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//       // { label: "GSTIN", value: agent.STNO, key: "gstin" },
//       // { label: "एजंट लाइसन्स", value: agent.LicNo, key: "license" },
//     ],
//     [
      
//       ,
//       { label: "रूट नाव", value: agent.RouteName, key: "RouteName"},
//     ],
//     [
      
//       { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//     ],
//   ];





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

//     const headerRows = [
//       ["Generated At", generatedAt],
//       ["Order ID", orderId || ""],
//       ["Order Created At", orderCreatedAt],
//       ["Order Status", orderStatus],
//       ["Agent Code", agentCode || ""],
//       ["Agent Name", agent.AgentName || ""],
//       ["Route", agent.RouteName || agent.RouteName || ""],
//       // ["Agent Phone", agent.Phone || ""],
//       // ["GSTIN", agent.STNO || ""],
//       [],
//       ["Item Code", "Item Name", "Required Qty", "Accepted Qty", "Rate", "Total", "Status"],
//     ];

//     const itemRows = orders.map((it) => {
//       const rate = Number(it.price || 0);
//       const accepted = Number(it.acceptedQuantity || 0);
//       const total = rate * accepted;
//       return [
//         it.itemCode ?? "",
//         it.itemName ?? "",
//         it.quantity ?? 0,
//         it.acceptedQuantity ?? 0,
//         rate.toFixed(2),
//         total.toFixed(2),
//         it.status ?? "",
//       ];
//     });

//     const grand = [["", "", "", "", "Grand Total", grandTotal.toFixed(2)]];

//     const lines = [];
//     headerRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
//     lines.push("");
//     itemRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
//     lines.push("");
//     grand.forEach((r) => lines.push(r.map(csvEscape).join(",")));

//     return lines.join("\r\n");
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
//           acceptedQuantity: item.acceptedQuantity,
//           price: item.price,
//           status: item.status,
//         })),
//         status: "Accepted",
//       };

//       const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
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

//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       {/* Header */}
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
//             <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>
//               📋 Details of Receiver (Billed To & Shipped To)
//             </Typography>
//           </Box>

//           <Box sx={{ p: { xs: 1, sm: 3 } }}>
//             <Grid container spacing={2}>
//               {agentInfoColumns.map((column, columnIndex) => (
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

//           {/* Table */}
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
//                   <TableRow key={row.id}>
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

//       {/* Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={3000}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//         onClose={() => setSnack({ ...snack, open: false })}
//       >
//         <Alert
//           severity={snack.severity}
//           variant="filled"
//           sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}
//         >
//           {snack.message}
//         </Alert>
//       </Snackbar>

//       {/* CSV Preview */}
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














































































































































































// // OrdersPage.jsx (updated)
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
//   Card,
//   CardContent,
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

//   const fetchAgent = async (agentId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://192.168.1.50:8002/api/agent/${agentId}`);
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

//   useEffect(() => {
//     const loadOrderById = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         const result = await response.json();

//         if (result.data) {
//           setOrderMeta(result.data);
//         } else {
//           setOrderMeta(null);
//         }

//         const items = (result.data?.itemInfo || []).map((item) => ({
//           ...item,
//           acceptedQuantity: item.acceptedQty ?? item.acceptedQuantity ?? 0,
//           status: item.status ?? "Pending",
//         }));
//         setOrders(items);
//       } catch (err) {
//         setSnack({ open: true, message: "Failed to load order", severity: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (orderId) loadOrderById();
//   }, [orderId]);

//   const handleAcceptedChange = (rowIndex, value) => {
//     setOrders((prev) => {
//       const updated = [...prev];
//       const item = { ...updated[rowIndex] };
//       const acceptedQuantity = Number(value || 0);
//       const requiredQty = Number(item.quantity || 0);


//       item.acceptedQuantity = acceptedQuantity;

//       if (item.status !== "Rejected") {
//         if (acceptedQuantity !== requiredQty) {
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
//         item.acceptedQuantity = Number(item.quantity || 0);
//       } else if (newStatus === "Rejected") {
//         item.acceptedQuantity = 0;
//       }

//       item.status = newStatus;
//       updated[rowIndex] = item;
//       return updated;
//     });
//   };

//   const StatusDropdown = ({ initialStatus, rowIndex }) => {
//     const [status, setStatus] = React.useState(initialStatus || "Pending");

//     useEffect(() => {
//       setStatus(initialStatus || "Pending");
//     }, [initialStatus]);

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

//     const handleChange = (event) => {
//       const newStatus = event.target.value;
//       setStatus(newStatus);
//       handleStatusChange(rowIndex, newStatus);
//     };

//     const { bg, color } = getColor(status);

//     return (
//       <Select
//         value={status}
//         onChange={handleChange}
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
//         cell: ({ row }) => (
//           <TextField
//             type="number"
//             size="small"
//             value={row.original.acceptedQuantity ?? ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
//             }}
//             inputProps={{ min: 0, inputMode: "numeric", style: { textAlign: "center" } }}
//           />
//         ),
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
//         cell: ({ row }) => <StatusDropdown initialStatus={row.original.status} rowIndex={row.index} />,
//       },
//     ],
//     [orders, isSmDown]
//   );

//   const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });

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

//   // const agentInfoColumns = [
//   //   [
//   //     { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//   //     // { label: "GSTIN", value: agent.STNO, key: "gstin" },
//   //     // { label: "एजंट लाइसन्स", value: agent.LicNo, key: "license" },
//   //   ],
//   //   [
//   //     // { label: "एजंट गाव", value: agent.Address1, key: "address" },
//   //     // { label: "फोन", value: agent.Phone, key: "phone" },
//   //     // { label: "सुपरवायझर", value: agent.SupervisorName, key: "supervisor" },
//   //   ],
//   //   [
//   //     { label: "रूट नाव", value: agent.RouteName, key: "RouteName"},
//   //     { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//   //   ],
//   // ];






//   const agentInfoColumns = [
//     [
//       { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
//       // { label: "GSTIN", value: agent.STNO, key: "gstin" },
//       // { label: "एजंट लाइसन्स", value: agent.LicNo, key: "license" },
//     ],
//     [
      
//       ,
//       { label: "रूट नाव", value: agent.RouteName, key: "RouteName"},
//     ],
//     [
      
//       { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
//     ],
//   ];





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
//   const generatedAt = formatDateTime(new Date());
//   const orderCreatedAt = orderMeta?.createdAt ? formatDateTime(orderMeta.createdAt) : "";
//   const orderStatus = orderMeta?.status ?? "";

//   // Order-Level Labels
//   const orderLabels = [
//     "Generated At",
//     "Order ID",
//     "Order Created At",
//     "Order Status",
//     "Agent Code",
//     "Agent Name",
//     "Route"
//   ];

//   // Order-Level Values
//   const orderValues = [
//     generatedAt,
//     orderId || "",
//     orderCreatedAt,
//     orderStatus,
//     agentCode || "",
//     agent.AgentName || "",
//     agent.RouteName || ""
//   ];

//   // Item data — ALL on ONE LINE
//   const itemLabels = [];
//   const itemValues = [];

//   orders.forEach((it, index) => {
//     const i = index + 1;

//     itemLabels.push(`Item${i}_Code`);
//     itemLabels.push(`Item${i}_Name`);
//     itemLabels.push(`Item${i}_RequiredQty`);
//     itemLabels.push(`Item${i}_AcceptedQty`);
//     itemLabels.push(`Item${i}_Rate`);
//     itemLabels.push(`Item${i}_Total`);
//     itemLabels.push(`Item${i}_Status`);

//     const rate = Number(it.price || 0);
//     const accepted = Number(it.acceptedQuantity || 0);
//     const total = rate * accepted;

//     itemValues.push(it.itemCode ?? "");
//     itemValues.push(it.itemName ?? "");
//     itemValues.push(it.quantity ?? 0);
//     itemValues.push(it.acceptedQuantity ?? 0);
//     itemValues.push(rate.toFixed(2));
//     itemValues.push(total.toFixed(2));
//     itemValues.push(it.status ?? "");
//   });

//   // Add grand total at the END of the row
//   itemLabels.push("Grand_Total");
//   itemValues.push(grandTotal.toFixed(2));

//   // FINAL: Two CSV rows only (header + values)
//   const headerRow = [...orderLabels, ...itemLabels].map(csvEscape).join(",");
//   const valueRow = [...orderValues, ...itemValues].map(csvEscape).join(",");

//   return `${headerRow}\r\n${valueRow}`;
// };

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
//           acceptedQuantity: item.acceptedQuantity,
//           price: item.price,
//           status: item.status,
//         })),
//         status: "Accepted",
//       };

//       const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
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

//   return (
//     <Box sx={{ flexGrow: 1 }}>
//       {/* Header */}
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
//             <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>
//               📋 Details of Receiver (Billed To & Shipped To)
//             </Typography>
//           </Box>

//           <Box sx={{ p: { xs: 1, sm: 3 } }}>
//             <Grid container spacing={2}>
//               {agentInfoColumns.map((column, columnIndex) => (
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

//           {/* Table */}
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
//                   <TableRow key={row.id}>
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

//       {/* Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={3000}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//         onClose={() => setSnack({ ...snack, open: false })}
//       >
//         <Alert
//           severity={snack.severity}
//           variant="filled"
//           sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}
//         >
//           {snack.message}
//         </Alert>
//       </Snackbar>

//       {/* CSV Preview */}
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




















































































































































// OrdersPage.jsx (updated - fixed input remount / typing issue)
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
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const agentCode = query.get("agentCode");
  const orderId = query.get("orderId");

  const [orders, setOrders] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [agent, setAgent] = useState({});
  const [orderMeta, setOrderMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // fetch agent
  const fetchAgent = async (agentId) => {
    try {
      setLoading(true);
      // const response = await axios.get(`http://192.168.1.50:8002/api/agent/${agentId}`);
      const response = await axios.get(`http://122.169.40.118:8002/api/agent/${agentId}`);
      setAgent(response.data.data || {});
      setError(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentCode) fetchAgent(agentCode);
  }, [agentCode]);

  // Helper to create a stable uid for each item
  const makeStableUid = (idx, item) => {
    // prefer item.itemCode if present, otherwise combine index + orderId
    const code = item.itemCode || item.itemCode === 0 ? String(item.itemCode) : `idx${idx}`;
    return `${orderId ?? "noorder"}_${code}_${idx}`;
  };

  useEffect(() => {
    const loadOrderById = async () => {
      try {
        setLoading(true);
        // const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
         const response = await fetch(`http://122.169.40.118:8002/api/orders/${orderId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (result.data) {
          setOrderMeta(result.data);
        } else {
          setOrderMeta(null);
        }

        // map items and add stable _uid and ensure acceptedQuantity is a string for smooth typing
        const items = (result.data?.itemInfo || []).map((item, idx) => {
          const accepted = item.acceptedQty ?? item.acceptedQuantity ?? 0;
          return {
            ...item,
            _uid: makeStableUid(idx, item),
            acceptedQuantity: accepted === null ? "" : String(accepted), // store as string while editing
            status: item.status ?? "Pending",
          };
        });

        setOrders(items);
      } catch (err) {
        setSnack({ open: true, message: "Failed to load order", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) loadOrderById();
  }, [orderId]);

  // Controlled handler — store the raw string so typing isn't interrupted
  const handleAcceptedChange = (rowIndex, rawValue) => {
    // allow only digits (or empty) — preserve input as typed
    const allowed = rawValue === "" ? "" : rawValue.replace(/[^0-9]/g, "");
    setOrders((prev) => {
      const updated = [...prev];
      const item = { ...updated[rowIndex] };
      item.acceptedQuantity = allowed;
      const acceptedNumber = Number(allowed || 0);
      const requiredQty = Number(item.quantity || 0);

      if (item.status !== "Rejected") {
        if (acceptedNumber !== requiredQty) {
          item.status = "Modified";
        } else {
          item.status = "Accepted";
        }
      }
      updated[rowIndex] = item;
      return updated;
    });
  };

  const handleStatusChange = (rowIndex, newStatus) => {
    setOrders((prev) => {
      const updated = [...prev];
      const item = { ...updated[rowIndex] };

      if (newStatus === "Accepted") {
        item.acceptedQuantity = String(Number(item.quantity || 0));
      } else if (newStatus === "Rejected") {
        item.acceptedQuantity = "0";
      }

      item.status = newStatus;
      updated[rowIndex] = item;
      return updated;
    });
  };

  // Controlled StatusDropdown (no internal derived state)
  const StatusDropdown = ({ status, rowIndex }) => {
    const getColor = (value) => {
      switch (value) {
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
          borderRadius: "10px",
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiSelect-select": { py: "6px", px: "10px" },
        }}
      >
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Accepted">Accepted</MenuItem>
        <MenuItem value="Modified">Modified</MenuItem>
        <MenuItem value="Rejected">Rejected</MenuItem>
      </Select>
    );
  };

  // Memoize columns WITHOUT depending on `orders` so cell renderers remain stable
  const columns = useMemo(
    () => [
      { header: "Sr. No", cell: ({ row }) => row.index + 1 },
      { header: "Item Code", accessorKey: "itemCode" },
      { header: "Item Name", accessorKey: "itemName" },
      { header: "Required Qty", accessorKey: "quantity" },
      {
        header: "Accepted Qty",
        accessorKey: "acceptedQuantity",
        cell: ({ row }) => {
          // row.index is stable for the row model
          return (
            <TextField
              type="text" // use "text" to avoid some browser number quirks; we validate/filter digits manually
              size="small"
              value={row.original.acceptedQuantity ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                // allow only digits or empty string
                if (/^\d*$/.test(value)) handleAcceptedChange(row.index, value);
              }}
              inputProps={{ inputMode: "numeric", style: { textAlign: "center", width: 100 } }}
            />
          );
        },
      },
      {
        header: "Rate (₹)",
        accessorKey: "price",
        cell: ({ row }) =>
          `₹ ${parseFloat(row.original.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        header: "Total (₹)",
        accessorKey: "totalPrice",
        cell: ({ row }) => {
          const rate = Number(row.original.price || 0);
          const accepted = Number(row.original.acceptedQuantity || 0);
          const total = rate * accepted;
          return `₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusDropdown status={row.original.status} rowIndex={row.index} />,
      },
    ],
    [isSmDown] // no `orders` here
  );

  // Important: tell react-table to use our stable row ids by providing each row data with '_uid'
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // react-table will create ids; since our data has stable _uid values, rows won't remount unnecessarily
  });

  const grandTotal = orders.reduce((sum, o) => {
    const rate = Number(o.price || 0);
    const accepted = Number(o.acceptedQuantity || 0);
    return sum + rate * accepted;
  }, 0);

  if (loading)
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  const csvEscape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const formatDateTime = (dateInput) => {
    try {
      if (!dateInput) return "";
      const d = new Date(dateInput);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "";
    }
  };

  const buildCsvString = () => {
    const generatedAt = formatDateTime(new Date());
    const orderCreatedAt = orderMeta?.createdAt ? formatDateTime(orderMeta.createdAt) : "";
    const orderStatus = orderMeta?.status ?? "";

    const orderLabels = ["Generated At", "Order ID", "Order Created At", "Order Status", "Agent Code", "Agent Name", "Route"];
    const orderValues = [generatedAt, orderId || "", orderCreatedAt, orderStatus, agentCode || "", agent.AgentName || "", agent.RouteName || ""];

    const itemLabels = [];
    const itemValues = [];

    orders.forEach((it, index) => {
      const i = index + 1;
      itemLabels.push(`Item${i}_Code`, `Item${i}_Name`, `Item${i}_RequiredQty`, `Item${i}_AcceptedQty`, `Item${i}_Rate`, `Item${i}_Total`, `Item${i}_Status`);
      const rate = Number(it.price || 0);
      const accepted = Number(it.acceptedQuantity || 0);
      const total = rate * accepted;
      itemValues.push(it.itemCode ?? "", it.itemName ?? "", it.quantity ?? 0, it.acceptedQuantity ?? 0, rate.toFixed(2), total.toFixed(2), it.status ?? "");
    });

    itemLabels.push("Grand_Total");
    itemValues.push(grandTotal.toFixed(2));

    const headerRow = [...orderLabels, ...itemLabels].map(csvEscape).join(",");
    const valueRow = [...orderValues, ...itemValues].map(csvEscape).join(",");

    return `${headerRow}\r\n${valueRow}`;
  };

  const downloadCsv = (csvString, filename) => {
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleAcceptOrder = async () => {
    try {
      const payload = {
        orderId,
        items: orders.map((item) => ({
          itemCode: item.itemCode,
          acceptedQuantity: Number(item.acceptedQuantity || 0),
          price: item.price,
          status: item.status,
        })),
        status: "Accepted",
      };

      // const response = await fetch(`http://192.168.1.50:8002/api/orders/${orderId}`, {
      const response = await fetch(`http://122.169.40.118:8002/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSnack({ open: true, message: "Order updated successfully!", severity: "success" });

        const csvStr = buildCsvString();
        setCsvContent(csvStr);

        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `order-${orderId || "unknown"}-${ts}.csv`;

        downloadCsv(csvStr, filename);
        setCsvPreviewOpen(true);
      } else {
        setSnack({ open: true, message: result.message || "Failed to update order", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: "Failed to update order", severity: "error" });
    }
  };

  // UI render
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

      {/* Agent Details */}
      <Container sx={{ mt: 2 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 1, sm: 2 } }}>
          <Box sx={{ background: "linear-gradient(135deg, #0b5394 0%, #1e88e5 100%)", p: 1, borderRadius: 1 }}>
            <Typography sx={{ color: "white", fontWeight: 700, textAlign: "center" }}>📋 Details of Receiver (Billed To & Shipped To)</Typography>
          </Box>
          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Grid container spacing={2}>
              {[
                [
                  { label: "एजंट नाव / शाखा", value: agent.AgentName, key: "agentName" },
                ],
                [
                  { label: "रूट नाव", value: agent.RouteName, key: "RouteName" },
                ],
                [
                  { label: "वाहन क्रमांक", value: agent.VehichleNo, key: "vehicle" },
                ],
              ].map((column, columnIndex) => (
                <Grid item xs={12} md={4} key={columnIndex}>
                  <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", background: "white" }}>
                    {column.map((item, itemIndex) => (
                      <Box
                        key={item.key}
                        sx={{
                          p: 1,
                          borderBottom: itemIndex < column.length - 1 ? "1px solid #f0f0f0" : "none",
                          background: itemIndex % 2 === 0 ? "#fafbfc" : "white",
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0b5394", fontSize: "0.85rem" }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: "#2c3e50", fontSize: "0.95rem" }}>
                          {item.value || "N/A"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Order Details */}
      <Container sx={{ mt: 2, pb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", mb: 2 }}>
            Order Details
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
                {table.getRowModel().rows.map((row) => (
                  // react-table's row.id is stable; row.original._uid exists in data
                  <TableRow key={row.original._uid ?? row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                <TableRow>
                  {table.getHeaderGroups()[0].headers.map((header, index) => (
                    <TableCell key={index}>
                      {header.column.columnDef.accessorKey === "totalPrice" ? (
                        <Typography sx={{ fontWeight: "bold", color: "#0b5394" }}>
                          ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                      ) : index === 0 ? (
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

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                const csvStr = buildCsvString();
                setCsvContent(csvStr);
                setCsvPreviewOpen(true);
              }}
            >
              Preview CSV
            </Button>

            <Button variant="contained" color="success" onClick={handleAcceptOrder} sx={{ background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)", fontWeight: 600, px: 3 }}>
              ✅ Accept Order
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3000} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontSize: "1rem", fontWeight: "700", padding: "10px 18px", borderRadius: "10px" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      <Dialog open={csvPreviewOpen} onClose={() => setCsvPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>CSV Preview</DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.9rem" }}>
            {csvContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}








































