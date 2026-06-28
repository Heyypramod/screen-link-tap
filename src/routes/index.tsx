import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  DeleteOutlineRounded,
  RadarRounded,
  TvRounded,
  WifiTetheringRounded,
} from "@mui/icons-material";
import { toast } from "sonner";

import { AndroidTvRemote, type TvDevice } from "@/lib/tv-plugin";
import { pairedDevices, type PairedDevice } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";
import { GlassSurface } from "@/components/GlassSurface";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TV Remote" },
      { name: "description", content: "Control your Android TV." },
    ],
  }),
  component: DeviceListPage,
});

function DeviceListPage() {
  const navigate = useNavigate();
  const [paired, setPaired] = useState<PairedDevice[]>([]);
  const [discovered, setDiscovered] = useState<TvDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    setPaired(pairedDevices.list());
  }, []);

  const scan = useCallback(async () => {
    setScanning(true);
    tapHaptic("Light");
    try {
      const res = await AndroidTvRemote.discover();
      setDiscovered(res.devices ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Scan failed", { description: String(err) });
    } finally {
      setScanning(false);
    }
  }, []);

  const connectPaired = useCallback(
    async (device: PairedDevice) => {
      tapHaptic("Medium");
      setConnecting(device.host);
      try {
        await AndroidTvRemote.connect({ host: device.host });
        navigate({ to: "/remote/$host", params: { host: device.host } });
      } catch (err) {
        toast.error("Couldn't connect", { description: String(err) });
        setConnecting(null);
      }
    },
    [navigate],
  );

  const removePaired = useCallback((host: string) => {
    pairedDevices.remove(host);
    setPaired(pairedDevices.list());
    tapHaptic("Light");
  }, []);

  const pairedHosts = new Set(paired.map((d) => d.host));
  const unpaired = discovered.filter((d) => !pairedHosts.has(d.host));
  const nothing = paired.length === 0 && discovered.length === 0;

  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary", pb: "96px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto", px: 2.5, py: 4 }}>
        <Stack direction="row" spacing={2} style={{ alignItems: "center" }} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(182,157,248,0.15)",
              color: "primary.main",
            }}
          >
            <TvRounded />
          </Box>
          <Box>
            <Typography variant="h6">TV Remote</Typography>
            <Typography variant="caption" color="text.secondary">
              Control Android TVs on your network
            </Typography>
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={scan}
          disabled={scanning}
          startIcon={
            scanning ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <RadarRounded />
            )
          }
          sx={{ minHeight: 56, borderRadius: "20px", mb: 3, fontSize: 16 }}
        >
          {scanning ? "Scanning…" : "Scan for TVs"}
        </Button>

        {paired.length > 0 && (
          <Stack spacing={1.25} sx={{ mb: 3 }}>
            <SectionLabel>Your TVs</SectionLabel>
            {paired.map((d) => (
              <GlassSurface
                key={d.host}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
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
                  aria-label={`Remove ${d.name}`}
                  onClick={() => removePaired(d.host)}
                  sx={{ color: "text.secondary" }}
                >
                  <DeleteOutlineRounded />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => connectPaired(d)}
                  disabled={connecting === d.host}
                  sx={{ borderRadius: "14px", minHeight: 40 }}
                >
                  {connecting === d.host ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </GlassSurface>
            ))}
          </Stack>
        )}

        {unpaired.length > 0 && (
          <Stack spacing={1.25} sx={{ mb: 3 }}>
            <SectionLabel>Found on network</SectionLabel>
            {unpaired.map((d) => (
              <GlassSurface
                key={d.host}
                component="button"
                onClick={() => {
                  tapHaptic("Light");
                  navigate({ to: "/pair/$host", params: { host: d.host } });
                }}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "background-color 150ms",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
                }}
              >
                <Box sx={{ ...iconChipSx, color: "text.secondary", bgcolor: "rgba(255,255,255,0.06)" }}>
                  <WifiTetheringRounded />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap style={{ fontWeight: 600 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" noWrap color="text.secondary">
                    {d.host}
                  </Typography>
                </Box>
                <Typography variant="caption" color="primary.main" style={{ fontWeight: 600 }}>
                  Pair
                </Typography>
              </GlassSurface>
            ))}
          </Stack>
        )}

        {nothing && !scanning && (
          <GlassSurface
            sx={{
              mt: 4,
              p: 5,
              textAlign: "center",
              borderStyle: "dashed",
            }}
          >
            <Box sx={{ ...iconChipSx, mx: "auto", mb: 1.5, width: 56, height: 56 }}>
              <TvRounded sx={{ fontSize: 28 }} />
            </Box>
            <Typography style={{ fontWeight: 600 }}>No TVs yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Make sure your TV is on and on the same Wi-Fi, then scan.
            </Typography>
          </GlassSurface>
        )}
      </Box>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 0.5,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        color: "text.secondary",
        fontWeight: 600,
      }}
    >
      {children}
    </Typography>
  );
}
