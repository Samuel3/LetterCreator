require("./i18n");
var Store = require("electron-store");
const {remote, ipcRenderer} = require('electron');

$(document).ready(function () {
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
    $("#content").append(_historySizeHeader).append(_historySize).append($("<p>").html("&nbsp;"));
    $("#ok").html(i18n("button.ok")).click(function () {
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