var exportSelected = false;

window.storeAPI.initialize(function () {
    $(document).ready(function () {
        // Update
        setHistoryEntries()

        var addressData = window.storeAPI.get("address")
        var _body = $(document).find("tbody")
        _body.empty()
        if (typeof addressData !== "undefined") {
            for (addressEntry of addressData) {
                var tr = $("<tr>");
                for (addressEntryField of addressEntry) {
                    createTableData(tr, addressEntryField);
                }
                createDeleteButton(tr);
                _body.append(tr);
            }
        }

        var _select = $("#sender").empty()

        for (data of window.storeAPI.get("sender")) {
            var _option = $("<option>").html(data);
            _select.append(_option);
        }
        ;
        _select.append($("<option>", {"html": i18n("message.addsender")}));
    })
});

function requestDropboxKey() {
    var authUrl = window.storeAPI.getDropboxAuthUrl();
    if (authUrl) {
        window.electronAPI.dropboxLogin(authUrl);
        window.electronAPI.onDropboxAuthToken(function (token) {
            window.storeAPI.setDropboxKey(token);
            window.storeAPI.storeCloudData();
        });
    }
}

if (window.storeAPI.isDropboxKeyNeeded()) {
    requestDropboxKey();
}

function createWelcomeDialog() {
    window.storeAPI.set("startedOnce", true);
    let startedOnce = $("<div>", {
        "id": "introduction",
        html: $("<div>", {"id": "introductionText"}).append($("<div>", {
            "id": "loading",
            "class": "spinner",
            css: "display:none"
        })),
        "title": i18n("title.introduction")
    });
    $("#content").append(startedOnce)

    $("<div>", {"id":"intro_0", html: i18n("message.intro"), "appendTo": $("#introductionText")})
    $("<div>", {"id":"intro_1", html: i18n("message.introUseDropbox"), "appendTo": $("#introductionText")}).hide()
    $("a.dropbox").click(function (e) {
        e.preventDefault()
        requestDropboxKey()
    });


    let steps = $("<div>", {"id": "stepsContainer"});
    startedOnce.append(steps)
    var stepCounter = 0;
    for (var i = 0; i < 2; i++) {
        let step = $("<span>", {"class": "step"})
        steps.append(step)
    }
    steps.on("click", "span", function (e) {
        displayText($(this).index())
    })
    $(".step").first().addClass("active")

    let useDropboxDiv = $("<div>", {"id": "useDropboxDiv", "text": ""})
    $("#loading").hide()
    startedOnce.dialog({
        width: 640,
        buttons: [{
            text: i18n("button.back"),
            "id": "startedOncePrevious",
            click: function () {
                stepCounter--
                displayText(stepCounter)
            }
        },
        {
            text: i18n("button.further"),
            "id": "startedOnceFurther",
            click: function () {
                stepCounter++
                if ($("#startedOnceFurther").html() === i18n("button.done")) {
                    $("#introduction").dialog("close")
                }
                displayText(stepCounter)
            }
        }]
    })
    $("#startedOncePrevious").hide()
}

function displayText(number) {
    $("#startedOnceFurther").show()
    $("#startedOncePrevious").show()
    $("#introductionText").find(":visible").hide(function () {
    })
    $("#intro_" + number).show()
    if (number == 0) {
        $("#startedOncePrevious").hide()
        $("#startedOnceFurther").html(i18n("button.further"))
    } else if (number == ($(".step").length - 1)) {
        $("#startedOnceFurther").html("Fertig")
    }
    $(".step.active").removeClass("active")
    $(".step:eq(" + number+ ")").addClass("active")

}

