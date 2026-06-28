import { useState } from "react";
import { Power } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          aria-label="Power"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive transition active:scale-95"
          onClick={() => tapHaptic("Light")}
        >
          <Power className="h-5 w-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Power off the TV?</AlertDialogTitle>
          <AlertDialogDescription>
            This will send the power key to your TV.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={send}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Power
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
