import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Tv, X, ExternalLink } from "lucide-react";

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
    <Box sx={{ minHeight: "100vh", pb: "80px" }}>
      <Box sx={{ maxWidth: 480, mx: "auto", pt: 6 }}>
        <Typography component="h1" className="text-large-title" sx={{ px: 2, mb: 3 }}>
          Settings
        </Typography>

        <SectionHeader>Paired TVs</SectionHeader>
        {paired.length === 0 ? (
          <Box className="inset-group corner-continuous">
            <Box className="inset-group-row" sx={{ color: "var(--label-secondary)" }}>
              <Typography className="text-body">No paired TVs yet.</Typography>
            </Box>
          </Box>
        ) : (
          <Box className="inset-group corner-continuous">
            {paired.map((d) => (
              <Box key={d.host} className="inset-group-row">
                <Tv size={22} strokeWidth={1.8} color="currentColor" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography className="text-body" noWrap>{d.name}</Typography>
                  <Typography
                    className="text-footnote"
                    noWrap
                    sx={{ color: "var(--label-secondary)" }}
                  >
                    {d.host}
                  </Typography>
                </Box>
                <Box
                  component="button"
                  onClick={() => setToRemove(d)}
                  aria-label={`Unpair ${d.name}`}
                  sx={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--label-tertiary)",
                    display: "flex",
                  }}
                >
                  <X size={20} strokeWidth={2} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <SectionHeader sx={{ mt: 3 }}>About</SectionHeader>
        <Box className="inset-group corner-continuous">
          <Box className="inset-group-row" sx={{ display: "block" }}>
            <Typography className="text-headline">TV Remote</Typography>
            <Typography className="text-footnote" sx={{ color: "var(--label-secondary)" }}>
              Version {APP_VERSION}
            </Typography>
            <Typography
              className="text-subheadline"
              sx={{ mt: 1, color: "var(--label-secondary)" }}
            >
              Open-source Android TV remote. Works on your local Wi-Fi — no account, no cloud, no
              tracking.
            </Typography>
          </Box>
          <Box
            component="a"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inset-group-row tap-target"
            sx={{
              color: "var(--color-blue)",
              textDecoration: "none",
            }}
          >
            <ExternalLink size={20} strokeWidth={1.8} />
            <Typography className="text-body" sx={{ flex: 1 }}>
              View source on GitHub
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        slotProps={{
          paper: {
            className: "material-thick",
            sx: {
              borderRadius: "var(--radius-lg)",
              m: 2,
              background: "rgba(40, 40, 44, 0.92)",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 17, textAlign: "center", pb: 0.5 }}>
          Unpair this TV?
        </DialogTitle>
        <DialogContent>
          <Typography
            className="text-subheadline"
            sx={{ textAlign: "center", color: "var(--label-secondary)" }}
          >
            {toRemove?.name} ({toRemove?.host}) will be removed. You'll need to pair again to
            control it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            fullWidth
            onClick={() => setToRemove(null)}
            sx={{
              borderRadius: "var(--radius-md)",
              background: "var(--fill-tertiary)",
              color: "var(--label-primary)",
              "&:hover": { background: "var(--fill-secondary)" },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={confirmRemove}
            sx={{
              borderRadius: "var(--radius-md)",
              background: "var(--color-red)",
              "&:hover": { background: "var(--color-red)", opacity: 0.9 },
            }}
          >
            Unpair
          </Button>
        </DialogActions>
      </Dialog>

      {/* Keep Link import reserved for future settings sub-pages */}
      <Box sx={{ display: "none" }}>
        <Link to="/" />
      </Box>
    </Box>
  );
}

function SectionHeader({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Typography
      component="h2"
      className="text-caption"
      sx={{
        px: 4,
        pb: 0.75,
        textTransform: "uppercase",
        fontWeight: 600,
        color: "var(--label-secondary)",
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
