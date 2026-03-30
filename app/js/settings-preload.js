const { contextBridge, ipcRenderer } = require('electron');
const log = require('electron-log');
const dataStore = require('./Store');
const store = new dataStore(function () {});
require('./i18n');

contextBridge.exposeInMainWorld('settingsAPI', {
    i18n: (key) => i18n(key),
    ipcSend: (channel, ...args) => ipcRenderer.send(channel, ...args),
    onReadyForExportData: (callback) => {
        ipcRenderer.on('ready-for-export-data', () => callback());
    },
    closeWindow: () => ipcRenderer.send('close-settings-window'),
    store: {
        get: (key) => store.get(key),
        set: (key, value) => store.set(key, value),
        useDropbox: () => store.useDropbox(),
        storeCloudData: () => store.storeCloudData(),
        deleteHistory: () => store.deleteHistory()
    },
    log: {
        warn: (msg) => log.warn(msg),
        info: (msg) => log.info(msg)
    }
});
