var store;

$(document).ready(function () {

    store = require('data-store')('my-app');
    var autosize = require("autosize")
    var date = new Date();
    var _fieldset = $("<fieldset>");
    _fieldset.click(function (e) {
        e.stopPropagation();
    })
    var _select = $("<select>", {"name": "sender", "id": "sender"});
    var _option = $("<option>").html("Samuel Mathes &dash; Brucknerstraße 28 &dash; 72766 Reutlingen");
    _select.append(_option);
    _select.append($("<option>", {"html": "Add sender"}));
    _fieldset.append(_select);
    var _address = $("<div>", {"id":"address", "html":"Max Mustermann<br>Musterstraße 12<br>12345 Musterstadt"})
    var _dateField = $("<div>", {"id":"date", "html":"Reutlingen, den <input type='text' id='datepicker'>"})
    var _subject = $("<input>", {"id":"subject", "type": "text"}).val("Betreff: Ihr Schreiben vom")
    var _text = $("<textarea>", {"id": "text"});
    autosize(_text)
    _text.val(("Sehr geehrter Herr \n\nLorem Ipsum"));
    var _greeting = $("<div>", {"id": "greeting", "html": "Grüße <br><br>Samuel Mathes"});
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
    var dialogContent = $("<p>", {"html": createAddressTable(getStoredData("address")), "style": "display:none"});
    createAddress.append(dialogContent);
    $("#content").append(createAddress);
    _address.click(function () {
        createAddress.dialog({width: 800});
        dialogContent.show();
    })
    $("#print-pdf").click(function () {
        createAddress.dialog("close");
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
            tr.append($("<td>").html($("<input>").css("width", "90%").val(addressEntryField).click(function (e) {
                _table.find(".ui-selected").removeClass("ui-selected");
                $(e.target).parent().parent().addClass("ui-selected")
            }).dblclick(function (e) {
                var addressField = getAddress($(e.target).parent().parent());
                $("#address").html($("#address").children()[0]);
                $("#address").append(addressField.join("<br>")).prepend();
                $("#createAddress").dialog("close");
            })));
        }
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
    return _table;
}

function getStoredData (key) {
    return store.get(key);
}

function getAddress(tableRow) {
    var fullAddress = [];
    var attributes = tableRow.children();
    if (!isCellEmpty(attributes[0]) || !isCellEmpty(attributes[1]) || !isCellEmpty(attributes[2]) || !isCellEmpty(attributes[3])) {
        var _name = getValueOfTableCell(attributes[0]) + " " + getValueOfTableCell(attributes[1]) + " " + getValueOfTableCell(attributes[2]) + " " + getValueOfTableCell(attributes[3]);
        _name = _name.replace(/  /g, " ")
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