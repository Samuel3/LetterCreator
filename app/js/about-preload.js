const { contextBridge, ipcRenderer } = require('electron');
const osLocale = require('os-locale');

// Set up i18n for the about window
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

const version = require('../package.json').version;
contextBridge.exposeInMainWorld('appVersion', version);

contextBridge.exposeInMainWorld('aboutAPI', {
    onProgress: function (callback) {
        ipcRenderer.on('progress', function (_event, progress) { callback(progress); });
    }
});
