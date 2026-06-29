import { createTheme } from "@mui/material/styles";

// iOS-style theme. Kept exported as m3Theme for import compatibility.
export const m3Theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0a84ff", contrastText: "#ffffff" },
    error: { main: "#ff453a" },
    success: { main: "#30d158" },
    background: { default: "#000", paper: "rgba(255, 255, 255, 0.06)" },
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(235, 235, 245, 0.60)",
    },
    divider: "rgba(84, 84, 88, 0.65)",
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
    h1: { fontSize: 34, fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.05 },
    h2: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.7px", lineHeight: 1.1 },
    h3: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
    body1: { fontSize: 17, letterSpacing: "-0.4px" },
    body2: { fontSize: 15, letterSpacing: "-0.2px" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.4px", fontSize: 17 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 14, padding: "12px 18px" },
        contained: {
          background: "#0a84ff",
          boxShadow: "none",
          "&:hover": { background: "#0a84ff", opacity: 0.9, boxShadow: "none" },
          "&:active": { opacity: 0.7 },
        },
        outlined: {
          background: "rgba(120, 120, 128, 0.24)",
          borderColor: "transparent",
          color: "#fff",
          "&:hover": { background: "rgba(120, 120, 128, 0.32)", borderColor: "transparent" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(40px) saturate(180%)",
          border: "none",
        },
      },
    },
  },
});
