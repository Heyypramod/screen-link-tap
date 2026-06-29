import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Power } from "lucide-react";
import { toast } from "sonner";

import { AndroidTvRemote, type TvEvent } from "@/lib/tv-plugin";
import { pairedDevices } from "@/lib/paired-devices";
import { Touchpad } from "@/components/remote/Touchpad";
import { TransportRow } from "@/components/remote/TransportRow";
import { VolumeRocker } from "@/components/remote/VolumeRocker";
import { PowerButton } from "@/components/remote/PowerButton";
import { MoreSection } from "@/components/remote/MoreSection";

export const Route = createFileRoute("/remote/$host")({
  head: () => ({ meta: [{ title: "Remote — TV Remote" }] }),
  component: RemotePage,
});

type Volume = { level: number; max: number; muted: boolean };

function RemotePage() {
  const { host } = Route.useParams();
  const navigate = useNavigate();
  const [volume, setVolume] = useState<Volume | null>(null);
  const name = pairedDevices.get(host)?.name ?? host;

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | null = null;
    let cancelled = false;
    (async () => {
      try {
        await AndroidTvRemote.connect({ host });
      } catch (err) {
        if (!cancelled) {
          toast.error("Couldn't connect", { description: String(err) });
          navigate({ to: "/" });
        }
        return;
      }
      handle = await AndroidTvRemote.addListener("tvEvent", (ev: TvEvent) => {
        if (ev.type === "volume") {
          setVolume({ level: ev.level, max: ev.max, muted: ev.muted });
        } else if (ev.type === "disconnected") {
          toast.error("Disconnected from TV", { description: ev.error });
          navigate({ to: "/" });
        }
      });
    })();

    return () => {
      cancelled = true;
      void handle?.remove();
    };
  }, [host, navigate]);

  // Unused-import silencer: lucide Power is reused in PowerButton via its own import.
  void Power;

  return (
    <Box sx={{ minHeight: "100vh", pb: "104px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto" }}>
        {/* iOS nav bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            minHeight: 44,
            gap: 1,
          }}
        >
          <Link
            to="/"
            onClick={() => {
              void AndroidTvRemote.disconnect();
            }}
            style={{
              color: "var(--color-blue)",
              textDecoration: "none",
              fontSize: 17,
              letterSpacing: "-0.4px",
              flex: 1,
            }}
          >
            ‹ Devices
          </Link>
          <Typography className="text-headline" noWrap sx={{ flex: 1, textAlign: "center" }}>
            {name}
          </Typography>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <PowerButton />
          </Box>
        </Box>

        <Box sx={{ px: 2, pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Touchpad />
          <TransportRow />
          <VolumeRocker volume={volume} />
          <MoreSection />
        </Box>
      </Box>
    </Box>
  );
}
