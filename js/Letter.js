$(document).ready(function () {
    var autosize = require("autosize")
    var date = new Date();
    var _fieldset = $("<fieldset>");
    var _select = $("<select>", {"name": "sender", "id": "sender"});
    var _option = $("<option>").html("Samuel Mathes &dash; Brucknerstraße 28 &dash; 72766 Reutlingen");
    _select.append(_option);
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
});

function createAddressTable() {
    var _table = $("<table>", {"id": "addressTable", "class":"ui-widget ui-widget-content"});
    var _header = $("<thead>");
    var _tr = $("<tr>", {"class": "ui-widget-header"});
    _header.append(_tr);
    _tr.append($("<th>").val("Anrede")).append($("<th>").val("Vorname"))

    var _body = $("<tbody>");

    _table.append(_header);
    _table.append(_body);
    return _table;
}