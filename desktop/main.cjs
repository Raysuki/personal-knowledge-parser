const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const APP_NAME = "ProfileFlow";
const projectRoot = __dirname ? path.resolve(__dirname, "..") : process.cwd();

let backendProcess = null;
let backendStatus = {
  apiBaseUrl: "",
  backendHealthUrl: "",
  backendReady: false,
  configPath: null,
  dataDir: null,
  missingConfigKeys: [],
  mode: "desktop",
};

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
  return targetPath;
}

function getConfigPath() {
  return path.join(app.getPath("userData"), "config.env");
}

function ensureDesktopConfigTemplate() {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) return configPath;
  const template = [
    "ARK_API_KEY=",
    "ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3",
    "ARK_TEXT_ENDPOINT_ID=",
    "ARK_VISION_ENDPOINT_ID=",
    "ARK_TIMEOUT=180",
    "ARK_MAX_TOKENS=4000",
    "OCR_LANG=ch",
    "PDF_TEXT_THRESHOLD=80",
    "MAX_TEXT_CHARS=12000",
    "",
  ].join("\n");
  fs.writeFileSync(configPath, template, "utf8");
  return configPath;
}

function readMissingConfigKeys(configPath) {
  const content = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
  const requiredKeys = ["ARK_API_KEY", "ARK_TEXT_ENDPOINT_ID", "ARK_VISION_ENDPOINT_ID"];
  return requiredKeys.filter((key) => !new RegExp(`^${key}=.+$`, "m").test(content));
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => {
        if (!port) reject(new Error("Unable to determine a free port."));
        else resolve(port);
      });
    });
    server.on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBackend(healthUrl, retries = 80) {
  for (let index = 0; index < retries; index += 1) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        const payload = await response.json();
        backendStatus = { ...backendStatus, ...payload, backendReady: true, apiBaseUrl: backendStatus.apiBaseUrl, backendHealthUrl: healthUrl };
        return payload;
      }
    } catch (error) {
      if (backendProcess && backendProcess.exitCode !== null) break;
    }
    await wait(500);
  }
  throw new Error("The local backend did not become ready in time.");
}

function createFailureWindow(error) {
  const window = new BrowserWindow({
    width: 920,
    height: 680,
    backgroundColor: "#f7f1ff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const safeMessage = String(error?.message ?? error).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeConfigPath = String(backendStatus.configPath ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  window.loadURL(`data:text/html;charset=utf-8,
    <html>
      <body style="font-family:'Microsoft YaHei UI',sans-serif;background:#f7f1ff;color:#24103f;padding:40px;">
        <h1 style="margin:0 0 16px;">ProfileFlow 启动失败</h1>
        <p style="font-size:16px;line-height:1.8;">本地解析服务没有成功启动。你可以先检查桌面配置文件，然后重新打开应用。</p>
        <pre style="white-space:pre-wrap;background:white;border-radius:16px;padding:20px;border:1px solid #e7dcff;">${safeMessage}</pre>
        <p style="font-size:14px;color:#5b4d73;">配置文件位置: ${safeConfigPath}</p>
      </body>
    </html>`);
}

async function startBackend() {
  const dataDir = ensureDir(app.getPath("userData"));
  const configPath = ensureDesktopConfigTemplate();
  const missingConfigKeys = readMissingConfigKeys(configPath);
  const port = await getFreePort();
  const healthUrl = `http://127.0.0.1:${port}/health`;

  backendStatus = {
    apiBaseUrl: `http://127.0.0.1:${port}`,
    backendHealthUrl: healthUrl,
    backendReady: false,
    configPath,
    dataDir,
    missingConfigKeys,
    mode: "desktop",
  };

  const env = {
    ...process.env,
    PROFILEFLOW_RUNTIME_MODE: "desktop",
    PROFILEFLOW_PORT: String(port),
    PROFILEFLOW_HOST: "127.0.0.1",
    PROFILEFLOW_DATA_DIR: dataDir,
  };

  if (app.isPackaged) {
    const exePath = path.join(process.resourcesPath, "backend", "profileflow-backend", "profileflow-backend.exe");
    backendProcess = spawn(exePath, [], {
      cwd: process.resourcesPath,
      env,
      stdio: "ignore",
      windowsHide: true,
    });
  } else {
    backendProcess = spawn(process.env.PROFILEFLOW_PYTHON ?? "python", ["main.py"], {
      cwd: projectRoot,
      env,
      stdio: "ignore",
      windowsHide: true,
    });
  }

  backendProcess.once("exit", () => {
    backendStatus = { ...backendStatus, backendReady: false };
  });

  await waitForBackend(healthUrl);
}

async function createMainWindow() {
  const browserWindow = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1280,
    minHeight: 840,
    backgroundColor: "#f4ecff",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
  });

  await browserWindow.loadFile(path.join(projectRoot, "out", "index.html"));
}

function registerIpcHandlers() {
  ipcMain.handle("desktop:get-app-info", () => ({
    name: APP_NAME,
    version: app.getVersion(),
    isDesktop: true,
  }));

  ipcMain.handle("desktop:get-api-base-url", () => backendStatus.apiBaseUrl);
  ipcMain.handle("desktop:get-backend-status", () => backendStatus);
  ipcMain.handle("desktop:open-config-directory", async () => {
    const configPath = ensureDesktopConfigTemplate();
    await shell.showItemInFolder(configPath);
    return configPath;
  });
  ipcMain.handle("desktop:open-path", async (_event, targetPath) => {
    if (!targetPath) return "";
    return shell.openPath(targetPath);
  });
}

app.whenReady().then(async () => {
  registerIpcHandlers();
  try {
    await startBackend();
    await createMainWindow();
  } catch (error) {
    createFailureWindow(error);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess && backendProcess.exitCode === null) {
    backendProcess.kill();
  }
});
