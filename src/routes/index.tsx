import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Search, Tv, X, Wifi } from "lucide-react";
import { toast } from "sonner";

import { AndroidTvRemote, type TvDevice } from "@/lib/tv-plugin";
import { pairedDevices, type PairedDevice } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "TV Remote" }, { name: "description", content: "Control your Android TV." }],
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
    <Box sx={{ minHeight: "100vh", pb: "80px" }}>
      <Box sx={{ maxWidth: 480, mx: "auto", pt: 6 }}>
        <Typography component="h1" className="text-large-title" sx={{ px: 2, mb: 2 }}>
          Devices
        </Typography>

        {/* Search-style "Scan for TVs" */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Box
            component="button"
            onClick={scan}
            disabled={scanning}
            className="material-regular corner-continuous tap-target"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1.25,
              borderRadius: "var(--radius-sm)",
              border: "none",
              color: "var(--label-secondary)",
              textAlign: "left",
              cursor: "pointer",
              "&:disabled": { opacity: 0.6, cursor: "default" },
            }}
          >
            {scanning ? (
              <CircularProgress size={16} sx={{ color: "var(--label-secondary)" }} />
            ) : (
              <Search size={18} strokeWidth={2} />
            )}
            <span className="text-body" style={{ color: "var(--label-primary)" }}>
              {scanning ? "Scanning…" : "Scan for TVs"}
            </span>
          </Box>
        </Box>

        {paired.length > 0 && (
          <>
            <SectionHeader>My TVs</SectionHeader>
            <Box className="inset-group corner-continuous">
              {paired.map((d) => (
                <Box
                  key={d.host}
                  className="inset-group-row tap-target"
                  onClick={() => connectPaired(d)}
                  role="button"
                  sx={{ cursor: "pointer" }}
                >
                  <Tv size={22} strokeWidth={1.8} color="currentColor" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="text-body" noWrap>
                      {d.name}
                    </Typography>
                    <Typography
                      className="text-footnote"
                      noWrap
                      sx={{ color: "var(--label-secondary)" }}
                    >
                      {d.host}
                    </Typography>
                  </Box>
                  {connecting === d.host ? (
                    <CircularProgress size={16} sx={{ color: "var(--color-blue)" }} />
                  ) : (
                    <Box
                      component="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePaired(d.host);
                      }}
                      aria-label={`Remove ${d.name}`}
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
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}

        {unpaired.length > 0 && (
          <>
            <SectionHeader sx={{ mt: 3 }}>Found on Network</SectionHeader>
            <Box className="inset-group corner-continuous">
              {unpaired.map((d) => (
                <Box
                  key={d.host}
                  className="inset-group-row tap-target"
                  role="button"
                  onClick={() => {
                    tapHaptic("Light");
                    navigate({ to: "/pair/$host", params: { host: d.host } });
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <Wifi size={22} strokeWidth={1.8} color="currentColor" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="text-body" noWrap>
                      {d.name}
                    </Typography>
                    <Typography
                      className="text-footnote"
                      noWrap
                      sx={{ color: "var(--label-secondary)" }}
                    >
                      {d.host}
                    </Typography>
                  </Box>
                  <Typography
                    className="text-callout"
                    sx={{ color: "var(--color-blue)", fontWeight: 600 }}
                  >
                    Pair
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        {nothing && !scanning && (
          <Box sx={{ px: 2, mt: 6, textAlign: "center" }}>
            <Typography className="text-headline" sx={{ mb: 0.5 }}>
              No TVs yet
            </Typography>
            <Typography className="text-subheadline" sx={{ color: "var(--label-secondary)" }}>
              Make sure your TV is on and on the same Wi-Fi, then tap Scan.
            </Typography>
          </Box>
        )}
      </Box>
      {/* Keep Link import used (silence unused warning if any future change) */}
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
