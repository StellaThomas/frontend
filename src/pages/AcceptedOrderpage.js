// import { useEffect, useMemo, useState } from "react";
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
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import LogoutIcon from "@mui/icons-material/Logout";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// import { useNavigate } from "react-router-dom";
// import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

// import { fetchAgentData } from "../api/api";
// import logo from "../assets/logo.png";

// export default function AcceptedOrdersPage() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [acceptedInfo, setAcceptedInfo] = useState([]);
//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const BASE_URL = "http://122.169.40.118:8002/api";
//   const drawerWidth = 250;

//   const theme = useTheme();
//   const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const toggleMobile = () => setMobileOpen((s) => !s);

//   // Load ACCEPTED orders
//   useEffect(() => {
//     const loadAcceptedOrders = async () => {
//       try {
//         const codesRes = await fetch(`${BASE_URL}/orders/agent-codes`);
//         const codesData = await codesRes.json();
//         const agentCodes = codesData.data || codesData;

//         const allAcc = [];

//         for (const code of agentCodes) {
//           const res = await fetchAgentData(code);
//           const list = res?.orders || [];
//           const agentName = res?.agentInfo?.AgentName || "Unknown";

//           list.forEach((o) => {
//             const status = String(o.status || "").trim().toLowerCase();
//             if (status === "accepted") {
//               allAcc.push({
//                 AgentName: agentName,
//                 AgentCode: code,
//                 OrderId: o.id,
//                 TotalOrder: o.totalPrice,
//                 CreatedAt: o.createdAt,
//               });
//             }
//           });
//         }

//         // Sort latest first
//         allAcc.sort((a, b) => {
//           const t1 = a.CreatedAt ? Date.parse(a.CreatedAt) : 0;
//           const t2 = b.CreatedAt ? Date.parse(b.CreatedAt) : 0;
//           return t2 - t1;
//         });

//         setAcceptedInfo(
//           allAcc.map((o, i) => ({
//             ...o,
//             SrNo: i + 1,
//           }))
//         );

//         setSnack({
//           open: true,
//           message: "Accepted orders loaded",
//           severity: "success",
//         });
//       } catch (err) {
//         setSnack({
//           open: true,
//           message: "Failed to load accepted orders",
//           severity: "error",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAcceptedOrders();
//   }, []);

//   // Table columns
//   const tableColumns = useMemo(
//     () => [
//       { header: "अ. क्रं", accessorKey: "SrNo" },
//       // { header: "ऑर्डर आयडी", accessorKey: "OrderId" },
//       { header: "एजंट कोड", accessorKey: "AgentCode" },
//       { header: "एजंट नाव", accessorKey: "AgentName" },
//       { header: "एकूण ऑर्डर (₹)", accessorKey: "TotalOrder" },
//       {
//         header: "स्थिती",
//         accessorKey: "status",
//         cell: () => (
//           <Box
//             sx={{
//               px: 1.2,
//               py: 0.5,
//               borderRadius: "20px",
//               fontSize: "0.75rem",
//               fontWeight: "600",
//               backgroundColor: "#4CAF5033",
//               color: "#4CAF50",
//             }}
//           >
//             स्वीकारले
//           </Box>
//         ),
//       },
//       {
//         header: "तारीख",
//         accessorKey: "CreatedAt",
//         cell: ({ row }) =>
//           row.original.CreatedAt
//             ? new Date(row.original.CreatedAt).toLocaleString("en-IN")
//             : "-",
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: acceptedInfo,
//     columns: tableColumns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   // Drawer UI
//   const drawerContent = (
//     <Box sx={{ textAlign: "center", py: 3 }}>
//       <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
//         Admin Panel
//       </Typography>

//       <Divider sx={{ background: "rgba(255,255,255,0.3)", my: 1 }} />

//       <List>
//         <ListItem disablePadding>
//           <ListItemButton sx={{ color: "white" }} onClick={() => navigate("/dashboard")}>
//             <ListItemIcon sx={{ color: "white" }}>
//               <DashboardIcon />
//             </ListItemIcon>
//             <ListItemText primary="Dashboard" />
//           </ListItemButton>
//         </ListItem>