$(document).ready(function initialize() {
    var history = window.storeAPI.get("history");
    if ($.isArray(history)) {
        history = history [0];
    }
    if (typeof history === "undefined") {
        history = {}
    }

    let startedOnce = window.storeAPI.get("startedOnce");
    if (!startedOnce === true) {
        createWelcomeDialog();
    }


    $("#print-pdf").click(function () {
        window.electronAPI.printToPdf();
        showMessage(i18n("message.letterstored"), 10000);
        window.storeAPI.storeHistory(getCurrentContent());
        setHistoryEntries();
    });
    $("#print").click(function () {
        window.electronAPI.print();
        showMessage(i18n("message.letterstored"), 10000);
        window.storeAPI.storeHistory(getCurrentContent());
        setHistoryEntries();

    });
    var table = createAddressTable(window.storeAPI.get("address"));
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
    });
    if (typeof window.storeAPI.get("sender") === "undefined") {
        window.storeAPI.set("sender", []);
    }
    for (data of window.storeAPI.get("sender")) {
        var _option = $("<option>").html(data);
        _select.append(_option);
    }
    ;
    _select.append($("<option>", {"html": i18n("message.addsender")}));
    _fieldset.append(_select);
    var firstReceiver = $($(table.children()[1]).children()[0]);
    var _address = $("<div>", {
        "id": "address",
        "html": "<div id='receiver'>" + getAddress(firstReceiver).join("<br>") + "</div>"
    });
    var place = history.place ? history.place : i18n("letter.place");
    var _dateField = $("<div>", {
        "id": "date",
        "contenteditable": true,
        "html": "<div id='place'>" + place + "</div><input type='text' id='datepicker'>"
    })
    var _subject = $("<input>", {
        "id": "subject",
        "type": "text"
    }).val(history.subject ? history.subject : i18n("letter.subject"));
    var _text = $("<div>", {"id": "text", "contenteditable": true});
    var content = history.content ? history.content : i18n("letter.content");
    _text.html(content);
    _text.keyup(function (e) {
        debugger
        var index = window.getSelection().getRangeAt(0).startOffset
        var nextChar = e.target.innerHTML.charAt(index)
        console.log(nextChar)
    });
    var _greeting = $("<div>", {
        "id": "greeting",
        "contenteditable": true
    }).html(history.greeting ? history.greeting : i18n("letter.greeting"));
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
                    window.storeAPI.set("address", getAddressDataFromTable())
                }
            }
        });
        dialogContent.show();
    });
    var form = $("<form>", {
        "id": "formSender",
        "title": i18n("message.addsender"),
        "html": i18n("message.sendername")
    });
    var input = $("<input>", {"id": "inputSender"});
    form.append(input);
    $("#content").append(form);
    var _cancel = i18n("button.abort");
    var _delete = i18n("button.delete");
    var _buttons = {};
    _buttons[_cancel] = function () {
        $(this).dialog("close");
    }
    _buttons[_delete] = function () {
        var _delVal = $("#inputSender").val();
        $("#sender > option").filter(function (i, el) {
            return $(el).val() === _delVal
        }).remove();
        window.storeAPI.set("sender", getSenderDataFromDropdown());
        $(this).dialog("close");
        $("#inputSender").val("");
    };
    _buttons["OK"] = function () {
        var option = $("<option>").html($("#inputSender").val());
        $("select option:last").before(option);
        window.storeAPI.set("sender", getSenderDataFromDropdown());
        $("#sender").val($("#inputSender").val());
        $("#inputSender").val("");
        $(this).dialog("close");
    }
    form.dialog({
        autoOpen: false,
        buttons: _buttons
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
        window.electronAPI.saveDialog(JSON.stringify(getCurrentContent()));
    })
    $("#load").click(function () {
        window.electronAPI.openFileDialog();
    });
    $(document).on({
        'dragover dragenter': function (e) {
            e.preventDefault();
        }
    });
    document.body.ondrop = (ev) => {
        try {
            var file = ev.dataTransfer.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                setContent(JSON.parse(e.target.result));
            };
            reader.readAsText(file);
        } catch (err) {
            console.error('Error reading dropped file:', err);
        }
        ev.preventDefault()
    };
    activateHistoryButton();
    activateExportButton();
})

function createAddressTable(addressData) {
    var _table = $("<table>", {"id": "addressTable", "class": "ui-widget ui-widget-content"});
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
    }

    _table.append(_header);
    _table.append(_body);
    _table.selectable({filter: "tr"}).draggable({
        helper: "clone",
        start: function (event, ui) {
            c.tr = this;
            c.helper = ui.helper;
        }
    });
    _table.append($("<button>", {"id": "addRow"}).html("Add Row").click(function (e) {
        let tr = $("<tr>");
        for (i = 0; i < 10; i++) {
            createTableData(tr, "");
        }
        createDeleteButton(tr);
        _table.append(tr);
    }));
    return _table;
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
    if (!isCellEmpty(attributes[7]) || !isCellEmpty(attributes[8])) {
        var _city = getValueOfTableCell(attributes[7]) + " " + getValueOfTableCell(attributes[8]);
        fullAddress.push(_city);
    }
    if (!isCellEmpty(attributes[9])) {
        fullAddress.push(getValueOfTableCell(attributes[9]));
    }
    if (fullAddress.length === 0) {
        return [i18n("message.noreceiver"), "", "", ""];
    }
    return fullAddress;
}

