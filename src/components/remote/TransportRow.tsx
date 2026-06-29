import { ChevronLeft, Home, Menu } from "lucide-react";
import { Box } from "@mui/material";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

const items = [
  { label: "Back", icon: ChevronLeft, code: KEY.BACK },
  { label: "Home", icon: Home, code: KEY.HOME },
  { label: "Menu", icon: Menu, code: KEY.MENU },
];

export function TransportRow() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
      {items.map(({ label, icon: Icon, code }) => (
        <Box
          key={label}
          component="button"
          onClick={() => tap(code)}
          aria-label={label}
          className="material-regular corner-continuous tap-target"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            minHeight: 64,
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "var(--label-primary)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span className="text-caption" style={{ color: "var(--label-secondary)" }}>
            {label}
          </span>
        </Box>
      ))}
    </Box>
  );
}