//         <ListItem disablePadding>
//           <ListItemButton sx={{ color: "white" }} onClick={() => navigate("/accepted-orders")}>
//             <ListItemIcon sx={{ color: "white" }}>
//               <CheckCircleIcon />
//             </ListItemIcon>
//             <ListItemText primary="Accepted Orders" />
//           </ListItemButton>
//         </ListItem>
//       </List>

//       <Divider sx={{ background: "rgba(255,255,255,0.3)" }} />

//       <ListItem disablePadding>
//         <ListItemButton
//           onClick={() => navigate("/login")}
//           sx={{ color: "white", mx: 1, mb: 2 }}
//         >
//           <ListItemIcon sx={{ color: "white" }}>
//             <LogoutIcon />
//           </ListItemIcon>
//           <ListItemText primary="Logout" />
//         </ListItemButton>
//       </ListItem>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
//       {/* Drawer */}
//       {isSmDown ? (
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={toggleMobile}
//           sx={{
//             "& .MuiDrawer-paper": {
//               width: drawerWidth,
//               background: "linear-gradient(180deg,#0b5394,#073763)",
//               color: "white",
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       ) : (
//         <Drawer
//           variant="permanent"
//           sx={{
//             width: drawerWidth,
//             "& .MuiDrawer-paper": {
//               width: drawerWidth,
//               background: "linear-gradient(180deg,#0b5394,#073763)",
//               color: "white",
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       )}

//       {/* Main */}
//       <Box sx={{ flexGrow: 1, bgcolor: "#f4f6f8" }}>
        
//         {/* AppBar */}
//         <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394" }}>
//           <Toolbar>
//             {isSmDown && (
//               <IconButton onClick={toggleMobile}>
//                 <MenuIcon sx={{ color: "#0b5394" }} />
//               </IconButton>
//             )}

//             <Box component="img" src={logo} alt="Logo" sx={{ height: 60, mr: 2 }} />

//             <Box sx={{ flexGrow: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0b5394" }}>
//                 श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
//               </Typography>

//               <Typography variant="body2" sx={{ color: "#0b5394" }}>
//                 Accepted Orders List
//               </Typography>
//             </Box>

//             {!isSmDown && (
//               <IconButton onClick={() => window.location.reload()}>
//                 <RefreshIcon sx={{ color: "#0b5394" }} />
//               </IconButton>
//             )}
//           </Toolbar>
//         </AppBar>

//         {/* Content */}
//         <Container sx={{ py: 3 }}>
//           <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
//             <Typography
//               variant="h6"
//               sx={{ mb: 2, fontWeight: "bold", color: "#0b5394" }}
//             >
//               Accepted Orders
//             </Typography>

//             {loading ? (
//               <Box sx={{ textAlign: "center", py: 3 }}>
//                 <CircularProgress />
//               </Box>
//             ) : (
//               <TableContainer sx={{ overflowX: "auto" }}>
//                 <Table size="small">
//                   <TableHead>
//                     {table.getHeaderGroups().map((hg) => (
//                       <TableRow key={hg.id}>
//                         {hg.headers.map((header) => (
//                           <TableCell key={header.id} sx={{ fontWeight: "bold" }}>
//                             {flexRender(header.column.columnDef.header, header.getContext())}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))}
//                   </TableHead>

//                   <TableBody>
//                     {table.getRowModel().rows.map((row) => (
//                       <TableRow key={row.id} hover>
//                         {row.getVisibleCells().map((cell) => (
//                           <TableCell key={cell.id}>
//                             {flexRender(
//                               cell.column.columnDef.cell ??
//                                 cell.column.columnDef.accessorKey,
//                               cell.getContext()
//                             )}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </Paper>
//         </Container>
//       </Box>

//       {/* Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={3000}
//         onClose={() => setSnack({ ...snack, open: false })}
//       >
//         <Alert severity={snack.severity}>{snack.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }




























































































// import { useEffect, useMemo, useState } from "react";
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
// } from "@mui/material";

// import RefreshIcon from "@mui/icons-material/Refresh";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// import { useNavigate } from "react-router-dom";
// import { fetchAgentData } from "../api/api";
// import logo from "../assets/logo.png";

// export default function AcceptedOrdersPage() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);

//   const [acceptedOrders, setAcceptedOrders] = useState([]);
//   const [todayOrders, setTodayOrders] = useState([]);
//   const [yesterdayOrders, setYesterdayOrders] = useState([]);
//   const [olderOrders, setOlderOrders] = useState({});

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const BASE_URL = "http://122.169.40.118:8002/api";

