const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('releaseNotesAPI', {
    onReleaseNotes: (callback) => {
        ipcRenderer.once('releaseNotes-available', (_event, releaseNotes) => callback(releaseNotes));
    },
    closeWindow: () => ipcRenderer.send('close-release-notes')
});
