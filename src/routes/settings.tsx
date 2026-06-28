import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  
  Stack,
  Typography,
} from "@mui/material";
import { CloseRounded, OpenInNewRounded, TvRounded } from "@mui/icons-material";

import { GlassSurface } from "@/components/GlassSurface";
import { pairedDevices, type PairedDevice } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";

const APP_VERSION = "0.1.0";
const GITHUB_URL = "https://github.com/YOUR_USERNAME/tv-remote";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TV Remote" },
      { name: "description", content: "Manage your paired TVs and app preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [paired, setPaired] = useState<PairedDevice[]>([]);
  const [toRemove, setToRemove] = useState<PairedDevice | null>(null);

  useEffect(() => {
    setPaired(pairedDevices.list());
  }, []);

  const confirmRemove = useCallback(() => {
    if (!toRemove) return;
    pairedDevices.remove(toRemove.host);
    setPaired(pairedDevices.list());
    tapHaptic("Medium");
    setToRemove(null);
  }, [toRemove]);

  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary", pb: "96px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto", px: 2.5, py: 4 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Manage paired TVs and learn about the app.
        </Typography>

        <SectionLabel sx={{ mt: 3 }}>Paired TVs</SectionLabel>
        {paired.length === 0 ? (
          <GlassSurface sx={{ p: 3, textAlign: "center", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No paired TVs yet. Pair one from the Home screen.
            </Typography>
          </GlassSurface>
        ) : (
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {paired.map((d) => (
              <GlassSurface
                key={d.host}
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Box sx={iconChipSx}>
                  <TvRounded />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap style={{ fontWeight: 600 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" noWrap color="text.secondary">
                    {d.host}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Unpair ${d.name}`}
                  onClick={() => setToRemove(d)}
                  sx={{ color: "text.secondary" }}
                >
                  <CloseRounded />
                </IconButton>
              </GlassSurface>
            ))}
          </Stack>
        )}

        <SectionLabel sx={{ mt: 3 }}>About</SectionLabel>
        <GlassSurface sx={{ p: 2.5, mt: 1 }}>
          <Typography style={{ fontWeight: 700 }}>TV Remote</Typography>
          <Typography variant="caption" color="text.secondary">
            Version {APP_VERSION}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Open-source Android TV remote. Works on your local Wi-Fi — no account, no cloud, no
            tracking.
          </Typography>
        </GlassSurface>

        <Box
          component="a"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="glass"
          sx={{
            mt: 1.25,
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "text.primary",
            textDecoration: "none",
            cursor: "pointer",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
          }}
        >
          <Box sx={iconChipSx}>
            <OpenInNewRounded />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography style={{ fontWeight: 600 }}>View source on GitHub</Typography>
            <Typography variant="caption" noWrap color="text.secondary">
              {GITHUB_URL}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        slotProps={{
          paper: {
            className: "glass",
            sx: { borderRadius: "24px", border: "1px solid rgba(255,255,255,0.10)", m: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Unpair this TV?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {toRemove?.name} ({toRemove?.host}) will be removed. You'll need to pair again to
            control it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setToRemove(null)} sx={{ borderRadius: "14px" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmRemove}
            sx={{ borderRadius: "14px" }}
          >
            Unpair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const iconChipSx = {
  width: 44,
  height: 44,
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "rgba(182,157,248,0.15)",
  color: "primary.main",
  flexShrink: 0,
};

function SectionLabel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: "block",
        px: 0.5,
        mb: 0.5,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        color: "text.secondary",
        fontWeight: 600,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
