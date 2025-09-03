import React, {useState} from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
//   Link
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link } from "react-router-dom";
import {colors} from "../Constant";
import { useNavigate } from 'react-router-dom';
import Logo from "../../src/assets/logo.png";



export default function LoginPage() {
      const navigate = useNavigate();
        // State variables for email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleLogin = (e) => {
        e.preventDefault();
      // Login code logic
      navigate('/home');
    }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: "center",  }}>
            <img src={Logo} alt="TrackYI Logo" width="150" />
          </Box>

          {/* Titre */}
          <Typography 
            variant="h5" 
            align="center" 
            color={colors.primaryText} 
            gutterBottom 
            sx={{ fontWeight: 600 }}
          >
            Welcome Back!
          </Typography>

          {/* Champ Email */}
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Champ Mot de passe */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Lien mot de passe oublié */}
          <Box textAlign="left" mt={1}>
            <Link to="/forgot-password" sx={{ color: colors.accent }}>
              Forgot password ?
            </Link>
          </Box>

          {/* Login button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: "18px",
              backgroundColor: colors.action,
              "&:hover": {
                backgroundColor: colors.actionHover,
              },
            }}
          >
            Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
