

// import { useEffect, useMemo, useState } from "react";
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
// import { useNavigate, useLocation } from "react-router-dom";
// import ReceiptIcon from "@mui/icons-material/Receipt";
// import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
// import { fetchAgentData } from "../api/api";
// import logo from "../assets/logo.png"; // keep your logo path

// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }

// export default function DashboardPage() {
//   const query = useQuery();
//   const navigate = useNavigate();
//   const agentCodeParam = query.get("agentCode");

//   const [loading, setLoading] = useState(false);
//   const [agentInfo, setAgentInfo] = useState([]);
//   const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

//   const BASE_URL = "http://192.168.1.50:8002/api";
//   const drawerWidth = 250;

//   // responsive controls
//   const theme = useTheme();
//   const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const toggleMobile = () => setMobileOpen((s) => !s);

//   // ✅ Load ALL agent orders and sort so newest (by createdAt) is SrNo 1
//   useEffect(() => {
//     const loadAllAgents = async () => {
//       setLoading(true);
//       try {
//         const codesRes = await fetch(`${BASE_URL}/orders/agent-codes`);
//         const codesData = await codesRes.json();
//         const agentCodesToShow = codesData.data || codesData;
//         if (!Array.isArray(agentCodesToShow)) throw new Error("Invalid response format: agentCodesToShow is not an array");

//         const allOrders = [];
//         for (const code of agentCodesToShow) {
//           const res = await fetchAgentData(code);
//           const { agentInfo: aInfo = {}, orders = [] } = res || {};
//           const safeOrders = Array.isArray(orders) ? orders : [];
//           safeOrders.forEach((order) => {
//             const createdAtValue = order.createdAt || order.CreatedAt || order.created_at || null;
//             allOrders.push({
//               AgentCode: aInfo.AgentCode || code,
//               AgentName: aInfo.AgentName || "",
//               SalesRouteCode: aInfo.SalesRouteCode || "",
//               RouteName: aInfo.RouteName || "",
//               VehichleNo: aInfo.VehichleNo || "",
//               TotalOrder: order.totalPrice ?? order.total ?? 0,
//               status: order.status || "",
//               OrderId: order.id || order._id || "",
//               CreatedAt: createdAtValue,
//             });
//           });
//         }

//         // Sort descending by CreatedAt (newest first)
//         allOrders.sort((a, b) => {
//           const ta = a.CreatedAt ? Date.parse(a.CreatedAt) : 0;
//           const tb = b.CreatedAt ? Date.parse(b.CreatedAt) : 0;
//           return tb - ta;
//         });

//         const finalOrders = allOrders.map((o, idx) => {
//           const isAccepted = (o.status || "").toLowerCase() === "accepted";
//           return {
//             SrNo: idx + 1,
//             AgentCode: o.AgentCode,
//             AgentName: o.AgentName,
//             SalesRouteCode: o.SalesRouteCode,
//             RouteName: o.RouteName,
//             VehichleNo: o.VehichleNo,
//             TotalOrder: o.TotalOrder,
//             status: o.status,
//             Invoice: (
//               <Button
//                 disabled={!isAccepted}
//                 sx={{
//                   color: isAccepted ? "#0b5394" : "rgba(0,0,0,0.3)",
//                   "&:hover": { backgroundColor: isAccepted ? "rgba(11,83,148,0.1)" : "transparent" },
//                 }}
//               >
//                 <ReceiptIcon />
//               </Button>
//             ),
//             OrderId: o.OrderId,
//             CreatedAt: o.CreatedAt,
//           };
//         });

//         setAgentInfo(finalOrders);
//         setSnack({ open: true, message: `Loaded ${finalOrders.length} orders (newest first)`, severity: "success" });
//       } catch (err) {
//         console.error("❌ Error fetching agents:", err);
//         setSnack({ open: true, message: "Failed to fetch agent data", severity: "error" });
//         setAgentInfo([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAllAgents();
//   }, []);

//   const tableColumns = useMemo(
//     () => [
//       { header: "अ. क्रं", accessorKey: "SrNo" },
//       { header: "एजंट कोड", accessorKey: "AgentCode" },
//       { header: "एजंट नाव", accessorKey: "AgentName" },
//       { header: "रूट कोड", accessorKey: "SalesRouteCode" },
//       { header: "रूट नाव", accessorKey: "RouteName" },
//       { header: "वाहन क्रमांक", accessorKey: "VehichleNo" },
//       { header: "एकूण ऑर्डर (₹)", accessorKey: "TotalOrder" },
//       {
//         header: "इनव्हॉइस",
//         accessorKey: "Invoice",
//         cell: ({ row }) => row.original.Invoice,
//       },
//     ],
//     []
//   );

