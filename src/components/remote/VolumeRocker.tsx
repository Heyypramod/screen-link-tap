import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import {
  AddRounded,
  RemoveRounded,
  VolumeOffRounded,
  VolumeUpRounded,
} from "@mui/icons-material";

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

const btnSx = {
  width: 64,
  height: 56,
  borderRadius: "16px",
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "text.primary",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
};

export function VolumeRocker({ volume }: Props) {
  const pct = volume
    ? Math.round((volume.level / Math.max(volume.max, 1)) * 100)
    : 0;

  return (
    <Box
      className="glass"
      sx={{
        p: 1.5,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "text.secondary",
            fontWeight: 600,
          }}
        >
          Volume
        </Typography>
        {volume && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {volume.muted ? "Muted" : `${pct}%`}
          </Typography>
        )}
      </Box>
      {volume && (
        <LinearProgress
          variant="determinate"
          value={volume.muted ? 0 : pct}
          sx={{
            height: 6,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            "& .MuiLinearProgress-bar": { borderRadius: 999 },
          }}
        />
      )}
      <Box sx={{ display: "flex", gap: 1.25, justifyContent: "space-between" }}>
        <IconButton
          aria-label="Volume down"
          onClick={() => tap(KEY.VOLUME_DOWN)}
          sx={{ ...btnSx, flex: 1 }}
        >
          <RemoveRounded />
        </IconButton>
        <IconButton
          aria-label="Mute"
          onClick={() => tap(KEY.VOLUME_MUTE)}
          sx={{ ...btnSx, flex: 1 }}
        >
          {volume?.muted ? <VolumeOffRounded /> : <VolumeUpRounded />}
        </IconButton>
        <IconButton
          aria-label="Volume up"
          onClick={() => tap(KEY.VOLUME_UP)}
          sx={{ ...btnSx, flex: 1 }}
        >
          <AddRounded />
        </IconButton>
      </Box>
    </Box>
  );
}
