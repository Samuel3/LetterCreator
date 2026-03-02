const { contextBridge, ipcRenderer } = require('electron');
const dataStore = require('data-store')('LetterCreator');
const log = require('electron-log');
const osLocale = require('os-locale');
let DropboxClass;
try { DropboxClass = require('dropbox').Dropbox; } catch (e) { DropboxClass = null; }

// Set up i18n for the settings window
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
    langFile = require('../i18n/' + locale + '.json');
} catch (e) {
    langFile = require('../i18n/en.json');
}

contextBridge.exposeInMainWorld('i18n', function (key) {
    return langFile[key];
});

contextBridge.exposeInMainWorld('storeAPI', {
    get: function (key) {
        return dataStore.get(key);
    },
    set: function (key, value) {
        dataStore.set(key, value);
    },
    useDropbox: function () {
        var settings = dataStore.get('settings') || {};
        return (typeof settings.useDropbox === 'undefined') ? false : (settings.useDropbox === true);
    },
    deleteHistory: function () {
        dataStore.set('history', []);
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
    }
});

contextBridge.exposeInMainWorld('settingsAPI', {
    message: function (content) { ipcRenderer.send('message', content); },
    reload: function () { ipcRenderer.send('reload'); },
    exportAllDialog: function (history) { ipcRenderer.send('export-all-dialog', history); },
    closeWindow: function () { ipcRenderer.send('close-settings-window'); },
    onExportedFilecollection: function (callback) {
        ipcRenderer.on('exported-filecollection', function (_event, path) { callback(path); });
    }
});