//   const table = useReactTable({ data: agentInfo, columns: tableColumns, getCoreRowModel: getCoreRowModel() });

//   if (loading && agentInfo.length === 0)
//     return (
//       <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <CircularProgress />
//       </Box>
//     );

//   const drawerContent = (
//     <Box sx={{ textAlign: "center", py: 3, height: "100%", display: "flex", flexDirection: "column" }}>
//       <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
//         Admin Panel
//       </Typography>
//       <Divider sx={{ background: "rgba(255,255,255,0.2)", my: 1 }} />
//       <List>
//         <ListItem disablePadding>
//           <ListItemButton sx={{ color: "white" }}>
//             <ListItemIcon sx={{ color: "white" }}>
//               <DashboardIcon />
//             </ListItemIcon>
//             <ListItemText primary="Dashboard" />
//           </ListItemButton>
//         </ListItem>
//       </List>
//       <Box sx={{ flexGrow: 1 }} />
//       <Divider sx={{ background: "rgba(255,255,255,0.2)" }} />
//       <ListItem disablePadding>
//         <ListItemButton
//           onClick={() => navigate("/login")}
//           sx={{ color: "white", mx: 1, mb: 2, borderRadius: 1, "&:hover": { background: "rgba(255,255,255,0.15)" } }}
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
//       {/* Responsive drawer: temporary on small screens */}
//       {isSmDown ? (
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={toggleMobile}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             "& .MuiDrawer-paper": { width: drawerWidth, background: "linear-gradient(180deg, #0b5394 0%, #073763 100%)", color: "white" },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       ) : (
//         <Drawer
//           variant="permanent"
//           sx={{
//             width: drawerWidth,
//             flexShrink: 0,
//             "& .MuiDrawer-paper": {
//               width: drawerWidth,
//               boxSizing: "border-box",
//               background: "linear-gradient(180deg, #0b5394 0%, #073763 100%)",
//               color: "white",
//               borderRight: "none",
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       )}

//       {/* Main Content */}
//       <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6f8", overflow: "auto" }}>
//         <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394", borderBottom: "1px solid #ddd", zIndex: 10 }}>
//           <Toolbar sx={{ px: isSmDown ? 1 : 3 }}>
//             {isSmDown && (
//               <IconButton edge="start" onClick={toggleMobile} aria-label="menu" sx={{ mr: 1 }}>
//                 <MenuIcon sx={{ color: "#0b5394" }} />
//               </IconButton>
//             )}
//             <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 40, sm: 64, md: 80 }, mr: 2 }} />
//             <Box sx={{ flexGrow: 1 }}>
//               <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem" } }}>
//                 श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
//               </Typography>
//               <Typography variant="body2" sx={{ color: "#0b5394", fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
//                 Tal: Hatkangale, Dist. Kolhapur (Maharastra-27) 416236, (FSSC 22000 Certified Society)
//               </Typography>
//             </Box>

//             {/* Refresh on md+ only to keep header compact on phones */}
//             {!isSmDown && (
//               <IconButton onClick={() => window.location.reload()} aria-label="refresh">
//                 <RefreshIcon sx={{ color: "#0b5394" }} />
//               </IconButton>
//             )}
//           </Toolbar>
//         </AppBar>

//         <Container sx={{ py: { xs: 2, sm: 4 } }}>
//           <Paper elevation={4} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
//             <Typography variant="h6" sx={{ mb: 2, color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>
//               Today's Requirements
//             </Typography>

//             {loading && (
//               <Box sx={{ textAlign: "center", py: 3 }}>
//                 <CircularProgress size={28} />
//               </Box>
//             )}

