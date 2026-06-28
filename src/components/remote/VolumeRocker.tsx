import { Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

function tap(keyCode: string) {
  tapHaptic("Light");
  AndroidTvRemote.sendKey({ keyCode, direction: "SHORT" }).catch(console.error);
}

interface Props {
  volume: { level: number; max: number; muted: boolean } | null;
}

export function VolumeRocker({ volume }: Props) {
  const pct = volume
    ? Math.round((volume.level / Math.max(volume.max, 1)) * 100)
    : null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wider">Volume</span>
        {volume && (
          <span className="tabular-nums">
            {volume.muted ? "Muted" : `${pct}%`}
          </span>
        )}
      </div>
      {volume && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: volume.muted ? "0%" : `${pct}%` }}
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <RemoteButton
          icon={<Minus className="h-5 w-5" />}
          onClick={() => tap(KEY.VOLUME_DOWN)}
          aria-label="Volume down"
        />
        <RemoteButton
          icon={
            volume?.muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )
          }
          onClick={() => tap(KEY.VOLUME_MUTE)}
          aria-label="Mute"
        />
        <RemoteButton
          icon={<Plus className="h-5 w-5" />}
          onClick={() => tap(KEY.VOLUME_UP)}
          aria-label="Volume up"
        />
      </div>
    </div>
  );
}
