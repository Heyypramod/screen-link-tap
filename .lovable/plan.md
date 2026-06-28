# Android TV Remote — Frontend Plan

A dark, minimal, utility-grade Capacitor app. All TV I/O routes through the `AndroidTvRemote` native plugin (already defined). No backend, no auth, no analytics. Paired devices persist in `localStorage`.

## Scope

Three routes in the existing TanStack Start project:
- `/` — Device List (home)
- `/pair/$host` — Pairing
- `/remote/$host` — Remote control

Plus a small plugin shim so the app runs in Lovable's preview without crashing (the real plugin only exists in the Android build).

## File layout

```text
src/
  routes/
    index.tsx                 # Device List
    pair.$host.tsx            # Pairing screen
    remote.$host.tsx          # Remote screen
  lib/
    tv-plugin.ts              # Wraps AndroidTvRemote; web-safe fallback
    paired-devices.ts         # localStorage CRUD for paired TVs
    haptics.ts                # Capacitor Haptics wrapper, no-op on web
    keycodes.ts               # KEYCODE_* string constants
  components/
    remote/
      DPad.tsx                # Circular D-pad w/ long-press support
      TransportRow.tsx        # Back / Home / Menu
      VolumeRocker.tsx        # Up / Down / Mute + live level indicator
      PowerButton.tsx         # Top-corner, danger, confirm dialog
      MoreSection.tsx         # Collapsible media keys + search
      RemoteButton.tsx        # Shared large tap-target button
    devices/
      PairedDeviceCard.tsx
      DiscoveredDeviceCard.tsx
  styles.css                  # Dark theme tokens
```

`src/lib/tv-plugin.ts` re-exports a typed `AndroidTvRemote` object. On Android it uses `registerPlugin<AndroidTvRemotePlugin>('AndroidTvRemote')` from `@capacitor/core`. On web (Lovable preview) it returns a stub whose methods log + resolve with empty data and whose `addListener` returns a no-op handle. This satisfies the "code should still import and call it as if it exists" requirement.

## Screen-by-screen behavior

### 1. Device List (`/`)
- "Scan for TVs" primary button → `AndroidTvRemote.discover()`, spinner + disabled state during the ~5s scan.
- **Your TVs** section: read from `paired-devices.ts`. Each card shows name + host and a Connect button → `connect({ host })`, then navigate to `/remote/$host`. Long-press / overflow → Remove.
- **Found on network** section: results from `discover()`, filtered to hide already-paired hosts. Tap → navigate to `/pair/$host`.
- Empty state illustration + copy when neither list has entries.

### 2. Pairing (`/pair/$host`)
- On mount: `startPairing({ host })`. Show "Look at your TV — enter the 6-digit code shown on screen."
- 6 single-digit inputs with `inputMode="numeric"`, auto-advance on input, backspace moves to previous, paste fills all six.
- Submit (auto on 6th digit + explicit button) → `submitPairingCode({ host, code })`.
  - Success: save `{ host, name }` via `paired-devices.ts`, navigate to `/remote/$host`.
  - Failure: inline error, clear inputs, focus first box. Retry button calls `startPairing` again only if the socket dropped; otherwise just resubmit.
- Cancel button → back to `/`.

### 3. Remote (`/remote/$host`)
- On mount: ensure connected (`connect({ host })` if needed), subscribe to `tvEvent`.
- Layout, top to bottom:
  1. Top bar: device name (left), Power button (right, red, opens AlertDialog confirm → `KEYCODE_POWER`).
  2. Volume indicator overlay that appears briefly when `{type:'volume'}` events arrive (level/max bar + mute icon).
  3. Circular D-pad (`DPad.tsx`): 4 arrow regions + center OK. Each arrow supports:
     - Tap → `sendKey({ keyCode, direction:'SHORT' })`.
     - Press-and-hold → `START_LONG` on pointerdown, `END_LONG` on pointerup / pointercancel / pointerleave. Use a ~250ms threshold to distinguish tap from hold; on hold, do **not** also send SHORT.
     - Center OK is tap-only (SHORT).
  4. Transport row: Back / Home / Menu.
  5. Volume rocker: Up / Down / Mute.
  6. Collapsible "More" (shadcn `Collapsible`): Play/Pause, Rewind, Fast-Forward, Search.
- Every button press triggers `haptics.impact('Light')` (no-op on web).
- `tvEvent` `disconnected` → `sonner` toast with error, then `navigate({ to: '/' })`.
- On unmount: remove the listener; do NOT auto-disconnect (user may briefly background the app). Disconnect explicitly only via a back/close action.

## Plugin shim (technical detail)

```ts
// src/lib/tv-plugin.ts
import { Capacitor, registerPlugin } from '@capacitor/core';

export type Direction = 'SHORT' | 'START_LONG' | 'END_LONG';
export interface AndroidTvRemotePlugin { /* mirrors web/definitions.ts */ }

const web: AndroidTvRemotePlugin = {
  discover: async () => ({ devices: [] }),
  startPairing: async () => {},
  submitPairingCode: async () => {},
  connect: async () => {},
  sendKey: async () => {},
  launchApp: async () => {},
  disconnect: async () => {},
  addListener: async () => ({ remove: async () => {} }),
};

export const AndroidTvRemote: AndroidTvRemotePlugin =
  Capacitor.getPlatform() === 'web'
    ? web
    : registerPlugin<AndroidTvRemotePlugin>('AndroidTvRemote');
```

## Persistence

`src/lib/paired-devices.ts` exposes `list()`, `add({host,name})`, `remove(host)`, `has(host)` over `localStorage` key `tv-remote.paired-devices` (JSON array). Synchronous, no migration needed.

## Design tokens (dark, high-contrast)

Update `src/styles.css` `:root` to default-dark (drop the `.dark` gating for this app since it's always dark):
- `--background`: near-black `oklch(0.16 0 0)`
- `--foreground`: `oklch(0.98 0 0)`
- `--card`: `oklch(0.21 0 0)`
- `--primary`: bright cyan-blue accent `oklch(0.78 0.14 230)` for D-pad/OK
- `--destructive`: `oklch(0.62 0.22 25)` for Power
- `--radius`: `1rem` for large rounded targets
- Min tap target 64px; D-pad ~280px diameter; arrow hit zones full quadrants.
- Use system font stack; no decorative typography.

## Dependencies

- `@capacitor/core` (for `registerPlugin`, `Capacitor.getPlatform`)
- `@capacitor/haptics` (optional; wrapped so missing plugin = no-op)

Both installed via `bun add` during build. No other new deps; reuse shadcn `Button`, `AlertDialog`, `Collapsible`, `Input`, `sonner` already in the project.

## Out of scope

- The native Android plugin itself (user is providing).
- `launchApp` UI — keeping spec to the three listed screens; the function is still exposed via the plugin shim for later.
- Tests, CI, publish flow.

## Verification

After build: typecheck, then load `/` in the Lovable preview — Scan button should call the web stub, show "no devices", and the three routes should render without runtime errors. Real device behavior gets verified by the user in the Capacitor Android build.
