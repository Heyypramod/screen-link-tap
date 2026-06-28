import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMoreRounded,
  FastForwardRounded,
  FastRewindRounded,
  PlayArrowRounded,
  SearchRounded,
} from "@mui/icons-material";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

const items = [
  { label: "Rew", icon: <FastRewindRounded />, code: KEY.REWIND },
  { label: "Play", icon: <PlayArrowRounded />, code: KEY.PLAY_PAUSE },
  { label: "FF", icon: <FastForwardRounded />, code: KEY.FAST_FORWARD },
  { label: "Search", icon: <SearchRounded />, code: KEY.SEARCH },
];

const btnSx = {
  flex: 1,
  height: 56,
  borderRadius: "16px",
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "text.primary",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
};

export function MoreSection() {
  const [open, setOpen] = useState(false);
  return (
    <Box
      className="glass"
      sx={{
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <Button
        fullWidth
        onClick={() => setOpen((v) => !v)}
        endIcon={
          <ExpandMoreRounded
            sx={{
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        }
        sx={{
          justifyContent: "space-between",
          color: "text.primary",
          py: 1.5,
          px: 2,
          borderRadius: 0,
        }}
      >
        More
      </Button>
      <Collapse in={open}>
        <Box sx={{ display: "flex", gap: 1, p: 1.25, pt: 0 }}>
          {items.map((it) => (
            <IconButton
              key={it.label}
              aria-label={it.label}
              onClick={() => tap(it.code)}
              sx={btnSx}
            >
              {it.icon}
            </IconButton>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