function isCellEmpty(cell) {
    return typeof getValueOfTableCell(cell) === "undefined";
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
        window.storeAPI.set("address", getAddressDataFromTable());
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
        time: new Date().toLocaleTimeString(),
        printDate: new Date().toLocaleDateString(),
        "version": "1.0"
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
    window.storeAPI.storeHistory(getCurrentContent());
    try {
        createAddress.dialog("close");
    } catch (e) {
    }
}

window.electronAPI.onFileContent(function (content) {
    try {
        setContent(JSON.parse(content));
    } catch (e) {
        console.error('Error parsing file content:', e);
    }
});

window.electronAPI.saveRequested(function () {
    window.electronAPI.saveDialog(JSON.stringify(getCurrentContent()));
});

// The export dialog now sends content to main process for DOCX generation
function triggerExport() {
    var _content;
    if (!exportSelected) {
        _content = getCurrentContent();
    } else {
        _content = JSON.parse($("#historyPreview").find(".ui-selected").data("content"));
        exportSelected = false;
    }
    window.electronAPI.exportDialog(JSON.stringify(_content));
}

window.electronAPI.onClosed(function () {
    window.storeAPI.storeHistory(getCurrentContent());
});

window.electronAPI.onWrotePdf(function (path) {
    const message = `Wrote PDF to: ${path}`;
    document.getElementById('pdf-path').innerHTML = message;
});

window.electronAPI.onMessage(function (content) {
    showMessage(content, 5000);
});


window.electronAPI.onUpdateDownloaded(function (info) {
    var message = $("<div>", {
        "class": "message",
        html: i18n("message.downloadcomplete"),
        "id": "updateReady"
    }).css("pointer-events", "all");
    var quitAndInstall = $("<a>", {
        "href": "#",
        "text": i18n("message.quitandinstall"),
        "click": function () {
            console.log("quit and install")
            window.electronAPI.updateDirectly();
        }
    }).click(function () {
        window.electronAPI.updateDirectly();
    });

    var installAfterClose = $("<a>", {
        "href": "#",
        "text": i18n("message.installafterclose"),
        "click": function () {
            console.log("install after close")
            window.electronAPI.updateAfterClose();
            $("#updateReady").hide()
        }
    }).click(function () {

        window.electronAPI.updateAfterClose();
        $("#updateReady").hide()
    });
    var nextRemember = $("<a>", {
        "href": "#",
        "text": i18n("message.remembermelater"),
        "click": function () {
            console.log("remember me later")
            $("#updateReady").hide()
        }
    }).click(function () {
        $("#updateReady").hide()
    });
    message.append("<br>").append(quitAndInstall).append("<br>").append(installAfterClose).append("<br>").append(nextRemember);
    $("#messageBox").append(message);
});

window.electronAPI.onReceivedDropboxkey(function () {
    $("#introduction").dialog("close");
});

function showMessage(message, delay) {
    $("#messageBox").append($("<div>", {"class": "message", html: message}).delay(delay).hide({
        "duration": "2000",
        easing: 'easeOutBounce'
    }).effect("shake"))
}

