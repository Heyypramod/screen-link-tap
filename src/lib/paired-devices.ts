export interface PairedDevice {
  host: string;
  name: string;
}

const KEY = "tv-remote.paired-devices";

function read(): PairedDevice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(devices: PairedDevice[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(devices));
}

export const pairedDevices = {
  list: read,
  has(host: string) {
    return read().some((d) => d.host === host);
  },
  get(host: string) {
    return read().find((d) => d.host === host);
  },
  add(device: PairedDevice) {
    const list = read().filter((d) => d.host !== device.host);
    list.push(device);
    write(list);
  },
  remove(host: string) {
    write(read().filter((d) => d.host !== host));
  },
};
