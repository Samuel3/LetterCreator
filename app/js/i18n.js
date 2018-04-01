/**
 * Created by Samuel on 30.03.2018.
 */
const osLocale = require("os-locale");
var locale = osLocale.sync();
locale = locale.substring(0, 2);
const langFile = require("../i18n/" + locale + ".json");

i18n = function(key) {
    return langFile[key];
};
