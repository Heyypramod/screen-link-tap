import { ArrowLeft, Home, Menu } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

export function TransportRow() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <RemoteButton
        icon={<ArrowLeft className="h-5 w-5" />}
        label="Back"
        onClick={() => tap(KEY.BACK)}
      />
      <RemoteButton
        icon={<Home className="h-5 w-5" />}
        label="Home"
        onClick={() => tap(KEY.HOME)}
      />
      <RemoteButton
        icon={<Menu className="h-5 w-5" />}
        label="Menu"
        onClick={() => tap(KEY.MENU)}
      />
    </div>
  );
}
