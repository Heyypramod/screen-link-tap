import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { ArrowLeft, Loader2, Tv } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AndroidTvRemote } from "@/lib/tv-plugin";
import { pairedDevices } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/pair/$host")({
  head: () => ({
    meta: [{ title: "Pair TV — TV Remote" }],
  }),
  component: PairPage,
});

function PairPage() {
  const { host } = Route.useParams();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStarting(true);
      try {
        await AndroidTvRemote.startPairing({ host });
      } catch (err) {
        if (!cancelled) setError(`Couldn't start pairing: ${String(err)}`);
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [host]);

  const submit = async (code: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await AndroidTvRemote.submitPairingCode({ host, code });
      pairedDevices.add({ host, name: host });
      tapHaptic("Medium");
      navigate({ to: "/remote/$host", params: { host } });
    } catch (err) {
      setError(`Invalid code. ${String(err)}`);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      toast.error("Pairing failed");
    } finally {
      setSubmitting(false);
    }
  };

  const setDigit = (idx: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
    if (next.every((d) => d.length === 1)) {
      void submit(next.join(""));
    }
  };

  const onKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) void submit(text);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">{host}</div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Tv className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Pair your TV</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Look at your TV — enter the 6-digit code shown on screen.
          </p>
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoFocus={i === 0}
              disabled={submitting || starting}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-11 rounded-xl border border-border bg-card text-center text-2xl font-semibold tabular-nums caret-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          ))}
        </div>

        {starting && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening pairing channel…
          </div>
        )}

        {submitting && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying code…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => submit(digits.join(""))}
            disabled={digits.some((d) => !d) || submitting}
            className="h-12 rounded-xl"
          >
            Pair
          </Button>
          <Button asChild variant="ghost" className="h-12 rounded-xl">
            <Link to="/">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
