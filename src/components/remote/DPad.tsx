import { useRef, type PointerEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { KEY } from "@/lib/keycodes";
import { AndroidTvRemote, type KeyDirection } from "@/lib/tv-plugin";
import { tapHaptic } from "@/lib/haptics";

type Arrow = "up" | "down" | "left" | "right";

const ARROW_KEY: Record<Arrow, string> = {
  up: KEY.DPAD_UP,
  down: KEY.DPAD_DOWN,
  left: KEY.DPAD_LEFT,
  right: KEY.DPAD_RIGHT,
};

const LONG_PRESS_MS = 250;

function send(keyCode: string, direction: KeyDirection) {
  AndroidTvRemote.sendKey({ keyCode, direction }).catch((err) => {
    console.error("sendKey failed", err);
  });
}

export function DPad() {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const longActive = useRef<Record<string, boolean>>({});

  const start = (arrow: Arrow) => (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    tapHaptic("Light");
    longActive.current[arrow] = false;
    timers.current[arrow] = setTimeout(() => {
      longActive.current[arrow] = true;
      send(ARROW_KEY[arrow], "START_LONG");
    }, LONG_PRESS_MS);
  };

  const end = (arrow: Arrow) => () => {
    const t = timers.current[arrow];
    if (t) clearTimeout(t);
    timers.current[arrow] = null;
    if (longActive.current[arrow]) {
      send(ARROW_KEY[arrow], "END_LONG");
      longActive.current[arrow] = false;
    } else {
      send(ARROW_KEY[arrow], "SHORT");
    }
  };

  const cancel = (arrow: Arrow) => () => {
    const t = timers.current[arrow];
    if (t) {
      clearTimeout(t);
      timers.current[arrow] = null;
    }
    if (longActive.current[arrow]) {
      send(ARROW_KEY[arrow], "END_LONG");
      longActive.current[arrow] = false;
    }
  };

  const arrowCls =
    "absolute flex items-center justify-center text-foreground transition active:bg-primary/20 select-none";

  const onOk = () => {
    tapHaptic("Medium");
    send(KEY.DPAD_CENTER, "SHORT");
  };

  return (
    <div className="relative mx-auto aspect-square w-[18rem] max-w-full">
      <div className="absolute inset-0 rounded-full border border-border bg-card shadow-inner" />

      {(["up", "down", "left", "right"] as Arrow[]).map((arrow) => {
        const pos =
          arrow === "up"
            ? "left-1/2 top-0 h-1/2 w-1/2 -translate-x-1/2 rounded-t-full"
            : arrow === "down"
              ? "left-1/2 bottom-0 h-1/2 w-1/2 -translate-x-1/2 rounded-b-full"
              : arrow === "left"
                ? "left-0 top-1/2 h-1/2 w-1/2 -translate-y-1/2 rounded-l-full"
                : "right-0 top-1/2 h-1/2 w-1/2 -translate-y-1/2 rounded-r-full";
        const align =
          arrow === "up"
            ? "items-start pt-5"
            : arrow === "down"
              ? "items-end pb-5"
              : arrow === "left"
                ? "justify-start pl-5"
                : "justify-end pr-5";
        const Icon =
          arrow === "up"
            ? ChevronUp
            : arrow === "down"
              ? ChevronDown
              : arrow === "left"
                ? ChevronLeft
                : ChevronRight;
        return (
          <button
            key={arrow}
            aria-label={arrow}
            className={cn(arrowCls, pos, align)}
            onPointerDown={start(arrow)}
            onPointerUp={end(arrow)}
            onPointerCancel={cancel(arrow)}
            onPointerLeave={cancel(arrow)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Icon className="h-7 w-7" />
          </button>
        );
      })}

      <button
        onClick={onOk}
        aria-label="OK"
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-lg transition active:scale-95"
      >
        OK
      </button>
    </div>
  );
}
