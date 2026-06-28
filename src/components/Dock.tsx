import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { HomeRounded, CastRounded, SettingsRounded } from "@mui/icons-material";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { tapHaptic } from "@/lib/haptics";

type Item = {
  key: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  match?: (path: string) => boolean;
  onClick?: () => void;
};

export function Dock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [castOpen, setCastOpen] = useState(false);

  const items: Item[] = [
    {
      key: "home",
      label: "Home",
      icon: <HomeRounded />,
      to: "/",
      match: (p) => p === "/" || p.startsWith("/pair") || p.startsWith("/remote"),
    },
    {
      key: "cast",
      label: "Cast",
      icon: <CastRounded />,
      onClick: () => {
        tapHaptic("Light");
        setCastOpen(true);
      },
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingsRounded />,
      to: "/settings",
      match: (p) => p.startsWith("/settings"),
    },
  ];

  return (
    <>
      <Box
        component="nav"
        aria-label="Primary"
        className="glass"
        sx={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          mx: "auto",
          maxWidth: 360,
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.10)",
          px: 1,
          py: 0.75,
          zIndex: 1200,
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-around" }}>
          {items.map((it) => {
            const active = it.match ? it.match(pathname) : false;
            const content = (
              <Stack
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.25,
                  minWidth: 72,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: "24px",
                  color: active ? "primary.main" : "rgba(255,255,255,0.75)",
                  bgcolor: active ? "rgba(182,157,248,0.18)" : "transparent",
                  boxShadow: active ? "0 0 24px rgba(182,157,248,0.35)" : "none",
                  transition: "background-color 150ms, color 150ms, box-shadow 200ms",
                }}
              >
                {it.icon}
                <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, lineHeight: 1 }}>
                  {it.label}
                </Typography>
              </Stack>
            );

            const sharedSx = {
              flex: 1,
              p: 0,
              minWidth: 0,
              color: "inherit",
              "&:hover": { bgcolor: "transparent" },
            } as const;

            if (it.to) {
              return (
                <Button
                  key={it.key}
                  component={Link}
                  to={it.to}
                  onClick={() => tapHaptic("Light")}
                  disableRipple
                  sx={sharedSx}
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                >
                  {content}
                </Button>
              );
            }
            return (
              <Button
                key={it.key}
                onClick={it.onClick}
                disableRipple
                sx={sharedSx}
                aria-label={it.label}
              >
                {content}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Dialog
        open={castOpen}
        onClose={() => setCastOpen(false)}
        slotProps={{
          paper: {
            className: "glass",
            sx: {
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.10)",
              m: 2,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cast</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Casting coming soon — for now this app works as a remote control. Cast support is planned
            for a future release.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              tapHaptic("Light");
              setCastOpen(false);
            }}
            sx={{ borderRadius: "14px" }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
