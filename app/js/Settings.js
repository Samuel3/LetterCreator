require("./i18n");
const log = require('electron-log');
const {remote, ipcRenderer} = require('electron');
const dataStore = require("./Store");
const store = new dataStore(function () {
});
const fs = require('fs');

$(document).ready(function () {
    document.title = i18n("menu.edit.settings");
    $("#heading").html(i18n("menu.edit.settings"));
    var settings = store.get("settings") || {};
    var _langHeader = $("<p>", {"id": "langHeader", "html": i18n("message.chooselang")});
    let content = $("#content");
    content.append(_langHeader);
    var _select = $("<select>", {"id": "lang"}).change(function (e) {
        var _selected = $(this).val();
        if (settings.lang !== _selected) {
            showMessage(i18n("message.requiresrestart"))
        } else {
            $("#messageField").children().last().hide()
        }
    });
    var _de = $("<option>").html("Deutsch");
    var _en = $("<option>").html("English");
    _select.append(_de);
    _select.append(_en);
    content.append(_select);

    content.append($("<h2>", {html: i18n("message.letterheading")}));
    var _historySizeHeader = $("<p>", {"id": "historySizeHeader", "html": i18n("message.historysize")});
    var _historySize = $("<input>", {"id": "historySize", "val": 20, "type": "number", "min":1});
    content.append(_historySizeHeader).append(_historySize);
    content.append($("<br>")).append($("<br>"));
    content.append($("<button>", {
        "id": "deleteAll",
        "html": i18n("button.deleteAll"),
        click: function () {
            log.warn("Deleting whole history")
            store.deleteHistory();
            showMessage(i18n("message.historydeleted"));
        }
    }));

    content.append($("<br>")).append($("<br>"));
    content.append($("<button>", {
        "id": "exportAll",
        "html": i18n("button.exportall"),
        click: function () {
            ipcRenderer.send("export-all-dialog");
            console.log("Export all")
        }
    }));

    content.append($("<h2>", {html: i18n("message.dropboxheading")}))
    const useDropbox = store.useDropbox()
    content.append($("<input>", {
        "id": "useDropbox",
        "type":"checkbox",
        "checked": useDropbox
    }));
    content.append($("<div>", {
        html: i18n("message.usedropbox"),
        "style": "display:inline; padding-left: 5px;"
    }));

    content.append($("<p>").html(i18n("message.dropboxkey")))
    content.append($("<input>", {
        "id": "dropboxKey",
        "value": store.get("dropboxKey")
    }));
    content.append($("<br>"));
    content.append($("<button>", {
        "id": "deleteDropboxKey",
        "html": i18n("message.deletedropboxkey"),
        click: function () {
            $("#dropboxKey").val("")
        }
    }));

    $("#ok").html(i18n("button.ok")).click(function (e) {
        e.preventDefault();
        ipcRenderer.send("message", i18n("message.stored"));
        if (settings.lang !== getSettings().lang && !(typeof settings.lang !== "undefined")) {
            ipcRenderer.send("reload");
        }
        store.set("settings", getSettings());
        store.storeCloudData();
        remote.getCurrentWindow().close();
    });
    $("#abort").html(i18n("button.abort")).click(function () {
        remote.getCurrentWindow().close();
    });

    if (typeof settings !== "undefined") {
        setSettings(settings);
    }
    content.append($("<p>").html("&nbsp;"))
});

function getSettings() {
    return {
        "lang": $("#lang").val(),
        "numHistory": $("#historySize").val(),
        "useDropbox": $("#useDropbox").is(":checked"),
        "dropboxKey": $("#dropboxKey").val()
    }
}

function setSettings(settings) {
    $("#lang").val(settings.lang);
    $("#historySize").val(settings.numHistory);
}

function showMessage(message) {
    $("#messageField").append($("<div>", {"html": message}).show().delay(5000).fadeOut());
}

ipcRenderer.on("exported-filecollection", (event, path) => {
    log.info(`Exporting history to: ${path}`)
    fs.writeFileSync(path, JSON.stringify(store.get("history")))
});


//# sourceURL=Settings.js
