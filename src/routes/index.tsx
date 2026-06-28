import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Radio, Tv, Trash2, Wifi } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AndroidTvRemote, type TvDevice } from "@/lib/tv-plugin";
import { pairedDevices, type PairedDevice } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TV Remote" },
      { name: "description", content: "Control your Android TV." },
    ],
  }),
  component: DeviceListPage,
});

function DeviceListPage() {
  const navigate = useNavigate();
  const [paired, setPaired] = useState<PairedDevice[]>([]);
  const [discovered, setDiscovered] = useState<TvDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    setPaired(pairedDevices.list());
  }, []);

  const scan = useCallback(async () => {
    setScanning(true);
    tapHaptic("Light");
    try {
      const res = await AndroidTvRemote.discover();
      setDiscovered(res.devices ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Scan failed", { description: String(err) });
    } finally {
      setScanning(false);
    }
  }, []);

  const connectPaired = useCallback(
    async (device: PairedDevice) => {
      tapHaptic("Medium");
      setConnecting(device.host);
      try {
        await AndroidTvRemote.connect({ host: device.host });
        navigate({ to: "/remote/$host", params: { host: device.host } });
      } catch (err) {
        toast.error("Couldn't connect", { description: String(err) });
        setConnecting(null);
      }
    },
    [navigate],
  );

  const removePaired = useCallback((host: string) => {
    pairedDevices.remove(host);
    setPaired(pairedDevices.list());
    tapHaptic("Light");
  }, []);

  const pairedHosts = new Set(paired.map((d) => d.host));
  const unpaired = discovered.filter((d) => !pairedHosts.has(d.host));
  const nothing = paired.length === 0 && discovered.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-8">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">TV Remote</h1>
            <p className="text-xs text-muted-foreground">
              Control Android TVs on your network
            </p>
          </div>
        </header>

        <Button
          size="lg"
          onClick={scan}
          disabled={scanning}
          className="h-14 rounded-2xl text-base font-semibold"
        >
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Radio className="mr-2 h-5 w-5" />
              Scan for TVs
            </>
          )}
        </Button>

        {paired.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your TVs
            </h2>
            {paired.map((d) => (
              <div
                key={d.host}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Tv className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d.host}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePaired(d.host)}
                  aria-label={`Remove ${d.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => connectPaired(d)}
                  disabled={connecting === d.host}
                  className="rounded-xl"
                >
                  {connecting === d.host ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            ))}
          </section>
        )}

        {unpaired.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Found on network
            </h2>
            {unpaired.map((d) => (
              <button
                key={d.host}
                onClick={() => {
                  tapHaptic("Light");
                  navigate({ to: "/pair/$host", params: { host: d.host } });
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent active:bg-accent"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Wifi className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d.host}
                  </div>
                </div>
                <div className="text-xs font-medium text-primary">Pair</div>
              </button>
            ))}
          </section>
        )}

        {nothing && !scanning && (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Tv className="h-7 w-7" />
            </div>
            <div className="font-medium">No TVs yet</div>
            <p className="max-w-[14rem] text-sm text-muted-foreground">
              Make sure your TV is on and on the same Wi-Fi, then scan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
