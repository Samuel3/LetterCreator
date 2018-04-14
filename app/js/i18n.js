/**
 * Created by Samuel on 30.03.2018.
 */
const osLocale = require("os-locale");
const Store = require("electron-store");

var store = new Store();
var locale;

if (typeof store.get("settings") !== "undefined") {
    locale = store.get("settings").lang;
    if (locale === "English") {
        locale = "en";
    } else if (locale === "Deutsch") {
        locale = "de";
    }
} else {
    locale = osLocale.sync();
}
locale = locale.substring(0, 2);
const langFile = require("../i18n/" + locale + ".json");

i18n = function(key) {
    return langFile[key];
};


//# sourceURL=i18n.js