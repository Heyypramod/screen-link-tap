import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { PowerSettingsNewRounded } from "@mui/icons-material";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

export function PowerButton() {
  const [open, setOpen] = useState(false);

  const send = async () => {
    tapHaptic("Heavy");
    try {
      await AndroidTvRemote.sendKey({ keyCode: KEY.POWER, direction: "SHORT" });
    } catch (err) {
      console.error(err);
    }
    setOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label="Power"
        onClick={() => {
          tapHaptic("Light");
          setOpen(true);
        }}
        sx={{
          width: 48,
          height: 48,
          borderRadius: "16px",
          color: "error.main",
          backgroundColor: "rgba(242, 184, 181, 0.12)",
          border: "1px solid rgba(242,184,181,0.3)",
          "&:hover": { backgroundColor: "rgba(242, 184, 181, 0.2)" },
        }}
      >
        <PowerSettingsNewRounded />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            className: "glass",
            sx: { border: "1px solid rgba(255,255,255,0.1)" },
          },
        }}
      >
        <DialogTitle>Power off the TV?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will send the power key to your TV.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} variant="text">
            Cancel
          </Button>
          <Button
            onClick={send}
            variant="contained"
            color="error"
            sx={{ borderRadius: "16px" }}
          >
            Power
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
