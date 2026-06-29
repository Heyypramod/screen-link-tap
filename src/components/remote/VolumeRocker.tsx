import { Box, Typography } from "@mui/material";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

interface Props {
  volume: { level: number; max: number; muted: boolean } | null;
}

export function VolumeRocker({ volume }: Props) {
  const pct = volume ? Math.round((volume.level / Math.max(volume.max, 1)) * 100) : 0;
  const segmentSx = {
    flex: 1,
    minHeight: 56,
    border: "none",
    background: "transparent",
    color: "var(--label-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 150ms var(--spring-snappy)",
    "&:active": { opacity: 0.6 },
  } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {volume && (
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.5 }}>
          <Typography className="text-caption" sx={{ color: "var(--label-secondary)" }}>
            VOLUME
          </Typography>
          <Typography className="text-caption" sx={{ color: "var(--label-secondary)" }}>
            {volume.muted ? "Muted" : `${pct}%`}
          </Typography>
        </Box>
      )}
      <Box
        className="material-regular corner-continuous"
        sx={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <Box
          component="button"
          aria-label="Volume down"
          onClick={() => tap(KEY.VOLUME_DOWN)}
          sx={segmentSx}
        >
          <Minus size={22} strokeWidth={2} />
        </Box>
        <Box aria-hidden sx={{ width: "0.5px", background: "var(--separator)", my: 1 }} />
        <Box
          component="button"
          aria-label="Mute"
          onClick={() => tap(KEY.VOLUME_MUTE)}
          sx={segmentSx}
        >
          {volume?.muted ? (
            <VolumeX size={22} strokeWidth={2} />
          ) : (
            <Volume2 size={22} strokeWidth={2} />
          )}
        </Box>
        <Box aria-hidden sx={{ width: "0.5px", background: "var(--separator)", my: 1 }} />
        <Box
          component="button"
          aria-label="Volume up"
          onClick={() => tap(KEY.VOLUME_UP)}
          sx={segmentSx}
        >
          <Plus size={22} strokeWidth={2} />
        </Box>
      </Box>
    </Box>
  );
}
