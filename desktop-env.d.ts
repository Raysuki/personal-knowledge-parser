import type { DesktopAppInfo, DesktopBackendStatus } from "@/lib/desktop-config";

declare global {
  interface Window {
    desktopApp?: {
      getAppInfo: () => Promise<DesktopAppInfo>;
      getApiBaseUrl: () => Promise<string>;
      getBackendStatus: () => Promise<DesktopBackendStatus>;
      openConfigDirectory: () => Promise<string>;
      openPath: (targetPath: string) => Promise<string>;
    };
  }
}

export {};
