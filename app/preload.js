const { contextBridge, ipcRenderer } = require('electron');
const dataStore = require('data-store')('LetterCreator');
const log = require('electron-log');
const osLocale = require('os-locale');
let DropboxClass;
try { DropboxClass = require('dropbox').Dropbox; } catch (e) { DropboxClass = null; }

// Set up i18n in preload context
let locale;
try {
    const Store = require('electron-store');
    const store = new Store();
    const settings = store.get('settings');
    if (settings && settings.lang) {
        locale = settings.lang === 'English' ? 'en' : settings.lang === 'Deutsch' ? 'de' : settings.lang;
    } else {
        locale = osLocale.sync();
    }
} catch (e) {
    try {
        locale = osLocale.sync();
    } catch (e2) {
        locale = 'en';
    }
}
locale = locale.substring(0, 2);
let langFile;
try {
    langFile = require('./i18n/' + locale + '.json');
} catch (e) {
    langFile = require('./i18n/en.json');
}

// Expose i18n globally in the renderer world
contextBridge.exposeInMainWorld('i18n', function (key) {
    return langFile[key];
});

// Expose the app version
const version = require('./package.json').version;
contextBridge.exposeInMainWorld('appVersion', version);

// Helper: compare two history entries (ignoring time/date/printDate/foldingMarks)
function compareTwoHistories(history1, history2) {
    if (!history2) return false;
    for (const key in history1) {
        if (key !== 'printDate' && key !== 'time' && key !== 'date' && key !== 'foldingMarks' && history1[key] !== history2[key]) {
            return false;
        }
    }
    return true;
}

// Expose store API
contextBridge.exposeInMainWorld('storeAPI', {
    initialize: function (callback) {
        var settings = dataStore.get('settings') || {};
        var dropboxKey = settings.dropboxKey;
        var useDropbox = (typeof settings.useDropbox === 'undefined') ? false : (settings.useDropbox === true);

        if (useDropbox && dropboxKey && DropboxClass) {
            try {
                var box = new DropboxClass();
                box.setClientId('av5lekkcrbbfbgn');
                box.setAccessToken(dropboxKey);
                box.filesDownload({ path: '/config.json' }).then(function (response) {
                    var reader = new FileReader();
                    reader.addEventListener('loadend', function (e) {
                        try {
                            var storedData = JSON.parse(e.srcElement.result);
                            for (const key in storedData) {
                                dataStore.set(key, storedData[key]);
                            }
                        } catch (parseErr) {
                            log.error(parseErr);
                        }
                        callback();
                    });
                    reader.readAsText(response.fileBlob);
                }).catch(function (error) {
                    log.error(error);
                    try {
                        if (JSON.parse(error.error).error_summary !== 'path/not_found/..') {
                            ipcRenderer.send('message', langFile['message.dropboxfailed']);
                        }
                    } catch (e) {}
                    callback();
                });
            } catch (e) {
                log.error(e);
                callback();
            }
        } else {
            callback();
        }
    },
    get: function (key) {
        return dataStore.get(key);
    },
    set: function (key, value) {
        dataStore.set(key, value);
    },
    storeHistory: function (currentContent) {
        var history = dataStore.get('history');
        if (typeof history === 'undefined') {
            dataStore.set('history', [currentContent]);
        } else {
            if (!compareTwoHistories(currentContent, history[0])) {
                history.unshift(currentContent);
                dataStore.set('history', history);
            }
        }
    },
    deleteHistory: function () {
        dataStore.set('history', []);
        dataStore.save();
    },
    useDropbox: function () {
        var settings = dataStore.get('settings') || {};
        return (typeof settings.useDropbox === 'undefined') ? false : (settings.useDropbox === true);
    },
    isDropboxKeyNeeded: function () {
        var settings = dataStore.get('settings') || {};
        var dropboxKey = settings.dropboxKey;
        var useDropbox = (typeof settings.useDropbox === 'undefined') ? false : (settings.useDropbox === true);
        return ((typeof dropboxKey === 'undefined') || dropboxKey === '') && useDropbox;
    },
    setDropboxKey: function (key) {
        var settings = dataStore.get('settings') || {};
        settings.dropboxKey = key;
        dataStore.set('settings', settings);
    },
    storeCloudData: function () {
        var settings = dataStore.get('settings') || {};
        var dropboxKey = settings.dropboxKey;
        if (typeof dropboxKey !== 'undefined' && dropboxKey && DropboxClass) {
            try {
                var box = new DropboxClass();
                box.setClientId('av5lekkcrbbfbgn');
                box.setAccessToken(dropboxKey);
                box.filesUpload({ path: '/config.json', contents: JSON.stringify(dataStore.data), mode: 'overwrite' })
                    .then(function (response) { log.info(response); })
                    .catch(function (err) { log.error(err); });
            } catch (e) {
                log.error(e);
            }
        }
    },
    getDropboxAuthUrl: function () {
        if (!DropboxClass) return null;
        try {
            var box = new DropboxClass();
            box.setClientId('av5lekkcrbbfbgn');
            return box.getAuthenticationUrl('http://localhost:17234/');
        } catch (e) {
            log.error(e);
            return null;
        }
    }
});

// Expose IPC API
contextBridge.exposeInMainWorld('electronAPI', {
    // Sending to main process
    printToPdf: function () { ipcRenderer.send('print-to-pdf'); },
    print: function () { ipcRenderer.send('print'); },
    saveDialog: function (content) { ipcRenderer.send('save-dialog', content); },
    openFileDialog: function () { ipcRenderer.send('open-file-dialog'); },
    exportDialog: function (content) { ipcRenderer.send('export-dialog', content); },
    dropboxLogin: function (url) { ipcRenderer.send('dropbox-login', url); },
    receivedDropboxkey: function () { ipcRenderer.send('receivedDropboxkey'); },
    updateDirectly: function () { ipcRenderer.send('updateDirectly'); },
    updateAfterClose: function () { ipcRenderer.send('updateAfterClose'); },
    saveRequested: function (callback) { ipcRenderer.on('save-requested', function () { callback(); }); },

    // Receiving from main process
    onFileContent: function (callback) {
        ipcRenderer.on('file-content', function (_event, content) { callback(content); });
    },
    onClosed: function (callback) {
        ipcRenderer.on('closed', function () { callback(); });
    },
    onWrotePdf: function (callback) {
        ipcRenderer.on('wrote-pdf', function (_event, path) { callback(path); });
    },
    onMessage: function (callback) {
        ipcRenderer.on('message', function (_event, content) { callback(content); });
    },
    onUpdateDownloaded: function (callback) {
        ipcRenderer.on('updateDownloaded', function (_event, info) { callback(info); });
    },
    onReceivedDropboxkey: function (callback) {
        ipcRenderer.on('receivedDropboxkey', function () { callback(); });
    },
    onDropboxAuthToken: function (callback) {
        ipcRenderer.on('dropbox-auth-token', function (_event, token) { callback(token); });
    }
});