function setHistoryEntries() {
    var _content = $("#historyContent").scroll(function () {
        var scrollTop = $(this).scrollTop()
        $("#sliderContainer").toggleClass("shadow", scrollTop >= 50)
    });
    _content.empty();
    var sliderDiv = $("<div>", {
        "id": "sliderContainer"
    });
    sliderDiv.append($("<input>", {
        "id": "slider",
        "type": "range",
        "min": 0,
        "max": 100,
        "value": 0,
        "name": "historySize"
    }).on("change input", function (e) {
        $("#previewContainer").css("fontSize", 12 + ($(this).val() * 12 / 100))
        e.preventDefault()
    }));
    sliderDiv.append($("<label>", {
        "id": "sliderLabel",
        "for": "historySize",
        "html": i18n("title.size")
    }))
    _content.append(sliderDiv);
    var previewContainer = $("<div>", {
        "id": "previewContainer",
    }).selectable({
        start: function (event, ui) {
            var _el = $(event.originalEvent.target).parent()
            event.preventDefault()
            if (_el.prevObject.attr("id") === "delete") {
                removeElementFromHistory(_el)
            } else if (_el.prevObject.attr("id") === "export") {
                exportSelected = true;
                triggerExport();
            } else if (_el.prevObject.attr("id") === "print") {
                setContent(JSON.parse(_el.data("content")))
                window.electronAPI.print();
            } else if (_el.prevObject.attr("id") === "print-pdf") {
                setContent(JSON.parse(_el.data("content")))
                window.electronAPI.printToPdf();
            } else if (_el.hasClass("ui-selected")) {
                $("#historyPreview").dialog("close");
                setContent(JSON.parse(_el.data("content")));
            }
        }
    });
    _content.append(previewContainer)

    var entries = window.storeAPI.get("history");
    $(entries).each(function (i, entry) {
        let previewEntry = $("<div>", {"id": i, "class": "historyEntry"});

        previewEntry.data("content", JSON.stringify(entry)).tooltip({
            "items": "div",
            "content": function () {
                try {
                    var data = JSON.parse($(this).parent().data("content"));
                    return data.sender + "<br>" + data.time + "<br>" + data.printDate
                } catch (e) {
                }
            }
        });

        var receiver = $("<div>", {
            "id": "historyReceiver",
            "html": entry.receiver + "<br>"
        });
        previewEntry.append(receiver);

        var content = $("<div>", {
            "id": "historySender",
            "html": entry.content + "<br>"
        });
        previewEntry.append(content);

        var greeting = $("<div>", {
            "id": "historySender",
            "html": entry.greeting
        });
        previewEntry.append(greeting).css("border", "2px solid " + colorize(entry.receiver));

        previewEntry.append($("<div>", {"id": "print", "class": " icon"}));
        previewEntry.append($("<div>", {"id": "print-pdf", "class": " icon"}));
        previewEntry.append($("<div>", {"id": "export", "class": " icon"}));
        previewEntry.append($("<div>", {"id": "delete", "class": "ui-icon-reset icon"}));

        previewContainer.append(previewEntry);

        _content.keydown(function (e) {
            e.stopImmediatePropagation()
            var _selectedEl = $("#previewContainer").find(".ui-selected");
            if (_selectedEl.length > 0) {
                if (e.key === "ArrowDown" && !(_selectedEl.next().attr("id") === "slider")) {
                    _selectedEl.removeClass("ui-selected");
                    _selectedEl.next().addClass("ui-selected");
                    _content.scrollTop(_content.scrollTop() + _selectedEl.next().position().top - 30);
                } else if (e.key === "ArrowUp" && !(_selectedEl.index() === 0)) {
                    _selectedEl.removeClass("ui-selected");
                    _selectedEl.prev().addClass("ui-selected");
                    _content.scrollTop(_content.scrollTop() + _selectedEl.prev().position().top) - 30;
                } else if (e.key === "Enter") {
                    $("#historyPreview").dialog("close");
                    setContent(JSON.parse($(_selectedEl).data("content")))
                } else if (e.key === "Backspace" || e.key === "Delete") {
                    removeElementFromHistory(_selectedEl)
                }
            }
        });
    });
}

function removeElementFromHistory(_el) {
    var _index = _el.index();
    var history = window.storeAPI.get("history")
    var _newHistory = [];
    for (var i in history) {
        if (i != _index) {
            _newHistory.push(history[i])
        }
    }
    window.storeAPI.set("history", _newHistory);
    _el.remove();
}

function activateHistoryButton() {
    var _historyPreview = $("<div>", {
        "id": "historyPreview",
        title: i18n("title.historypreview")
    }).css({
        height: "350px",
        overflow: "auto"
    }).dialog({
        autoOpen: false,
        width: "80%",
        appendTo: "#content"
    });

    var _content = $("<div>", {"id": "historyContent"}).css({
        height: "350px",
        overflow: "auto"
    }).appendTo("#historyPreview");

    setHistoryEntries(_content);
    $("#history").click(function () {
        _historyPreview.dialog("open");
    })
}

function activateExportButton() {
    $("#exportWord").click(function () {
        triggerExport();
    })
}

function colorize(str) {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)) ;
    color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
}

//# sourceURL=LetterStructure.js