//   // ------------------------------------------
//   // PRICE CLEANER (Fix long floating numbers)
//   // ------------------------------------------
//   const cleanPrice = (value) => {
//     if (!value) return "0.00";
//     const num = Number(value);
//     if (isNaN(num)) return value;
//     return num.toFixed(2);
//   };

//   const toISTDateString = (d) => {
//     if (!d) return null;
//     const utc = new Date(d);
//     const ist = new Date(utc.getTime() + 19800000);
//     return ist.toISOString().substring(0, 10);
//   };

//   const formatDate = (d) => {
//     const dt = new Date(d);
//     return dt.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // =============================================
//   // FETCH ACCEPTED ORDERS
//   // =============================================
//   const refreshAcceptedOrders = async () => {
//     setLoading(true);
//     try {
//       const codeRes = await fetch(`${BASE_URL}/orders/agent-codes`);
//       const codeData = await codeRes.json();
//       const agentCodes = codeData.data || codeData;

//       const allAccepted = [];

//       for (let code of agentCodes) {
//         const masterRes = await fetch(`${BASE_URL}/agent/${code}`);
//         const masterInfo = (await masterRes.json())?.data || {};

//         const ordersRes = await fetchAgentData(code);
//         const list = ordersRes?.orders || [];

//         list.forEach((o) => {
//           if ((o.status || "").toLowerCase() === "accepted") {
//             allAccepted.push({
//               AgentCode: code,
//               AgentName:
//                 masterInfo.AgentName ||
//                 ordersRes.agentInfo?.AgentName ||
//                 "Unknown",
//               SalesRouteCode: masterInfo.SalesRouteCode,
//               RouteName: masterInfo.RouteName,
//               VehichleNo: masterInfo.VehichleNo,
//               TotalOrder: o.totalPrice ?? 0,
//               status: "accepted",
//               OrderId: o.id,
//               CreatedAt: o.createdAt,
//             });
//           }
//         });
//       }

//       setAcceptedOrders(allAccepted);

//       setSnack({
//         open: true,
//         message: "Accepted orders loaded",
//         severity: "success",
//       });
//     } catch (e) {
//       setSnack({
//         open: true,
//         message: "Failed to load accepted orders",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // INITIAL LOAD
//   useEffect(() => {
//     refreshAcceptedOrders();
//   }, []);

//   // AUTO REFRESH EVERY 30 SEC
//   useEffect(() => {
//     const i = setInterval(refreshAcceptedOrders, 30000);
//     return () => clearInterval(i);
//   }, []);

//   useEffect(() => {
//     if (!acceptedOrders.length) return;

//     let accepted = [...acceptedOrders];

//     if (fromDate && toDate) {
//       accepted = accepted.filter((o) => {
//         const d = toISTDateString(o.CreatedAt);
//         return d >= fromDate && d <= toDate;
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

//     accepted.forEach((order) => {
//       const dt = toISTDateString(order.CreatedAt);

//       if (dt === todayStr) todayList.push(order);
//       else if (dt === yesterdayStr) yesterdayList.push(order);
//       else {
//         const label = formatDate(order.CreatedAt);
//         if (!olderGrouped[label]) olderGrouped[label] = [];
//         olderGrouped[label].push(order);
//       }
//     });

//     const sortedOlder = {};
//     Object.keys(olderGrouped)
//       .sort((a, b) => new Date(b) - new Date(a))
//       .forEach((k) => (sortedOlder[k] = olderGrouped[k]));

//     setTodayOrders(todayList);
//     setYesterdayOrders(yesterdayList);
//     setOlderOrders(sortedOlder);
//   }, [acceptedOrders, fromDate, toDate]);

//   // =============================================
//   // SECTION RENDER
//   // =============================================
//   const renderSection = (title, list) => (
//     <>
//       <TableRow sx={{ background: "#073763" }}>
//         <TableCell colSpan={9} sx={{ fontWeight: "bold", color: "white" }}>
//           {title}
//         </TableCell>
//       </TableRow>

