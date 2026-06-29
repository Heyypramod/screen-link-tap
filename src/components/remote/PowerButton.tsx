import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Power } from "lucide-react";

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
      <button
        type="button"
        aria-label="Power"
        onClick={() => {
          tapHaptic("Light");
          setOpen(true);
        }}
        className="tap-target"
        style={{
          background: "transparent",
          border: "none",
          padding: 6,
          cursor: "pointer",
          color: "var(--color-red)",
          display: "flex",
        }}
      >
        <Power size={22} strokeWidth={2} />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            className: "material-thick",
            sx: {
              borderRadius: "var(--radius-lg)",
              m: 2,
              background: "rgba(40, 40, 44, 0.92)",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 17, textAlign: "center", pb: 0.5 }}>
          Power off the TV?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            className="text-subheadline"
            sx={{ textAlign: "center", color: "var(--label-secondary)" }}
          >
            This will send the power key to your TV.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            fullWidth
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: "var(--radius-md)",
              background: "var(--fill-tertiary)",
              color: "var(--label-primary)",
              "&:hover": { background: "var(--fill-secondary)" },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={send}
            sx={{
              borderRadius: "var(--radius-md)",
              background: "var(--color-red)",
              "&:hover": { background: "var(--color-red)", opacity: 0.9 },
            }}
          >
            Power
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
