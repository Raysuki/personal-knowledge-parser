export type DesktopAppInfo = {
  name: string;
  version: string;
  isDesktop: boolean;
};

export type DesktopBackendStatus = {
  apiBaseUrl: string;
  backendHealthUrl: string;
  backendReady: boolean;
  configPath: string | null;
  dataDir: string | null;
  missingConfigKeys: string[];
  mode: "browser" | "desktop";
};

const browserApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

let apiBaseUrlPromise: Promise<string> | null = null;

export function isDesktopRuntime() {
  return typeof window !== "undefined" && typeof window.desktopApp !== "undefined";
}

export async function getApiBaseUrl() {
  if (!isDesktopRuntime()) return browserApiBaseUrl;
  if (!apiBaseUrlPromise) {
    apiBaseUrlPromise = window.desktopApp!.getApiBaseUrl().then((value) => value.replace(/\/$/, ""));
  }
  return apiBaseUrlPromise;
}

export async function getDesktopBackendStatus(): Promise<DesktopBackendStatus | null> {
  if (!isDesktopRuntime()) return null;
  return window.desktopApp!.getBackendStatus();
}

export async function getDesktopAppInfo(): Promise<DesktopAppInfo | null> {
  if (!isDesktopRuntime()) return null;
  return window.desktopApp!.getAppInfo();
}
