const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "desktop-dist", "backend");
const workPath = path.join(projectRoot, ".pyinstaller", "build");
const specPath = path.join(projectRoot, ".pyinstaller");

fs.mkdirSync(outputRoot, { recursive: true });
fs.mkdirSync(workPath, { recursive: true });
fs.mkdirSync(specPath, { recursive: true });

const pyinstallerArgs = [
  "-m",
  "PyInstaller",
  "--noconfirm",
  "--clean",
  "--onedir",
  "--name",
  "profileflow-backend",
  "--distpath",
  outputRoot,
  "--workpath",
  workPath,
  "--specpath",
  specPath,
  "--hidden-import",
  "uvicorn.logging",
  "--hidden-import",
  "uvicorn.loops.auto",
  "--hidden-import",
  "uvicorn.protocols.http.auto",
  "--hidden-import",
  "uvicorn.protocols.websockets.auto",
  "--hidden-import",
  "uvicorn.lifespan.on",
  "--hidden-import",
  "multipart",
  "--hidden-import",
  "fitz",
  "--hidden-import",
  "paddleocr",
  "main.py",
];

const result = spawnSync(process.env.PROFILEFLOW_PYTHON ?? "python", pyinstallerArgs, {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