//       {list.length === 0 ? (
//         <TableRow>
//           <TableCell colSpan={9} sx={{ textAlign: "center" }}>
//             No Accepted Orders
//           </TableCell>
//         </TableRow>
//       ) : (
//         list.map((o, i) => (
//           <TableRow
//             hover
//             key={o.OrderId}
//             sx={{ cursor: "pointer" }}
//             onClick={() =>
//               navigate(`/orders?orderId=${o.OrderId}&agentCode=${o.AgentCode}`)
//             }
//           >
//             <TableCell>{i + 1}</TableCell>
//             <TableCell>{o.AgentCode}</TableCell>
//             <TableCell>{o.AgentName}</TableCell>
//             <TableCell>{o.SalesRouteCode}</TableCell>
//             <TableCell>{o.RouteName}</TableCell>
//             <TableCell>{o.VehichleNo}</TableCell>

//             {/* FIXED PRICE */}
//             <TableCell>{cleanPrice(o.TotalOrder)}</TableCell>

//             {/* DATE */}
//             <TableCell>
//               {o.CreatedAt
//                 ? new Date(o.CreatedAt).toLocaleString("en-IN")
//                 : "-"}
//             </TableCell>

//             <TableCell>
//               <Box
//                 sx={{
//                   px: 1,
//                   py: 0.5,
//                   bgcolor: "#4CAF5033",
//                   color: "#2e7d32",
//                   borderRadius: "10px",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                 }}
//               >
//                 स्वीकारले
//               </Box>
//             </TableCell>
//           </TableRow>
//         ))
//       )}
//     </>
//   );

//   return (
//     <Box sx={{ display: "flex", height: "100vh" }}>
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

//         <Divider sx={{ background: "rgba(255,255,255,0.2)" }} />

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
//                 <CheckCircleIcon />
//               </ListItemIcon>
//               <ListItemText primary="Accepted Orders" />
//             </ListItemButton>
//           </ListItem>
//         </List>
//       </Drawer>

//       <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
//         <AppBar
//           position="sticky"
//           sx={{ background: "white", color: "#073763" }}
//         >
//           <Toolbar sx={{ py: 2.5, px: 3 }}>
//             <Box component="img" src={logo} sx={{ height: 60, mr: 3 }} />
//             <Box sx={{ flexGrow: 1 }}>
//               <Typography variant="h6" sx={{ fontWeight: "bold" }}>
//                 श्री हनुमान सहकारी दूध संस्था, यळगुड.
//               </Typography>
//               <Typography variant="body2">
//                 Tal: Hatkangale, Dist. Kolhapur (Maharashtra)
//               </Typography>
//             </Box>

//             <IconButton onClick={refreshAcceptedOrders}>
//               <RefreshIcon sx={{ color: "#073763", fontSize: 28 }} />
//             </IconButton>
//           </Toolbar>
//         </AppBar>

//         <Container sx={{ py: 4 }}>
//           <Paper elevation={6} sx={{ p: 3 }}>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 mb: 3,
//                 alignItems: "center",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#073763",
//                   borderLeft: "6px solid #073763",
//                   pl: 1.5,
//                 }}
//               >
//                 Accepted Orders
//               </Typography>

//               <Box sx={{ display: "flex", gap: 2 }}>
//                 <TextField
//                   type="date"
//                   InputLabelProps={{ shrink: true }}
//                   label="From Date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                 />

//                 <TextField
//                   type="date"
//                   InputLabelProps={{ shrink: true }}
//                   label="To Date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                 />
//               </Box>
//             </Box>

//             {loading ? (
//               <Box sx={{ textAlign: "center", py: 4 }}>
//                 <CircularProgress />
//               </Box>
//             ) : (
//               <TableContainer sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
//                 <Table>
//                   <TableHead sx={{ background: "#f0f4f9" }}>
//                     <TableRow>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         अ. क्रं
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         एजंट कोड
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         एजंट नाव
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         रूट कोड
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         रूट नाव
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         वाहन क्रमांक
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         एकूण ऑर्डर (₹)
//                       </TableCell>

//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         तारीख
//                       </TableCell>

//                       <TableCell sx={{ fontWeight: "bold" }}>
//                         स्थिती
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {renderSection("Today", todayOrders)}
//                     {renderSection("Yesterday", yesterdayOrders)}
//                     {Object.keys(olderOrders).map((date) =>
//                       renderSection(date, olderOrders[date])
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </Paper>
//         </Container>
//       </Box>

