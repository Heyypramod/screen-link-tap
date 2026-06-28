import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBackRounded, TvRounded } from "@mui/icons-material";
import { toast } from "sonner";

import { AndroidTvRemote } from "@/lib/tv-plugin";
import { pairedDevices } from "@/lib/paired-devices";
import { tapHaptic } from "@/lib/haptics";
import { GlassSurface } from "@/components/GlassSurface";

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
    <Box sx={{ minHeight: "100vh", color: "text.primary", pb: "96px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto", px: 2.5, py: 2 }}>
        <Stack direction="row" style={{ alignItems: "center" }} spacing={1}>
          <IconButton component={Link} to="/" aria-label="Back" sx={{ color: "text.primary" }}>
            <ArrowBackRounded />
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {host}
          </Typography>
        </Stack>

        <Stack style={{ alignItems: "center" }} spacing={1.5} sx={{ pt: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(182,157,248,0.15)",
              color: "primary.main",
            }}
          >
            <TvRounded sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Pair your TV
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
            Look at your TV — enter the 6-digit code shown on screen.
          </Typography>
        </Stack>

        <GlassSurface sx={{ p: 2, mt: 4 }}>
          <Stack direction="row" style={{ justifyContent: "center" }} spacing={1}>
            {digits.map((d, i) => (
              <Box
                key={i}
                component="input"
                ref={(el: HTMLInputElement | null) => {
                  inputsRef.current[i] = el;
                }}
                value={d}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDigit(i, e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKey(i, e)}
                onPaste={onPaste}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoFocus={i === 0}
                disabled={submitting || starting}
                aria-label={`Digit ${i + 1}`}
                sx={{
                  width: 44,
                  height: 56,
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  bgcolor: "rgba(255,255,255,0.04)",
                  color: "text.primary",
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  outline: "none",
                  transition: "border-color 150ms, box-shadow 150ms",
                  caretColor: "var(--mui-palette-primary-main, #B69DF8)",
                  "&:focus": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 3px rgba(182,157,248,0.25)",
                  },
                  "&:disabled": { opacity: 0.5 },
                }}
              />
            ))}
          </Stack>
        </GlassSurface>

        {(starting || submitting) && (
          <Stack
            direction="row"
            style={{ alignItems: "center", justifyContent: "center" }}
            spacing={1}
            sx={{ pt: 2, color: "text.secondary" }}
          >
            <CircularProgress size={16} />
            <Typography variant="body2">
              {starting ? "Opening pairing channel…" : "Verifying code…"}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: "16px" }} variant="outlined">
            {error}
          </Alert>
        )}

        <Stack spacing={1} sx={{ pt: 3 }}>
          <Button
            variant="contained"
            onClick={() => submit(digits.join(""))}
            disabled={digits.some((d) => !d) || submitting}
            sx={{ minHeight: 52, borderRadius: "16px" }}
          >
            Pair
          </Button>
          <Button component={Link} to="/" variant="text" sx={{ minHeight: 52 }}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
