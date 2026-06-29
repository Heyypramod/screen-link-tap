import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { toast } from "sonner";

import { AndroidTvRemote } from "@/lib/tv-plugin";
import { pairedDevices } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/pair/$host")({
  head: () => ({ meta: [{ title: "Pair TV — TV Remote" }] }),
  component: PairPage,
});

function PairPage() {
  const { host } = Route.useParams();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [focused, setFocused] = useState(0);
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
    if (next.every((d) => d.length === 1)) void submit(next.join(""));
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

  const complete = digits.every((d) => d.length === 1);

  return (
    <Box sx={{ minHeight: "100vh", pb: "80px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto" }}>
        {/* iOS-style top nav */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            minHeight: 44,
          }}
        >
          <Link
            to="/"
            style={{
              color: "var(--color-blue)",
              textDecoration: "none",
              fontSize: 17,
              letterSpacing: "-0.4px",
            }}
          >
            ‹ Cancel
          </Link>
          <Typography className="text-headline" noWrap sx={{ flex: 1, textAlign: "center", mx: 2 }}>
            {host}
          </Typography>
          <Box sx={{ width: 60 }} />
        </Box>

        <Box sx={{ textAlign: "center", px: 3, pt: 5, pb: 4 }}>
          <Typography
            component="h1"
            sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", mb: 1 }}
          >
            Enter the code
          </Typography>
          <Typography className="text-subheadline" sx={{ color: "var(--label-secondary)" }}>
            Look at your TV for a 6-digit code
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, px: 2 }}>
          {digits.map((d, i) => (
            <Box
              key={i}
              component="input"
              ref={(el: HTMLInputElement | null) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDigit(i, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKey(i, e)}
              onPaste={onPaste}
              onFocus={() => setFocused(i)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoFocus={i === 0}
              disabled={submitting || starting}
              aria-label={`Digit ${i + 1}`}
              className="material-regular corner-continuous"
              sx={{
                width: 44,
                height: 56,
                borderRadius: "var(--radius-sm)",
                border: "none",
                color: "var(--label-primary)",
                textAlign: "center",
                fontSize: 22,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                outline: "none",
                fontFamily: "inherit",
                transition: "box-shadow 150ms var(--spring-snappy)",
                boxShadow: focused === i ? "0 0 0 2px var(--color-blue)" : "none",
                "&:disabled": { opacity: 0.5 },
              }}
            />
          ))}
        </Box>

        {(starting || submitting) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              pt: 3,
              color: "var(--label-secondary)",
            }}
          >
            <CircularProgress size={14} sx={{ color: "var(--label-secondary)" }} />
            <Typography className="text-footnote">
              {starting ? "Opening pairing channel…" : "Verifying code…"}
            </Typography>
          </Box>
        )}

        {error && (
          <Typography
            className="text-footnote"
            sx={{ color: "var(--color-red)", textAlign: "center", mt: 2, px: 3 }}
          >
            {error}
          </Typography>
        )}

        <Box sx={{ px: 2, pt: 4 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => submit(digits.join(""))}
            disabled={!complete || submitting}
          >
            Pair
          </button>
        </Box>
      </Box>
    </Box>
  );
}
