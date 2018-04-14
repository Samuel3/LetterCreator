require("./i18n");
var Store = require("electron-store");
const {remote, ipcRenderer} = require('electron');
var datastore = require('data-store')('my-app')

$(document).ready(function () {
    // Todo show message to restart if message changed and saved
    var store = new Store();
    var _langHeader = $("<p>", {"id": "langHeader", "html": i18n("message.chooselang")});
    $("#content").append(_langHeader);
    var _select = $("<select>", {"id": "lang"});
    var _de = $("<option>").html("Deutsch");
    var _en = $("<option>").html("English");
    _select.append(_de);
    _select.append(_en);
    var settings = store.get("settings");

    $("#content").append(_select);

    var _historySizeHeader = $("<p>", {"id": "historySizeHeader", "html":i18n("message.historysize")});
    var _historySize = $("<input>", {"id": "historySize", "val": 20});
    $("#content").append(_historySizeHeader).append(_historySize);
    $("#content").append($("<p>").html("&nbsp;"))
    $("#content").append($("<button>", {
        "id": "deleteAll", "html": i18n("button.deleteAll"), click: function () {
            datastore.set("history", []);
            datastore.save();
            showMessage(i18n("message.historydeleted"));
        }
    }));
    $("#ok").html(i18n("button.ok")).click(function (e) {
        e.preventDefault();
        ipcRenderer.send("message", i18n("message.stored"));
        if (settings.lang !== getSettings.lang) {
            ipcRenderer.send("reload");
        }
        store.set("settings", getSettings());
        remote.getCurrentWindow().close();
    });
    $("#abort").html(i18n("button.abort")).click(function () {
        remote.getCurrentWindow().close();
    });
    var settings = store.get("settings");
    if (typeof settings !== "undefined") {
        setSettings(settings);
    }
$("#content").append($("<p>").html("&nbsp;"))
});

function getSettings() {
    return {
        "lang": $("#lang").val(),
        "numHistory": $("#historySize").val()
    }
}

function setSettings(settings) {
    $("#lang").val(settings.lang);
    $("#historySize").val(settings.numHistory);
}

function showMessage(message) {
    $("#messageField").append($("<div>", {"html": message}).show().delay(5000).fadeOut());
}

//# sourceURL=Settings.js