//             <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
//               <Table size="small">
//                 <TableHead>
//                   {table.getHeaderGroups().map((hg) => (
//                     <TableRow key={hg.id}>
//                       {hg.headers.map((header) => {
//                         const key = header.column.columnDef.accessorKey || header.id;
//                         const hideOnXs = ["SalesRouteCode", "RouteName", "VehichleNo"];
//                         return (
//                           <TableCell
//                             key={header.id}
//                             sx={{
//                               fontWeight: "bold",
//                               background: "#f0f3f9",
//                               color: "#0b5394",
//                               display: hideOnXs.includes(key) ? { xs: "none", sm: "table-cell" } : undefined,
//                               minWidth: key === "AgentName" ? 140 : 80,
//                             }}
//                           >
//                             {flexRender(header.column.columnDef.header, header.getContext())}
//                           </TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   ))}
//                 </TableHead>

//                 <TableBody>
//                   {table.getRowModel().rows.map((row) => (
//                     <TableRow
//                       key={row.original.OrderId || row.id}
//                       hover
//                       sx={{ cursor: "pointer", "&:hover": { background: "#eef5ff" } }}
//                       onClick={() => navigate(`/orders?orderId=${row.original.OrderId}&agentCode=${row.original.AgentCode}`)}
//                     >
//                       {row.getVisibleCells().map((cell) => {
//                         const key = cell.column.columnDef.accessorKey || cell.id;
//                         const hideOnXs = ["SalesRouteCode", "RouteName", "VehichleNo"];
//                         return (
//                           <TableCell key={cell.id} sx={{ display: hideOnXs.includes(key) ? { xs: "none", sm: "table-cell" } : undefined }}>
//                             {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                           </TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Paper>
//         </Container>
//       </Box>

//       <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
//         <Alert severity={snack.severity}>{snack.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }



















































































