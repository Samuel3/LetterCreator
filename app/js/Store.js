const Dropbox = require('dropbox').Dropbox;
const {ipcRenderer} = require('electron');
const log = require('electron-log');
require("./i18n");

var Store = function (callback) {
    this.store = require('data-store')('LetterCreator');
    var dropboxUsed = this.useDropbox()
    if (dropboxUsed) {
        this.dropboxKey = this.store.get("settings").dropboxKey;
        this.box = new Dropbox();
        this.box.setClientId("av5lekkcrbbfbgn")
        this.box.setAccessToken(this.dropboxKey)
        var reader = new FileReader()
        reader.addEventListener('loadend', (e) => {
            const text = e.srcElement.result;
            var storedData = JSON.parse(text)
            log.silly(`Stored data in cloud: ${storedData}`)
            for (var key in storedData) {
                this.store.set(key, storedData[key]);
            }
            setTimeout(callback, 1)
        });
        this.box.filesDownload({path: "/config.json"}).then(function (response) {
            reader.readAsText(response.fileBlob)
        }).catch(function (error) {
            log.error(error)
            if (JSON.parse(error.error).error_summary !== "path/not_found/..") {
                ipcRenderer.send('message', i18n("message.dropboxfailed"));
            }
        })
    }
};

module.exports = function ( options ) {
    return new Store ( options );
};

Store.prototype.get = function (key) {
    return this.store.get(key);
};

Store.prototype.set = function (key, value) {
    this.store.set(key, value);
    this.storeCloudData();
};

Store.prototype.storeHistory = function (currentContent) {
    var history = this.store.get("history");
    if (typeof history === "undefined") {
        this.store.set("history", [getCurrentContent()]);
    } else {
        if (!this.compareTwoHistories(currentContent, history[0])) {
            history.unshift(currentContent);
            this.store.set("history", history);
        }
    }
    this.storeCloudData();
};

Store.prototype.compareTwoHistories = function (history1, history2) {
    for (var key in history1) {
        if (key !== "printDate" && key !== "time" && key !== "date" && key !== "foldingMarks" && history1[key] !== history2[key]) {
            return false
        }
    }
    return true
};

Store.prototype.setDropboxKey = function (key) {
    this.store = require('data-store')('LetterCreator');
    log.info("Dropbox Key: " + key);
    this.dropboxKey = key;
    const settings = this.store.get("settings");
    settings.dropboxKey = key
    this.store.set("settings", settings)
};

Store.prototype.storeCloudData = function () {
    if (typeof this.dropboxKey !== "undefined") {
        this.box.setAccessToken(this.dropboxKey);
        this.box.filesUpload({ path: '/config.json', contents: JSON.stringify(this.store.data), mode: "overwrite"})
        .then(function (response) {
            log.info(response);
        })
        .catch(function (err) {
            log.error(err);
        });
    }
};

Store.prototype.isDropboxKeyNeeded = function () {
    return (typeof this.dropboxKey === "undefined") && this.useDropbox()
};

Store.prototype.deleteHistory = function () {
    this.store.set("history", []);
    this.store.save();
};

Store.prototype.useDropbox = function () {
    this.store = require('data-store')('LetterCreator');
    var dropboxUsed = this.store.get("settings") || {};
    return typeof dropboxUsed.useDropbox === "undefined" ? true: (dropboxUsed.useDropbox === true);
}

//# sourceURL=Store.js
