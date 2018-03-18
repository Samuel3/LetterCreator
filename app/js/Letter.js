var store;

$(document).ready(function () {
    store = require('data-store')('my-app');
    var table = createAddressTable(getStoredData("address"));
    var autosize = require("autosize")
    var date = new Date();
    var _fieldset = $("<fieldset>");
    _fieldset.click(function (e) {
        e.stopPropagation();
    })
    var _select = $("<select>", {"name": "sender", "id": "sender"}).change(function (e) {
        if ($("#sender option:selected").text() === "Add sender") {
            $("#formSender").dialog("open");
        }
    });
    for (data of getStoredData("sender")){
        var _option = $("<option>").html(data);
        _select.append(_option);
    };
    _select.append($("<option>", {"html": "Add sender"}));
    _fieldset.append(_select);
    var firstReceiver = $($(table.children()[1]).children()[0]);
    var _address = $("<div>", {"id":"address", "html": getAddress(firstReceiver).join("<br>")})
    var _dateField = $("<div>", {"id":"date", "html":"Reutlingen, den <input type='text' id='datepicker'>"})
    var _subject = $("<input>", {"id":"subject", "type": "text"}).val("Betreff: Ihr Schreiben vom")
    var _text = $("<textarea>", {"id": "text"});
    autosize(_text);
    _text.val(("Sehr geehrter Herr \n\nLorem Ipsum"));
    autosize.update(_text);
    var _greeting = $("<textarea>", {"id": "greeting"}).val(getStoredData("greeting"));
    autosize(_greeting);
    autosize.update(_greeting);
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
            "Cancel": function () {
                $(this).dialog("close");
            },
            "OK": function() {
                var option = $("<option>").html($("#inputSender").val());
                $("select option:last").before(option);
                setStoredData("sender", getSenderDataFromDropdown());
                $("#sender").val($("#inputSender").val());
                $(this).dialog("close");
            }
        }
    });
    $("#print-pdf").click(function () {
        try {
            createAddress.dialog("close");
        } catch (e){}
    })
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

    for (addressEntry of addressData) {
        var tr = $("<tr>");
        for (addressEntryField of addressEntry) {
            createTableData(tr, addressEntryField);
        }
        createDeleteButton(tr);
        _body.append(tr);
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
        $("#address").html($("#address").children()[0]);
        $("#address").append(addressField.join("<br>")).prepend();
        $("#createAddress").dialog("close");
        setStoredData("address", getAddressDataFromTable());
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
    $("#addressTable").find("tr").not(".ui-widget-header").each(function(i,el){
        var addressEntry = [];
        $(el).find("td").not(":last").each(function (j, td) {
            var addressField = $(td).find("input").val() ? $(td).find("input").val() : "";
            addressEntry.push(addressField);
        });
        addressData.push(addressEntry);
    })
    return addressData;
}

function getSenderDataFromDropdown() {
    var senderData = [];
    $("#sender option").each(function (i, el) {
        if ($(el).val() !== "Add sender") {
            senderData.push($(el).val());
        }
    });
    return senderData;
}