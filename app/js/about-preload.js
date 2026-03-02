const { contextBridge, ipcRenderer } = require('electron');
const osLocale = require('os-locale');
const Store = require('electron-store');

let locale;
try {
    const store = new Store();
    if (typeof store.get('settings') !== 'undefined' && typeof store.get('settings').lang !== 'undefined') {
        locale = store.get('settings').lang;
        if (locale === 'English') {
            locale = 'en';
        } else if (locale === 'Deutsch') {
            locale = 'de';
        }
    } else {
        locale = osLocale.sync();
    }
} catch (e) {
    locale = osLocale.sync();
}
locale = locale.substring(0, 2);
const allowedLocales = ['en', 'de'];
if (!allowedLocales.includes(locale)) {
    locale = 'en';
}
const langFile = require('../i18n/' + locale + '.json');

contextBridge.exposeInMainWorld('aboutAPI', {
    version: require('../package.json').version,
    i18n: (key) => langFile[key],
    onProgress: (callback) => {
        ipcRenderer.on('progress', (_event, progress) => callback(progress));
    }
});