//       <Snackbar
//         open={snack.open}
//         autoHideDuration={3000}
//         onClose={() => setSnack({ ...snack, open: false })}
//       >
//         <Alert severity={snack.severity}>{snack.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }


















































import { useEffect, useState } from "react";
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
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AcceptedOrdersPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [yesterdayOrders, setYesterdayOrders] = useState([]);
  const [olderOrders, setOlderOrders] = useState({});

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ------------------------------------------
  // PRICE CLEANER (Fix long floating numbers)
  // ------------------------------------------
  const cleanPrice = (value) => {
    if (value === null || value === undefined) return "0.00";
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toFixed(2);
  };

  // Try to normalize many possible createdAt formats to a Date object
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
        // if seconds, convert to ms (heuristic)
        const ms = c < 1e12 ? c * 1000 : c;
        const dt = new Date(ms);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString();
      }
      // string timestamps
      try {
        const maybeNum = Number(c);
        if (!Number.isNaN(maybeNum) && c.trim().length <= 13) {
          // numeric string
          const ms = maybeNum < 1e12 ? maybeNum * 1000 : maybeNum;
          const dt2 = new Date(ms);
          if (!Number.isNaN(dt2.getTime())) return dt2.toISOString();
        }
      } catch {}
      const dt = new Date(c);
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }

    // fallback: raw.CreatedAt if exists
    if (raw.CreatedAt) {
      const dt = new Date(raw.CreatedAt);
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }
    // ultimate fallback now
    return new Date().toISOString();
  };

  const toISTDateString = (d) => {
    if (!d) return null;
    const utc = new Date(d);
    if (Number.isNaN(utc.getTime())) return null;
    const ist = new Date(utc.getTime() + 19800000);
    return ist.toISOString().substring(0, 10); // YYYY-MM-DD
  };

  const formatDateLabel = (isoString) => {
    if (!isoString) return "";
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }); // DD/MM/YYYY
  };

  // =============================================
  // LOAD ACCEPTED ORDERS FROM localStorage
  // =============================================
  const refreshAcceptedOrders = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("accepted_orders_list");
      const list = raw ? JSON.parse(raw) : [];

      // Normalize and ensure CreatedAt exists and is ISO string
      const normalized = (list || []).map((o) => {
        // if o already has CreatedAt, use it; else infer from nested raw
        const createdAtIso = o.CreatedAt
          ? normalizeCreatedAt({ CreatedAt: o.CreatedAt })
          : normalizeCreatedAt(o.raw ?? o);
        return {
          AgentCode: o.AgentCode ?? o.raw?.agentCode ?? "N/A",
          AgentName:
            o.AgentName ??
            o.raw?.agentName ??
            o.raw?.agentDetails?.AgentName ??
            "Unknown",
          SalesRouteCode:
            o.SalesRouteCode ?? o.raw?.SalesRouteCode ?? o.raw?.routeCode ?? "",
          RouteName: o.RouteName ?? o.raw?.RouteName ?? o.raw?.routeName ?? "",
          VehichleNo:
            o.VehichleNo ?? o.raw?.VehichleNo ?? o.raw?.vehicleNo ?? "",
          TotalOrder:
            typeof o.TotalOrder !== "undefined"
              ? o.TotalOrder
              : o.raw?.TotalOrder ?? o.raw?.totalPrice ?? 0,
          status: "accepted",
          OrderId: o.OrderId ?? o.raw?.OrderId ?? o.raw?.id ?? "",
          CreatedAt: createdAtIso,
        };
      });

      // Sort by CreatedAt descending (newest first)
      normalized.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

      setAcceptedOrders(normalized);

      setSnack({
        open: true,
        message: "Accepted orders loaded",
        severity: "success",
      });
    } catch (e) {
      console.error("refreshAcceptedOrders error", e);
      setSnack({
        open: true,
        message: "Failed to load accepted orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    refreshAcceptedOrders();
    // eslint-disable-next-line
  }, []);

  // AUTO REFRESH EVERY 30 SEC (re-read localStorage so Dashboard accepts reflect here)
  useEffect(() => {
    const i = setInterval(refreshAcceptedOrders, 30000);
    return () => clearInterval(i);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!acceptedOrders.length) {
      setTodayOrders([]);
      setYesterdayOrders([]);
      setOlderOrders({});
      return;
    }

    let accepted = [...acceptedOrders];

    // apply optional date filters (YYYY-MM-DD strings)
    if (fromDate && toDate) {
      accepted = accepted.filter((o) => {
        const d = toISTDateString(o.CreatedAt);
        return d >= fromDate && d <= toDate;
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

    // ensure each list is sorted newest -> oldest by CreatedAt
    accepted.forEach((order) => {
      const dtIso = toISTDateString(order.CreatedAt);
      if (dtIso === todayStr) {
        todayList.push(order);
      } else if (dtIso === yesterdayStr) {
        yesterdayList.push(order);
      } else {
        const label = formatDateLabel(order.CreatedAt); // human label
        if (!olderGrouped[label]) olderGrouped[label] = [];
        olderGrouped[label].push(order);
      }
    });

    // sort each group's rows newest -> oldest
    const sortDesc = (arr) => arr.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    sortDesc(todayList);
    sortDesc(yesterdayList);
    Object.keys(olderGrouped).forEach((k) => sortDesc(olderGrouped[k]));

    // sort older groups by date descending (newest date first)
    const sortedOlder = {};
    Object.keys(olderGrouped)
      .sort((a, b) => {
        // convert labels back to Date for correct sort
        const da = new Date(olderGrouped[a][0]?.CreatedAt);
        const db = new Date(olderGrouped[b][0]?.CreatedAt);
        return db - da;
      })
      .forEach((k) => (sortedOlder[k] = olderGrouped[k]));

    setTodayOrders(todayList);
    setYesterdayOrders(yesterdayList);
    setOlderOrders(sortedOlder);
  }, [acceptedOrders, fromDate, toDate]);

  // =============================================
  // SECTION RENDER
  // =============================================
  const renderSection = (title, list) => (
    <>
      <TableRow sx={{ background: "#073763" }}>
        <TableCell colSpan={9} sx={{ fontWeight: "bold", color: "white" }}>
          {title}
        </TableCell>
      </TableRow>

      {list.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} sx={{ textAlign: "center" }}>
            No Accepted Orders
          </TableCell>
        </TableRow>
      ) : (
        list.map((o, i) => (
          <TableRow
            hover
            key={o.OrderId || `${o.AgentCode}-${i}-${title}`}
            sx={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/orders?orderId=${o.OrderId}&agentCode=${o.AgentCode}`)
            }
          >
            <TableCell>{i + 1}</TableCell>
            <TableCell>{o.AgentCode}</TableCell>
            <TableCell>{o.AgentName}</TableCell>
            <TableCell>{o.SalesRouteCode}</TableCell>
            <TableCell>{o.RouteName}</TableCell>
            <TableCell>{o.VehichleNo}</TableCell>

            {/* FIXED PRICE */}
            <TableCell>{cleanPrice(o.TotalOrder)}</TableCell>

            {/* DATE */}
            <TableCell>
              {o.CreatedAt ? new Date(o.CreatedAt).toLocaleString("en-IN") : "-"}
            </TableCell>

            <TableCell>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: "#4CAF5033",
                  color: "#2e7d32",
                  borderRadius: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                स्वीकारले
              </Box>
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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

        <Divider sx={{ background: "rgba(255,255,255,0.2)" }} />

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
                <CheckCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Accepted Orders" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <AppBar position="sticky" sx={{ background: "white", color: "#073763" }}>
          <Toolbar sx={{ py: 2.5, px: 3 }}>
            <Box component="img" src={logo} sx={{ height: 60, mr: 3 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                श्री हनुमान सहकारी दूध संस्था, यळगुड.
              </Typography>
              <Typography variant="body2">Tal: Hatkangale, Dist. Kolhapur (Maharashtra)</Typography>
            </Box>

            <IconButton onClick={refreshAcceptedOrders}>
              <RefreshIcon sx={{ color: "#073763", fontSize: 28 }} />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 4 }}>
          <Paper elevation={6} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#073763",
                  borderLeft: "6px solid #073763",
                  pl: 1.5,
                }}
              >
                Accepted Orders
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  label="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <TextField
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  label="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ background: "#f0f4f9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>अ. क्रं</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>एजंट कोड</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>एजंट नाव</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>रूट कोड</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>रूट नाव</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>वाहन क्रमांक</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>एकूण ऑर्डर (₹)</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>तारीख</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>स्थिती</TableCell>
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

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