import { useEffect, useMemo, useState } from "react";
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { fetchAgentData } from "../api/api";
import logo from "../assets/logo.png"; // keep your logo path

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function DashboardPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const agentCodeParam = query.get("agentCode");

  const [loading, setLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const BASE_URL = "http://122.169.40.118:8002/api";
  const drawerWidth = 250;

  // responsive controls
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((s) => !s);

  // ✅ Load ALL agent orders and sort so newest (by createdAt) is SrNo 1
  useEffect(() => {
    const loadAgentsAndOrders = async () => {
      setLoading(true);

      try {
        const codesRes = await fetch(`${BASE_URL}/orders/agent-codes`);
        const codesData = await codesRes.json();
        const agentCodes = codesData.data || codesData;

        const allOrders = [];

        for (const code of agentCodes) {
          // 🔹 Fetch master agent info
          const master = await fetch(`${BASE_URL}/agent/${code}`);
          const masterInfo = (await master.json())?.data || {};

          // 🔹 Fetch order history of this agent
          const ordersRes = await fetchAgentData(code);
          const ordersList = ordersRes?.orders || [];

          if (!ordersList.length) {
            // No orders → still show agent
            allOrders.push({
              AgentCode: masterInfo.AgentCode,
              AgentName: masterInfo.AgentName,
              SalesRouteCode: masterInfo.SalesRouteCode,
              RouteName: masterInfo.RouteName,
              VehichleNo: masterInfo.VehichleNo,
              TotalOrder: 0,
              status: "",
              OrderId: "",
              CreatedAt: null,
            });
          } else {
            // If yes orders → push every order with correct master info
            ordersList.forEach((o) => {
              allOrders.push({
                AgentCode: masterInfo.AgentCode,
                AgentName: masterInfo.AgentName,
                SalesRouteCode: masterInfo.SalesRouteCode,
                RouteName: masterInfo.RouteName,
                VehichleNo: masterInfo.VehichleNo,
                TotalOrder: o.totalPrice ?? o.total ?? 0,
                status: o.status || "",
                OrderId: o.id || "",
                CreatedAt: o.createdAt || null,
              });
            });
          }
        }

        // Sort by createdAt newest first
        allOrders.sort((a, b) => {
          const t1 = a.CreatedAt ? Date.parse(a.CreatedAt) : 0;
          const t2 = b.CreatedAt ? Date.parse(b.CreatedAt) : 0;
          return t2 - t1;
        });

        // Add SrNo number
        const updated = allOrders.map((o, i) => ({
          ...o,
          SrNo: i + 1,
        }));

        setAgentInfo(updated);
        setSnack({ open: true, message: "Data Loaded Successfully", severity: "success" });
      } catch (err) {
        console.error("Fetch failed:", err);
        setSnack({ open: true, message: "Error fetching data", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadAgentsAndOrders();
  }, []);

  const tableColumns = useMemo(
    () => [
      { header: "अ. क्रं", accessorKey: "SrNo" },
      { header: "एजंट कोड", accessorKey: "AgentCode" },
      { header: "एजंट नाव", accessorKey: "AgentName" },
      { header: "रूट कोड", accessorKey: "SalesRouteCode" },
      { header: "रूट नाव", accessorKey: "RouteName" },
      { header: "वाहन क्रमांक", accessorKey: "VehichleNo" },
      { header: "एकूण ऑर्डर (₹)", accessorKey: "TotalOrder" },
      {
        header: "इनव्हॉइस",
        accessorKey: "Invoice",
        cell: ({ row }) => (
          <Button
            disabled={row.original.status?.toLowerCase() !== "accepted"}
            sx={{ color: row.original.status?.toLowerCase() === "accepted" ? "#0b5394" : "gray" }}
          >
            <ReceiptIcon />
          </Button>
        ),
      },
    ],
    []
    );

  const table = useReactTable({ data: agentInfo, columns: tableColumns, getCoreRowModel: getCoreRowModel() });
  if (loading && agentInfo.length === 0)
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  const drawerContent = (
    <Box sx={{ textAlign: "center", py: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
        Admin Panel
      </Typography>
      <Divider sx={{ background: "rgba(255,255,255,0.2)", my: 1 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ color: "white" }}>
            <ListItemIcon sx={{ color: "white" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ background: "rgba(255,255,255,0.2)" }} />
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate("/login")}
          sx={{ color: "white", mx: 1, mb: 2, borderRadius: 1, "&:hover": { background: "rgba(255,255,255,0.15)" } }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Responsive drawer: temporary on small screens */}
      {isSmDown ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth, background: "linear-gradient(180deg, #0b5394 0%, #073763 100%)", color: "white" },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "linear-gradient(180deg, #0b5394 0%, #073763 100%)",
              color: "white",
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6f8", overflow: "auto" }}>
        <AppBar position="sticky" elevation={0} sx={{ background: "white", color: "#0b5394", borderBottom: "1px solid #ddd", zIndex: 10 }}>
          <Toolbar sx={{ px: isSmDown ? 1 : 3 }}>
            {isSmDown && (
              <IconButton edge="start" onClick={toggleMobile} aria-label="menu" sx={{ mr: 1 }}>
                <MenuIcon sx={{ color: "#0b5394" }} />
              </IconButton>
            )}
            <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 40, sm: 64, md: 80 }, mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem" } }}>
                श्री हनुमान सहकारी दूध व्यावसायिक व कृषिपुरक सेवा संस्था मर्यादित, यळगुड. जि. कोल्हापुर
              </Typography>
              <Typography variant="body2" sx={{ color: "#0b5394", fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
                Tal: Hatkangale, Dist. Kolhapur (Maharastra-27) 416236, (FSSC 22000 Certified Society)
              </Typography>
            </Box>

            {/* Refresh on md+ only to keep header compact on phones */}
            {!isSmDown && (
              <IconButton onClick={() => window.location.reload()} aria-label="refresh">
                <RefreshIcon sx={{ color: "#0b5394" }} />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ py: { xs: 2, sm: 4 } }}>
          <Paper elevation={4} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0b5394", fontWeight: "bold", fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>
              Today's Requirements
            </Typography>

            {loading && (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => {
                        const key = header.column.columnDef.accessorKey || header.id;
                        const hideOnXs = ["SalesRouteCode", "RouteName", "VehichleNo"];
                        return (
                          <TableCell
                            key={header.id}
                            sx={{
                              fontWeight: "bold",
                              background: "#f0f3f9",
                              color: "#0b5394",
                              display: hideOnXs.includes(key) ? { xs: "none", sm: "table-cell" } : undefined,
                              minWidth: key === "AgentName" ? 140 : 80,
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHead>

                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.original.OrderId || row.id}
                      hover
                      sx={{ cursor: "pointer", "&:hover": { background: "#eef5ff" } }}
                      onClick={() => navigate(`/orders?orderId=${row.original.OrderId}&agentCode=${row.original.AgentCode}`)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const key = cell.column.columnDef.accessorKey || cell.id;
                        const hideOnXs = ["SalesRouteCode", "RouteName", "VehichleNo"];
                        return (
                          <TableCell key={cell.id} sx={{ display: hideOnXs.includes(key) ? { xs: "none", sm: "table-cell" } : undefined }}>
                            {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}












































































