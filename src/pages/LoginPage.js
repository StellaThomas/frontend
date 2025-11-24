// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   InputAdornment,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Avatar,
// } from "@mui/material";
// import LockIcon from "@mui/icons-material/Lock";
// import PersonIcon from "@mui/icons-material/Person";
// import { useNavigate } from "react-router-dom";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [creds, setCreds] = useState({ username: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "error",
//   });

//   const handleLogin = async () => {
//     setLoading(true);
//     await new Promise((r) => setTimeout(r, 600)); // fake delay
//     setLoading(false);

//     if (creds.username === "Admin" && creds.password === "admin@123") {
//       navigate("/dashboard?agentCode=1515");
//     } else {
//       setSnack({
//         open: true,
//         message: "Incorrect username or password",
//         severity: "error",
//       });
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundImage: url('/bg.jpg'), 
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="xs">
//         <Card
//           elevation={10}
//           sx={{
//             borderRadius: 4,
//             backgroundColor: "rgba(255,255,255,0.95)",
//             boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//             "&:hover": {
//               transform: "scale(1.02)",
//               boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
//             },
//           }}
//         >
//           <CardContent sx={{ p: 4 }}>
//             {/* Logo and Heading */}
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 mb: 3,
//               }}
//             >
//               {/* <Avatar
//                 src="/yalgud-logo.png"
//                 alt="Yalgud Dairy Logo"
//                 sx={{
//                   width: 90,
//                   height: 90,
//                   mb: 2,
//                   bgcolor: "transparent",
//                   boxShadow: "0 0 12px rgba(0,0,0,0.2)",
//                 }}
//               /> */}
//               <Typography
//                 variant="h4"
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#0b5394",
//                   letterSpacing: 1,
//                   textAlign: "center",
//                 }}
//               >
//                 YALGUD DAIRY
//               </Typography>
//               <Typography
//                 variant="subtitle2"
//                 sx={{
//                   color: "#555",
//                   fontWeight: 500,
//                   textAlign: "center",
//                 }}
//               >
//                 Admin Portal
//               </Typography>
//             </Box>

//             {/* Username */}
//             <TextField
//               label="Username"
//               variant="outlined"
//               fullWidth
//               value={creds.username}
//               onChange={(e) =>
//                 setCreds({ ...creds, username: e.target.value })
//               }
//               sx={{
//                 mb: 2,
//                 "& .MuiInputBase-root": { color: "#000" },
//                 "& .MuiInputLabel-root": { color: "#000" },
//                 "& .MuiOutlinedInput-root": {
//                   backgroundColor: "#fff",
//                   "& fieldset": { borderColor: "#ccc" },
//                   "&:hover fieldset": { borderColor: "#0b5394" },
//                   "&.Mui-focused fieldset": { borderColor: "#0b5394" },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <PersonIcon sx={{ color: "#0b5394" }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* Password */}
//             <TextField
//               label="Password"
//               type="password"
//               fullWidth
//               value={creds.password}
//               onChange={(e) =>
//                 setCreds({ ...creds, password: e.target.value })
//               }
//               sx={{
//                 mb: 3,
//                 "& .MuiInputBase-root": { color: "#000" },
//                 "& .MuiInputLabel-root": { color: "#000" },
//                 "& .MuiOutlinedInput-root": {
//                   backgroundColor: "#fff", // ✅ Fixed color (white)
//                   "& fieldset": { borderColor: "#ccc" },
//                   "&:hover fieldset": { borderColor: "#0b5394" },
//                   "&.Mui-focused fieldset": { borderColor: "#0b5394" },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <LockIcon sx={{ color: "#0b5394" }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* Login Button */}
//             <Button
//               variant="contained"
//               fullWidth
//               size="large"
//               onClick={handleLogin}
//               disabled={loading}
//               sx={{
//                 borderRadius: 3,
//                 py: 1.3,
//                 fontWeight: "bold",
//                 fontSize: "1rem",
//                 letterSpacing: 0.5,
//                 background: "linear-gradient(135deg, #0b5394, #1976d2)",
//                 boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "scale(1.03)",
//                   boxShadow: "0 6px 18px rgba(25,118,210,0.5)",
//                 },
//               }}
//             >
//               {loading ? (
//                 <CircularProgress size={22} sx={{ color: "#fff" }} />
//               ) : (
//                 "Login"
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Snackbar */}
//         <Snackbar
//           open={snack.open}
//           autoHideDuration={3000}
//           onClose={() => setSnack({ ...snack, open: false })}
//           anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         >
//           <Alert
//             onClose={() => setSnack({ ...snack, open: false })}
//             severity={snack.severity}
//             variant="filled"
//           >
//             {snack.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </Box>
//   );
// // }












// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   InputAdornment,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Avatar,
// } from "@mui/material";
// import LockIcon from "@mui/icons-material/Lock";
// import PersonIcon from "@mui/icons-material/Person";
// import { useNavigate } from "react-router-dom";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [creds, setCreds] = useState({ username: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "error",
//   });

//   const handleLogin = async () => {
//     setLoading(true);
//     await new Promise((r) => setTimeout(r, 600)); // fake delay
//     setLoading(false);

