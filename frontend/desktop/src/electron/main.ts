import {app, BrowserWindow, screen} from 'electron'
import path from 'path'
import {isDev} from "./utils.js";
import {getPreloadPath} from "./pathResolver.js";

app.on('ready', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: { preload: getPreloadPath() },
        frame: true,
    });

    if (isDev()){
        mainWindow.loadURL('http://localhost:5123')
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
    }
})