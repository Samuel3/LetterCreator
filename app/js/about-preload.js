const { contextBridge, ipcRenderer } = require('electron');
require('./i18n');

contextBridge.exposeInMainWorld('aboutAPI', {
    i18n: (key) => i18n(key),
    version: require('../package.json').version,
    onProgress: (callback) => {
        ipcRenderer.on('progress', (_event, progress) => callback(progress));
    }
});