//     if (creds.username === "Admin" && creds.password === "admin@123") {
//       navigate("/dashboard?agentCode=1515");
//     } else {
//       setSnack({
//         open: true,
//         message: "Incorrect username or password",
//         severity: "error",
//       });
//     }
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
//         backgroundRepeat: "no-repeat",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="xs">
//         <Card
//           elevation={10}
//           sx={{
//             borderRadius: 4,
//             backgroundColor: "rgba(255,255,255,0.95)",
//             boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//             "&:hover": {
//               transform: "scale(1.02)",
//               boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
//             },
//           }}
//         >
//           <CardContent sx={{ p: 4 }}>
//             {/* Logo and Heading */}
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 mb: 3,
//               }}
//             >
//               {/* <Avatar
//                 src="/yalgud-logo.png"
//                 alt="Yalgud Dairy Logo"
//                 sx={{
//                   width: 90,
//                   height: 90,
//                   mb: 2,
//                   bgcolor: "transparent",
//                   boxShadow: "0 0 12px rgba(0,0,0,0.2)",
//                 }}
//               /> */}
//               <Typography
//                 variant="h4"
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#0b5394",
//                   letterSpacing: 1,
//                   textAlign: "center",
//                 }}
//               >
//                 YALGUD DAIRY
//               </Typography>
//               <Typography
//                 variant="subtitle2"
//                 sx={{
//                   color: "#555",
//                   fontWeight: 500,
//                   textAlign: "center",
//                 }}
//               >
//                 Admin Portal
//               </Typography>
//             </Box>

//             {/* Username */}
//             <TextField
//               label="Username"
//               variant="outlined"
//               fullWidth
//               value={creds.username}
//               onChange={(e) =>
//                 setCreds({ ...creds, username: e.target.value })
//               }
//               sx={{
//                 mb: 2,
//                 "& .MuiInputBase-root": { color: "#000" },
//                 "& .MuiInputLabel-root": { color: "#000" },
//                 "& .MuiOutlinedInput-root": {
//                   backgroundColor: "#fff",
//                   "& fieldset": { borderColor: "#ccc" },
//                   "&:hover fieldset": { borderColor: "#0b5394" },
//                   "&.Mui-focused fieldset": { borderColor: "#0b5394" },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <PersonIcon sx={{ color: "#0b5394" }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* Password */}
//             <TextField
//               label="Password"
//               type="password"
//               fullWidth
//               value={creds.password}
//               onChange={(e) =>
//                 setCreds({ ...creds, password: e.target.value })
//               }
//               sx={{
//                 mb: 3,
//                 "& .MuiInputBase-root": { color: "#000" },
//                 "& .MuiInputLabel-root": { color: "#000" },
//                 "& .MuiOutlinedInput-root": {
//                   backgroundColor: "#fff",
//                   "& fieldset": { borderColor: "#ccc" },
//                   "&:hover fieldset": { borderColor: "#0b5394" },
//                   "&.Mui-focused fieldset": { borderColor: "#0b5394" },
//                 },
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <LockIcon sx={{ color: "#0b5394" }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* Login Button */}
//             <Button
//               variant="contained"
//               fullWidth
//               size="large"
//               onClick={handleLogin}
//               disabled={loading}
//               sx={{
//                 borderRadius: 3,
//                 py: 1.3,
//                 fontWeight: "bold",
//                 fontSize: "1rem",
//                 letterSpacing: 0.5,
//                 background: "linear-gradient(135deg, #0b5394, #1976d2)",
//                 boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "scale(1.03)",
//                   boxShadow: "0 6px 18px rgba(25,118,210,0.5)",
//                 },
//               }}
//             >
//               {loading ? (
//                 <CircularProgress size={22} sx={{ color: "#fff" }} />
//               ) : (
//                 "Login"
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Snackbar */}
//         <Snackbar
//           open={snack.open}
//           autoHideDuration={3000}
//           onClose={() => setSnack({ ...snack, open: false })}
//           anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         >
//           <Alert
//             onClose={() => setSnack({ ...snack, open: false })}
//             severity={snack.severity}
//             variant="filled"
//           >
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
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // fake delay
    setLoading(false);

    if (creds.username === "Admin" && creds.password === "admin@123") {
      navigate("/dashboard?agentCode=1515");
    } else {
      setSnack({
        open: true,
        message: "Incorrect username or password",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={10}
          sx={{
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo and Heading */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              {/* <Avatar
                src="/yalgud-logo.png"
                alt="Yalgud Dairy Logo"
                sx={{
                  width: 90,
                  height: 90,
                  mb: 2,
                  bgcolor: "transparent",
                  boxShadow: "0 0 12px rgba(0,0,0,0.2)",
                }}
              /> */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#0b5394",
                  letterSpacing: 1,
                  textAlign: "center",
                }}
              >
                YALGUD DAIRY
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#555",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Admin Portal
              </Typography>
            </Box>

            {/* Username */}
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={creds.username}
              onChange={(e) =>
                setCreds({ ...creds, username: e.target.value })
              }
              sx={{
                mb: 2,
                "& .MuiInputBase-root": { color: "#000" },
                "& .MuiInputLabel-root": { color: "#000" },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#0b5394" },
                  "&.Mui-focused fieldset": { borderColor: "#0b5394" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#0b5394" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={creds.password}
              onChange={(e) =>
                setCreds({ ...creds, password: e.target.value })
              }
              sx={{
                mb: 3,
                "& .MuiInputBase-root": { color: "#000" },
                "& .MuiInputLabel-root": { color: "#000" },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#0b5394" },
                  "&.Mui-focused fieldset": { borderColor: "#0b5394" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#0b5394" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Login Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                borderRadius: 3,
                py: 1.3,
                fontWeight: "bold",
                fontSize: "1rem",
                letterSpacing: 0.5,
                background: "linear-gradient(135deg, #0b5394, #1976d2)",
                boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 6px 18px rgba(25,118,210,0.5)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Login"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            variant="filled"
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}












