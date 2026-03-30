$(document).ready(function () {
    document.title = window.settingsAPI.i18n("menu.edit.settings");
    $("#heading").html(window.settingsAPI.i18n("menu.edit.settings"));
    var settings = window.settingsAPI.store.get("settings") || {};
    var _langHeader = $("<p>", {"id": "langHeader", "html": window.settingsAPI.i18n("message.chooselang")});
    let content = $("#content");
    content.append(_langHeader);
    var _select = $("<select>", {"id": "lang"}).change(function (e) {
        var _selected = $(this).val();
        if (settings.lang !== _selected) {
            showMessage(window.settingsAPI.i18n("message.requiresrestart"))
        } else {
            $("#messageField").children().last().hide()
        }
    });
    var _de = $("<option>").html("Deutsch");
    var _en = $("<option>").html("English");
    _select.append(_de);
    _select.append(_en);
    content.append(_select);

    content.append($("<h2>", {html: window.settingsAPI.i18n("message.letterheading")}));
    var _historySizeHeader = $("<p>", {"id": "historySizeHeader", "html": window.settingsAPI.i18n("message.historysize")});
    var _historySize = $("<input>", {"id": "historySize", "val": 20, "type": "number", "min":1});
    content.append(_historySizeHeader).append(_historySize);
    content.append($("<br>")).append($("<br>"));
    let confirmationDialog = $("<div>", {
        "id": "confirmationDialog",
        "html": $("<p>", {"html":window.settingsAPI.i18n("message.deleteallconfirmation")}),
        "title": window.settingsAPI.i18n("title.confirmation"),
    });
    content.append(confirmationDialog);
    confirmationDialog.dialog({
        autoOpen: false,
        buttons: {
            "OK": function () {
                $( this ).dialog( "close" )
                window.settingsAPI.log.warn("Deleting all letters.");
                showMessage(window.settingsAPI.i18n("message.historydeleted"));
                window.settingsAPI.store.deleteHistory()
            },
            "Cancel": function () {
                $( this ).dialog( "close" )
            }
        }
    })
    content.append($("<button>", {
        "id": "deleteAll",
        "html": window.settingsAPI.i18n("button.deleteAll"),
        click: function () {
            window.settingsAPI.log.warn("Deleting whole history")
            $("#confirmationDialog").dialog("open")
        }
    }));

    content.append($("<br>")).append($("<br>"));
    content.append($("<button>", {
        "id": "exportAll",
        "html": window.settingsAPI.i18n("button.exportall"),
        click: function () {
            window.settingsAPI.ipcSend("export-all-dialog");
            console.log("Export all")
        }
    }));

    content.append($("<h2>", {html: window.settingsAPI.i18n("message.dropboxheading")}))
    const useDropbox = window.settingsAPI.store.useDropbox();
    content.append($("<input>", {
        "id": "useDropbox",
        "type":"checkbox",
        "checked": useDropbox
    }));
    content.append($("<div>", {
        html: window.settingsAPI.i18n("message.usedropbox"),
        "style": "display:inline; padding-left: 5px;"
    }));

    content.append($("<p>").html(window.settingsAPI.i18n("message.dropboxkey")))
    content.append($("<input>", {
        "id": "dropboxKey",
        "value": settings.dropboxKey
    }));
    content.append($("<br>"));
    content.append($("<button>", {
        "id": "deleteDropboxKey",
        "html": window.settingsAPI.i18n("message.deletedropboxkey"),
        click: function () {
            $("#dropboxKey").val("")
        }
    }));

    $("#ok").html(window.settingsAPI.i18n("button.ok")).click(function (e) {
        e.preventDefault();
        window.settingsAPI.ipcSend("message", window.settingsAPI.i18n("message.stored"));
        if (settings.lang !== getSettings().lang && !(typeof settings.lang !== "undefined")) {
            window.settingsAPI.ipcSend("reload");
        }
        window.settingsAPI.store.set("settings", getSettings());
        window.settingsAPI.store.storeCloudData();
        window.settingsAPI.closeWindow();
    });
    $("#abort").html(window.settingsAPI.i18n("button.abort")).click(function () {
        window.settingsAPI.closeWindow();
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
    $("#lang").val(settings.lang || $("#lang").val());
    $("#historySize").val(settings.numHistory || 20);
}

function showMessage(message) {
    $("#messageField").append($("<div>", {"html": message}).show().delay(5000).fadeOut());
}

window.settingsAPI.onReadyForExportData(() => {
    window.settingsAPI.log.info('Exporting history')
    window.settingsAPI.ipcSend("export-data", JSON.stringify(window.settingsAPI.store.get("history")))
});


//# sourceURL=Settings.js
