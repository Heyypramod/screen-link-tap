import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AndroidTvRemote, type TvEvent } from "@/lib/tv-plugin";
import { pairedDevices } from "@/lib/paired-devices";
import { DPad } from "@/components/remote/DPad";
import { TransportRow } from "@/components/remote/TransportRow";
import { VolumeRocker } from "@/components/remote/VolumeRocker";
import { PowerButton } from "@/components/remote/PowerButton";
import { MoreSection } from "@/components/remote/MoreSection";

export const Route = createFileRoute("/remote/$host")({
  head: () => ({
    meta: [{ title: "Remote — TV Remote" }],
  }),
  component: RemotePage,
});

type Volume = { level: number; max: number; muted: boolean };

function RemotePage() {
  const { host } = Route.useParams();
  const navigate = useNavigate();
  const [volume, setVolume] = useState<Volume | null>(null);
  const name = pairedDevices.get(host)?.name ?? host;

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | null = null;
    let cancelled = false;

    (async () => {
      try {
        await AndroidTvRemote.connect({ host });
      } catch (err) {
        if (!cancelled) {
          toast.error("Couldn't connect", { description: String(err) });
          navigate({ to: "/" });
        }
        return;
      }
      handle = await AndroidTvRemote.addListener("tvEvent", (ev: TvEvent) => {
        if (ev.type === "volume") {
          setVolume({ level: ev.level, max: ev.max, muted: ev.muted });
        } else if (ev.type === "disconnected") {
          toast.error("Disconnected from TV", { description: ev.error });
          navigate({ to: "/" });
        }
      });
    })();

    return () => {
      cancelled = true;
      void handle?.remove();
    };
  }, [host, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-5 py-5">
        <header className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link
              to="/"
              onClick={() => {
                void AndroidTvRemote.disconnect();
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {host}
            </div>
          </div>
          <PowerButton />
        </header>

        <div className="pt-2">
          <DPad />
        </div>

        <TransportRow />

        <VolumeRocker volume={volume} />

        <MoreSection />
      </div>
    </div>
  );
}
