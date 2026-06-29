import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type KeyDirection = "SHORT" | "START_LONG" | "END_LONG";

export interface TvDevice {
  name: string;
  host: string;
  port: number;
}

export type TvEvent =
  | { type: "volume"; level: number; max: number; muted: boolean }
  | { type: "disconnected"; error?: string };

export interface AndroidTvRemotePlugin {
  discover(): Promise<{ devices: TvDevice[] }>;
  startPairing(opts: { host: string }): Promise<void>;
  submitPairingCode(opts: { host: string; code: string }): Promise<void>;
  connect(opts: { host: string }): Promise<void>;
  sendKey(opts: { keyCode: string; direction: KeyDirection }): Promise<void>;
  launchApp(opts: { appLink: string }): Promise<void>;
  disconnect(): Promise<void>;
  addListener(event: "tvEvent", cb: (ev: TvEvent) => void): Promise<PluginListenerHandle>;
}

const noopHandle: PluginListenerHandle = {
  remove: async () => {},
};

const webStub: AndroidTvRemotePlugin = {
  discover: async () => {
    console.info("[AndroidTvRemote.web] discover() — preview stub");
    return { devices: [] };
  },
  startPairing: async ({ host }) => {
    console.info("[AndroidTvRemote.web] startPairing", host);
  },
  submitPairingCode: async ({ host, code }) => {
    console.info("[AndroidTvRemote.web] submitPairingCode", host, code);
  },
  connect: async ({ host }) => {
    console.info("[AndroidTvRemote.web] connect", host);
  },
  sendKey: async ({ keyCode, direction }) => {
    console.info("[AndroidTvRemote.web] sendKey", keyCode, direction);
  },
  launchApp: async ({ appLink }) => {
    console.info("[AndroidTvRemote.web] launchApp", appLink);
  },
  disconnect: async () => {
    console.info("[AndroidTvRemote.web] disconnect");
  },
  addListener: async () => noopHandle,
};

export const AndroidTvRemote: AndroidTvRemotePlugin =
  Capacitor.getPlatform() === "web"
    ? webStub
    : registerPlugin<AndroidTvRemotePlugin>("AndroidTvRemote");

export const isNativePlatform = () => Capacitor.getPlatform() !== "web";
