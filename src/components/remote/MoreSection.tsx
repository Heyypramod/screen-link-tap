import { useState } from "react";
import { Box, Collapse } from "@mui/material";
import { ChevronDown, FastForward, Play, Rewind, Search } from "lucide-react";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

const items = [
  { label: "Rewind", icon: Rewind, code: KEY.REWIND },
  { label: "Play / Pause", icon: Play, code: KEY.PLAY_PAUSE },
  { label: "Fast Forward", icon: FastForward, code: KEY.FAST_FORWARD },
  { label: "Search", icon: Search, code: KEY.SEARCH },
];

export function MoreSection() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      className="material-regular corner-continuous"
      sx={{
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <Box
        component="button"
        onClick={() => {
          tapHaptic("Light");
          setOpen((v) => !v);
        }}
        sx={{
          width: "100%",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          color: "var(--label-primary)",
          px: 2,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span className="text-body">More</span>
        <ChevronDown
          size={20}
          strokeWidth={1.8}
          style={{
            transition: "transform 200ms var(--spring-snappy)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--label-secondary)",
          }}
        />
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {items.map(({ label, icon: Icon, code }, i) => (
            <Box
              key={label}
              component="button"
              aria-label={label}
              onClick={() => tap(code)}
              sx={{
                minHeight: 64,
                background: "transparent",
                border: "none",
                borderTop: "0.5px solid var(--separator)",
                borderLeft: i === 0 ? "none" : "0.5px solid var(--separator)",
                color: "var(--label-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 150ms var(--spring-snappy)",
                "&:active": { opacity: 0.6 },
              }}
            >
              <Icon size={22} strokeWidth={1.8} />
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
