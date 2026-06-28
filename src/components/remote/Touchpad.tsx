import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Box } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
} from "@mui/icons-material";

import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote, type KeyDirection } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

const SWIPE_MIN_PX = 30;
const AXIS_RATIO = 2; // dominant axis must beat the other by 2x
const TAP_MAX_MS = 200;
const LONG_PRESS_MS = 500;
const TAP_MOVE_TOLERANCE = 8; // px — finger jitter still counts as no movement

type Direction = "up" | "down" | "left" | "right";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

function send(keyCode: string, direction: KeyDirection) {
  AndroidTvRemote.sendKey({ keyCode, direction }).catch((err) => {
    console.error("sendKey failed", err);
  });
}

const ARROW_KEY: Record<Direction, string> = {
  up: KEY.DPAD_UP,
  down: KEY.DPAD_DOWN,
  left: KEY.DPAD_LEFT,
  right: KEY.DPAD_RIGHT,
};

export function Touchpad() {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longActive = useRef(false);
  const rippleId = useRef(0);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [arrowFlash, setArrowFlash] = useState<Direction | null>(null);
  const arrowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashArrow = (dir: Direction) => {
    if (arrowTimer.current) clearTimeout(arrowTimer.current);
    setArrowFlash(dir);
    arrowTimer.current = setTimeout(() => setArrowFlash(null), 180);
  };

  const addRipple = (x: number, y: number) => {
    const id = ++rippleId.current;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 600);
  };

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    longActive.current = false;
    addRipple(x, y);

    longTimer.current = setTimeout(() => {
      if (!start.current) return;
      longActive.current = true;
      tapHaptic("Medium");
      send(KEY.DPAD_CENTER, "START_LONG");
    }, LONG_PRESS_MS);
  };

  const clearLong = () => {
    if (longTimer.current) {
      clearTimeout(longTimer.current);
      longTimer.current = null;
    }
  };

  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    clearLong();
    if (!s) return;

    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const dt = performance.now() - s.t;

    if (longActive.current) {
      send(KEY.DPAD_CENTER, "END_LONG");
      longActive.current = false;
      return;
    }

    // Swipe detection — require dominant axis.
    if (adx >= SWIPE_MIN_PX && adx >= AXIS_RATIO * ady) {
      const dir: Direction = dx > 0 ? "right" : "left";
      tapHaptic("Light");
      flashArrow(dir);
      send(ARROW_KEY[dir], "SHORT");
      return;
    }
    if (ady >= SWIPE_MIN_PX && ady >= AXIS_RATIO * adx) {
      const dir: Direction = dy > 0 ? "down" : "up";
      tapHaptic("Light");
      flashArrow(dir);
      send(ARROW_KEY[dir], "SHORT");
      return;
    }

    // Tap: small movement and quick.
    if (adx <= TAP_MOVE_TOLERANCE && ady <= TAP_MOVE_TOLERANCE && dt < TAP_MAX_MS) {
      tapHaptic("Medium");
      send(KEY.DPAD_CENTER, "SHORT");
    }
  };

  const onPointerCancel = () => {
    start.current = null;
    if (longActive.current) {
      send(KEY.DPAD_CENTER, "END_LONG");
      longActive.current = false;
    }
    clearLong();
  };

  const ArrowIcon =
    arrowFlash === "up"
      ? KeyboardArrowUp
      : arrowFlash === "down"
        ? KeyboardArrowDown
        : arrowFlash === "left"
          ? KeyboardArrowLeft
          : arrowFlash === "right"
            ? KeyboardArrowRight
            : null;

  return (
    <Box
      ref={surfaceRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className="glass"
      sx={{
        position: "relative",
        width: "70%",
        aspectRatio: "1 / 1",
        mx: "auto",
        borderRadius: "32px",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        transition: "transform 80ms ease",
        "&:active": { transform: "scale(0.995)" },
      }}
    >
      {/* center dot affordance */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.16)",
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: 600,
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        Touch
      </Box>

      {/* ripples */}
      {ripples.map((r) => (
        <Box
          key={r.id}
          sx={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 24,
            height: 24,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(182, 157, 248, 0.45)",
            pointerEvents: "none",
            animation: "tp-ripple 600ms ease-out forwards",
            "@keyframes tp-ripple": {
              "0%": { opacity: 0.6, transform: "translate(-50%, -50%) scale(0.4)" },
              "100%": { opacity: 0, transform: "translate(-50%, -50%) scale(8)" },
            },
          }}
        />
      ))}

      {/* arrow flash */}
      {ArrowIcon && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            color: "primary.main",
            animation: "tp-arrow 180ms ease-out forwards",
            "@keyframes tp-arrow": {
              "0%": { opacity: 0, transform: "scale(0.7)" },
              "40%": { opacity: 1, transform: "scale(1.1)" },
              "100%": { opacity: 0, transform: "scale(1)" },
            },
          }}
        >
          <ArrowIcon sx={{ fontSize: 96, filter: "drop-shadow(0 0 12px rgba(182,157,248,0.6))" }} />
        </Box>
      )}
    </Box>
  );
}
