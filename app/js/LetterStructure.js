var store;
const {ipcRenderer} = require('electron');
const fs = require('fs');
const version = require("../package.json").version;
require("./i18n");
const Svg = require("svg.js");
var officegen = require('officegen');
var async = require ( 'async' );

$(document).ready(function () {
    store = require('data-store')('my-app');
    var history = getStoredData("history");
    if ($.isArray(history)) {
        history = history [0];
    }
    if (typeof history === "undefined") {
        history = {}
    }
    console.log(history)
    $("#print-pdf").click(function () {
        ipcRenderer.send('print-to-pdf');
        showMessage(i18n("message.letterstored"), 10000);
        storeHistory();
    });
    $("#print").click(function () {
        ipcRenderer.send('print');
        showMessage(i18n("message.letterstored"), 10000);
        storeHistory();
    });
    var table = createAddressTable(getStoredData("address"));
    var date = new Date();
    var _fieldset = $("<fieldset>");
    _fieldset.click(function (e) {
        e.stopPropagation();
    });
    var _select = $("<select>", {"name": "sender", "id": "sender"}).change(function (e) {
        if ($("#sender option:selected").text() === i18n("message.addsender")) {
            $("#formSender").dialog("open");
        }
    }).click(function (e) {
        if ($("#sender > option").length === 1) {
            $("#formSender").dialog("open");
        }
    }).contextmenu(function (e) {
        $("#inputSender").val($("#sender").val());
        $("#formSender").dialog("open");
    })
	if (typeof getStoredData("sender") === "undefined") {
		setStoredData("sender", []);
	}
    for (data of getStoredData("sender")){
        var _option = $("<option>").html(data);
        _select.append(_option);
    };
    _select.append($("<option>", {"html": i18n("message.addsender")}));
    _fieldset.append(_select);
    var firstReceiver = $($(table.children()[1]).children()[0]);
    var _address = $("<div>", {
        "id": "address",
        "html": "<div id='receiver'>" + getAddress(firstReceiver).join("<br>") + "</div>"
    });
    var place = history.place ? history.place : i18n("letter.place");
    var _dateField = $("<div>", {"id":"date", "contenteditable":true,"html":"<div id='place'>" + place +"</div><input type='text' id='datepicker'>"})
    var _subject = $("<input>", {
        "id": "subject",
        "type": "text"
    }).val(history.subject ? history.subject : i18n("letter.subject"));
    var _text = $("<div>", {"id": "text", "contenteditable": true});
    var content = history.content ? history.content : i18n("letter.content");
    _text.html(content);
    var _greeting = $("<div>", {"id": "greeting", "contenteditable": true}).html(history.greeting ? history.greeting : i18n("letter.greeting"));
    var hr1 = $("<div>", {"id": "hr1", "class": "falzmarken"});
    var hr2 = $("<div>", {"id": "hr2", "class": "falzmarken"});
    var hr3 = $("<div>", {"id": "hr3", "class": "falzmarken"});

    _address.prepend(_fieldset);
    $("#sender").selectmenu();
    $("#content").append(_address);
    $("#content").append(_dateField);
    $("#content").append(_subject);
    $("#content").append(_text);
    $("#content").append(_greeting);
    $("#datepicker").val(("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear())
    $("#datepicker").datepicker({dateFormat: "dd.mm.yy"});
    $("#content").append(hr1);
    $("#content").append(hr2);
    $("#content").append(hr3);
    $("#checkbox-1").click(function () {
        $("#hr1").toggle();
        $("#hr2").toggle();
        $("#hr3").toggle();
    })
    var createAddress = $("<div>", {"id": "createAddress", "title": "Adresse erstellen"});
    var dialogContent = $("<p>", {"html": table, "style": "display:none"});
    createAddress.append(dialogContent);
    $("#content").append(createAddress);
    _address.click(function () {
        createAddress.dialog({
            width: "80%",
            buttons: {
                "Add Row": function () {

                },
                Cancel: function () {
                    $(this).dialog("close");
                },
                "OK": function () {
                    $(this).dialog("close");
                    $("#addressTable").find(".ui-selected > td:eq(0) > input").trigger("dblclick");
                    setStoredData("address", getAddressDataFromTable())
                }
            }
        });
        dialogContent.show();
    });
    var form = $("<form>", {"id": "formSender", "title":"Create Sender", "html": "Enter Sender name"});
    var input = $("<input>", {"id": "inputSender"});
    form.append(input);
    $("#content").append(form);
    form.dialog({
        autoOpen: false,
        buttons: {
            "Delete": function () {
                var _delVal = $("#inputSender").val();
                $("#sender > option").filter(function(i, el){return $(el).val() === _delVal}).remove();
                setStoredData("sender", getSenderDataFromDropdown());
                $(this).dialog("close");
                $("#inputSender").val("");
            },
            "Cancel": function () {
                $(this).dialog("close");
            },
            "OK": function () {
                var option = $("<option>").html($("#inputSender").val());
                $("select option:last").before(option);
                setStoredData("sender", getSenderDataFromDropdown());
                $("#sender").val($("#inputSender").val());
                $("#inputSender").val("");
                $(this).dialog("close");
            }
        }
    }).keypress(function (e) {
        if (e.keyCode === $.ui.keyCode.ENTER) {
            $(this).parent().find("button:eq(3)").trigger("click");
            e.preventDefault();
        }
    });
    if (history.sender) {
        $("#sender").val(history.sender)
    }
    if (history.receiver) {
        $("#receiver").html(history.receiver);
    }

    $("#print-pdf").click(function () {
        beforePrint();
    });
    $("#print").click(function () {
        beforePrint();
    })
    $("#save").click(function () {
        ipcRenderer.send('save-dialog');
    })
    $("#load").click(function () {
        ipcRenderer.send('open-file-dialog');
    })
    $(document).on({
        'dragover dragenter': function(e) {
            e.preventDefault();
        }
    });
    document.body.ondrop = (ev) => {
        setContent(JSON.parse(fs.readFileSync(ev.dataTransfer.files[0].path + "")))
        ev.preventDefault()
    };
    activateHistoryButton();
    activateExportButton();
});

function createAddressTable(addressData) {
    var _table = $("<table>", {"id": "addressTable", "class":"ui-widget ui-widget-content"});
    var _header = $("<thead>");
    var _tr = $("<tr>", {"class": "ui-widget-header"});
    _header.append(_tr);
    _tr.append($("<th>").html("Anrede"))
        .append($("<th>").html("Titel"))
        .append($("<th>").html("Vorname"))
        .append($("<th>").html("Nachname"))
        .append($("<th>").html("Firma"))
        .append($("<th>").html("Abteilung"))
        .append($("<th>").html("Straße"))
        .append($("<th>").html("PLZ"))
        .append($("<th>").html("Ort"))
        .append($("<th>").html("Land"));
    var _body = $("<tbody>");

    if (typeof addressData !== "undefined") {
        for (addressEntry of addressData) {
            var tr = $("<tr>");
            for (addressEntryField of addressEntry) {
                createTableData(tr, addressEntryField);
            }
            createDeleteButton(tr);
            _body.append(tr);
        }
    } else{

    }

    _table.append(_header);
    _table.append(_body);
    _table.selectable({filter:"tr"}).draggable({
        helper: "clone",
        start: function(event, ui) {
            c.tr = this;
            c.helper = ui.helper;
        }
    });
    _table.append($("<button>", {"id": "addRow"}).html("Add Row").click(function (e) {
        let tr = $("<tr>");
        for (i = 0; i <10; i++) {
            createTableData(tr, "");
        }
        createDeleteButton(tr);
        _table.append(tr);
    }));
    return _table;
}

function getStoredData (key) {
    return store.get(key);
}

function setStoredData (key, value) {
    store.set(key, value);
    store.save();
}

function getAddress(tableRow) {
    var fullAddress = [];
    var attributes = tableRow.children();
    if (!isCellEmpty(attributes[0]) || !isCellEmpty(attributes[1]) || !isCellEmpty(attributes[2]) || !isCellEmpty(attributes[3])) {
        var _name = getValueOfTableCell(attributes[0]) + " " + getValueOfTableCell(attributes[1]) + " " + getValueOfTableCell(attributes[2]) + " " + getValueOfTableCell(attributes[3]);
        _name = _name.replace(/  /g, " ");
        fullAddress.push(_name);
    }
    if (!isCellEmpty(attributes[4])) {
        fullAddress.push(getValueOfTableCell(attributes[4]))
    }
    if (!isCellEmpty(attributes[5])) {
        fullAddress.push(getValueOfTableCell(attributes[5]));
    }
    if (!isCellEmpty(attributes[6])) {
        fullAddress.push(getValueOfTableCell(attributes[6]));
    }
    if (!isCellEmpty(attributes[7]) ||!isCellEmpty(attributes[8])) {
        var _city = getValueOfTableCell(attributes[7]) + " " + getValueOfTableCell(attributes[8]);
        fullAddress.push(_city);
    }
    if (!isCellEmpty(attributes[9])) {
        fullAddress.push(getValueOfTableCell(attributes[9]));
    }
    if (fullAddress.length === 0) {
        return ["", "", "", ""];
    }
    return fullAddress;
}
function isCellEmpty(cell) {
    return getValueOfTableCell(cell) === "";
}

function getValueOfTableCell(cell) {
    return $($(cell).children()[0]).val()
}

function createTableData(parent, content) {
    parent.append($("<td>").html($("<input>").css("width", "90%").val(content).click(function (e) {
        $("#addressTable").find(".ui-selected").removeClass("ui-selected");
        $(e.target).parent().parent().addClass("ui-selected")
    }).dblclick(function (e) {
        var addressField = getAddress($(e.target).parent().parent());
        $("#receiver").html(addressField.join("<br>"));
        $("#createAddress").dialog("close");
        setStoredData("address", getAddressDataFromTable());
    }).keypress(function (e) {
        if (e.keyCode === $.ui.keyCode.ENTER) {
            $(this).trigger("dblclick");
            e.preventDefault();
        }
    })));
}

function createDeleteButton(parent) {
    var _btn = $("<button>", {"html": "Delete row", "class": "ui-icon ui-icon-trash"}).click(function (e) {
        $($(e.target).parent()).parent().remove()
    });
    var _td = $("<td>");
    _td.append(_btn);
    parent.append(_td);
}

function getAddressDataFromTable() {
    var addressData = [];
    $("#addressTable").find("tr").not(".ui-widget-header").each(function (i, el) {
        var addressEntry = [];
        $(el).find("td").not(":last").each(function (j, td) {
            var addressField = $(td).find("input").val() ? $(td).find("input").val() : "";
            addressEntry.push(addressField);
        });
        addressData.push(addressEntry);
    });
    return addressData;
}

function getSenderDataFromDropdown() {
    var senderData = [];
    $("#sender option").each(function (i, el) {
        if ($(el).val() !== i18n("message.addsender")) {
            senderData.push($(el).val());
        }
    });
    return senderData;
}

function getCurrentContent() {
    return {
        place: $("#place").html(),
        sender: $("#sender").val(),
        receiver: $("#receiver").html(),
        subject: $("#subject").val(),
        content: $("#text").html(),
        greeting: $("#greeting").html(),
        foldingMarks: $("#checkbox-1")[0].checked,
        date: $("#datepicker").val(),
        "version": version
    }
}

function setContent(content) {
    $("#place").html(content.place);
    $("#datepicker").val(content.date);
    $("#sender").val(content.sender);
    if ($("#sender").val() !== content.sender) {
        $("#sender").append($("<option>").html(content.sender));
        $("#sender").val(content.sender);
    }
    $("#receiver").html(content.receiver);
    $("#subject").val(content.subject);
    $("#text").html(content.content);
    $("#greeting").html(content.greeting);
    $("#checkbox-1")[0].checked = content.foldingMarks;
}

function beforePrint() {
    var history = getStoredData("history");
    if (typeof history === "undefined") {
        history = [getCurrentContent()];
    } else{
        history.unshift(getCurrentContent())
    }
    setStoredData("history", history);
    try {
        createAddress.dialog("close");
    } catch (e) {
    }
}

ipcRenderer.on('saved-file', (event, path) => {
    if (path) {
        fs.writeFileSync(path, JSON.stringify(getCurrentContent()));
    }
});

ipcRenderer.on('exported-file', (event, path) => {
    if (path) {
        var docx = officegen ( 'docx' );
        var _content = getCurrentContent();
        var _receivers = _content.receiver.split("<br>");
        for (var i = 0; i < 3; i++) {
            docx.createP();
        }
        var _receiverP = docx.createP();
        _receiverP.addText(_content.sender, {underline: true, font_size: 10});
        _receiverP.addLineBreak();
        _receiverP.addText(_receivers[0]);
        for (var i = 1; i < _receivers.length; i++) {
            _receiverP.addLineBreak();
            _receiverP.addText(_receivers[i]);
        }
        for (var i = 0; i < 3; i++) {
            docx.createP()
        }
        _receiverP = docx.createP()
        _receiverP.addText(_content.subject, {"bold": true});
        docx.createP()
        docx.createP()
        _receiverP = docx.createP()
        _receiverP.addText(_content.content);
        docx.createP();
        docx.createP();
        _receiverP = docx.createP()
        _receiverP.addText(_content.greeting);


        var out = fs.createWriteStream (path);

        out.on ( 'error', function ( err ) {
            console.log ( err );
        });

        async.parallel ([
            function ( done ) {
                out.on ( 'close', function () {
                    console.log ( 'Finish to create a DOCX file.' );
                    done ( null );
                });
                docx.generate ( out );
            }

        ], function ( err ) {
            if ( err ) {
                console.log ( 'error: ' + err );
            }
        });
    }
});

ipcRenderer.on('selected-directory', (event, path) => {
    if (path) {
        var letter = JSON.parse(fs.readFileSync(path + ""));
        setContent(letter);
    }
});

ipcRenderer.on('file-open', (event, path) => {
    var letter = JSON.parse(fs.readFileSync(path + ""));
    setContent(letter);
});

ipcRenderer.on("closed", () => {
    storeHistory();
});

ipcRenderer.on('wrote-pdf', function (event, path) {
    const message = `Wrote PDF to: ${path}`;
    document.getElementById('pdf-path').innerHTML = message
});

ipcRenderer.on("message", function (event, content) {
    showMessage(content, 5000);
});

function showMessage(message, delay) {
    $("#messageBox").append($("<div>", {"class":"message", html: message}).delay(delay).hide({"duration": "2000", easing: 'easeOutBounce'}).effect("shake"))
}

function storeHistory() {
    var currentContent = getCurrentContent();
    var history = getStoredData("history");
    if (typeof history === "undefined") {
        setStoredData("history", [getCurrentContent()]);
    } else {
        if (JSON.stringify(currentContent) !== JSON.stringify(history[0])) {
            history.unshift(currentContent);
            setStoredData("history", history);
        }
    }
}

function activateHistoryButton() {
    var _historyPreview = $("<div>", {
        "id": "historyPreview",
        title: i18n("title.historypreview")
    }).css({
        height:"350px",
        overflow:"auto"
    }).dialog({
        autoOpen: false,
        width: "80%",
        appendTo: "#content"
    });

    var _content = $("<div>", {"id": "historyContent"}).css({
        height: "350px",
        overflow: "auto"
    }).appendTo("#historyPreview");
    const svg = SVG("historyContent").size("800", 800);
    var entries = getStoredData("history");
    if ($.isArray(entries)) {
        $(entries).each(function (i, el) {
            svg.text(replaceCRLFForForFirstTwoLines(el.receiver)).attr({"y": 70 * i, "font-size": "10px", "data": el.receiver + "", "data-full": JSON.stringify(el)});
            svg.text(replaceCRLFForForFirstTwoLines(el.content.replace("<br>",""))).attr({"y": 70 * i + 30, "font-size": "10px", "data": el.content, "data-full": JSON.stringify(el)})
        });
        $(document).tooltip({
            items: "text",
            content: function () {
                var element = $(this);
                return element.attr("data");
            }
        });
        $(document).find("text").dblclick(function () {
            var el = $(this)
            setContent(JSON.parse(el.attr("data-full")));
            $("#historyPreview").dialog("close");
        });
    } else {
        // Todo message no history
    }
    $("#history").click(function () {
        _historyPreview.dialog("open");
    })
}

function replaceCRLFForForFirstTwoLines(text) {
    var val = getFirstTwoLines(text, "<br>");
    return val.replace(/<br>/g, "\n");
}

function getFirstTwoLines(text, pattern) {
    text = text + "<br>"
    var i = text.indexOf(pattern) + pattern.length;
    if (-1 !== i) {
        i = i + text.substr(i).indexOf(pattern);
    }
    if (-1 !== i) {
        return text.substr(0, i);
    }
    return text;
}

function activateExportButton() {
    $("#exportWord").click(function () {
        ipcRenderer.send('export-dialog');
    })
}

//# sourceURL=LetterStructure.js