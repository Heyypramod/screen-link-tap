import {
  ArrowBackRounded,
  HomeRounded,
  MenuRounded,
} from "@mui/icons-material";
import { Box, Button } from "@mui/material";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

const items: Array<{ label: string; icon: React.ReactNode; code: string }> = [
  { label: "Back", icon: <ArrowBackRounded />, code: KEY.BACK },
  { label: "Home", icon: <HomeRounded />, code: KEY.HOME },
  { label: "Menu", icon: <MenuRounded />, code: KEY.MENU },
];

export function TransportRow() {
  return (
    <Box
      className="glass"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1.25,
        p: 1.25,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {items.map((it) => (
        <Button
          key={it.label}
          variant="text"
          onClick={() => tap(it.code)}
          startIcon={it.icon}
          sx={{
            color: "text.primary",
            minHeight: 56,
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.04)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
          }}
        >
          {it.label}
        </Button>
      ))}
    </Box>
  );
}
