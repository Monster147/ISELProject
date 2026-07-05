const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getStaticData: () => console.log("getStaticData"),
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
});
