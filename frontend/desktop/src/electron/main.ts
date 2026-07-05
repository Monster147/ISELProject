import { app, BrowserWindow, screen, session, ipcMain, shell } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import { getPreloadPath } from "./pathResolver.js";

app.on("ready", () => {
  ipcMain.on("open-external", (_event, url: string) => {
    shell.openExternal(url);
  });

  if(!isDev()){
    session.defaultSession.webRequest.onBeforeSendHeaders(
        { urls: ["https://*.ngrok-free.dev/*"]},
        (details, callback) => {
          details.requestHeaders["ngrok-skip-browser-warning"] = "true";
          callback({ requestHeaders: details.requestHeaders });
        }
    )
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: { preload: getPreloadPath() },
    frame: true,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});
