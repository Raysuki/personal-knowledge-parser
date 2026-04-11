const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", {
  getAppInfo: () => ipcRenderer.invoke("desktop:get-app-info"),
  getApiBaseUrl: () => ipcRenderer.invoke("desktop:get-api-base-url"),
  getBackendStatus: () => ipcRenderer.invoke("desktop:get-backend-status"),
  openConfigDirectory: () => ipcRenderer.invoke("desktop:open-config-directory"),
  openPath: (targetPath) => ipcRenderer.invoke("desktop:open-path", targetPath),
});
