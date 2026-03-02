$(document).ready(function () {
    document.title = i18n("menu.edit.settings");
    $("#heading").html(i18n("menu.edit.settings"));
    var settings = window.storeAPI.get("settings") || {};
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
    let confirmationDialog = $("<div>", {
        "id": "confirmationDialog",
        "html": $("<p>", {"html":i18n("message.deleteallconfirmation")}),
        "title": i18n("title.confirmation"),
    });
    content.append(confirmationDialog);
    confirmationDialog.dialog({
        autoOpen: false,
        buttons: {
            "OK": function () {
                $( this ).dialog( "close" )
                console.warn("Deleting all letters.");
                showMessage(i18n("message.historydeleted"));
                window.storeAPI.deleteHistory()
            },
            "Cancel": function () {
                $( this ).dialog( "close" )
            }
        }
    })
    content.append($("<button>", {
        "id": "deleteAll",
        "html": i18n("button.deleteAll"),
        click: function () {
            console.warn("Deleting whole history")
            $("#confirmationDialog").dialog("open")
        }
    }));

    content.append($("<br>")).append($("<br>"));
    content.append($("<button>", {
        "id": "exportAll",
        "html": i18n("button.exportall"),
        click: function () {
            window.settingsAPI.exportAllDialog(JSON.stringify(window.storeAPI.get("history")));
            console.log("Export all")
        }
    }));

    content.append($("<h2>", {html: i18n("message.dropboxheading")}))
    const useDropbox = window.storeAPI.useDropbox();
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
        "value": settings.dropboxKey
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
        window.settingsAPI.message(i18n("message.stored"));
        if (settings.lang !== getSettings().lang && !(typeof settings.lang !== "undefined")) {
            window.settingsAPI.reload();
        }
        window.storeAPI.set("settings", getSettings());
        window.storeAPI.storeCloudData();
        window.settingsAPI.closeWindow();
    });
    $("#abort").html(i18n("button.abort")).click(function () {
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


//# sourceURL=Settings.js
