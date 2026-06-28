import { useState } from "react";
import { ChevronDown, FastForward, Pause, Rewind, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RemoteButton } from "./RemoteButton";
import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

export function MoreSection() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium">
        <span>More</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="grid grid-cols-4 gap-2">
          <RemoteButton
            icon={<Rewind className="h-5 w-5" />}
            label="Rew"
            onClick={() => tap(KEY.REWIND)}
          />
          <RemoteButton
            icon={<Pause className="h-5 w-5" />}
            label="Play"
            onClick={() => tap(KEY.PLAY_PAUSE)}
          />
          <RemoteButton
            icon={<FastForward className="h-5 w-5" />}
            label="FF"
            onClick={() => tap(KEY.FAST_FORWARD)}
          />
          <RemoteButton
            icon={<Search className="h-5 w-5" />}
            label="Search"
            onClick={() => tap(KEY.SEARCH)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
