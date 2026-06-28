import { createTheme, alpha } from "@mui/material/styles";

// M3-inspired dark theme. Single primary constant; change here to retune.
export const PRIMARY = "#B69DF8"; // M3 deep-purple primary40-ish for dark

export const m3Theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: PRIMARY, contrastText: "#1F1147" },
    secondary: { main: "#CCC2DC" },
    error: { main: "#F2B8B5" },
    background: {
      default: "#0E0B16",
      paper: "rgba(28, 24, 38, 0.6)",
    },
    text: {
      primary: "#E6E1E9",
      secondary: "#CAC4D0",
    },
    divider: alpha("#ffffff", 0.08),
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      'Roboto, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0.1 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingInline: 20,
          minHeight: 48,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
  },
});
