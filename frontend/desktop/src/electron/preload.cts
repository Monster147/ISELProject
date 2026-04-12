const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    getStaticData: () => console.log('getStaticData'),
})