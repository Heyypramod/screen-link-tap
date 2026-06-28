import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
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

  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary" }}>
      <Box sx={{ maxWidth: 440, mx: "auto", px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <IconButton
            component={Link}
            to="/"
            onClick={() => {
              void AndroidTvRemote.disconnect();
            }}
            sx={{ color: "text.primary" }}
            aria-label="Back"
          >
            <ArrowBackRounded />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "text.secondary", display: "block" }}
            >
              {host}
            </Typography>
          </Box>
          <PowerButton />
        </Stack>

        <Stack spacing={2.5}>
          <Box sx={{ pt: 1 }}>
            <Touchpad />
          </Box>
          <TransportRow />
          <VolumeRocker volume={volume} />
          <MoreSection />
        </Stack>
      </Box>
    </Box>
  );
}
