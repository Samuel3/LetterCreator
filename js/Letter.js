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
    var _subject = $("<div>", {"id":"subject", "html": "Betreff: Ihr Schreiben vom"})
    var _text = $("<textarea>", {"id": "text"}).val("Sehr geehrter Herr \n\nLorem Ipsum");
    autosize(_text)
    var _greeting = $("<div>", {"id": "greeting", "html": "Grüße <br><br>Samuel Mathes"});

    _address.prepend(_fieldset);
    $("#sender").selectmenu();
    $("#content").append(_address);
    $("#content").append(_dateField);
    $("#content").append(_subject);
    $("#content").append(_text);
    $("#content").append(_greeting);
    $("#datepicker").val(("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear())
    $("#datepicker").datepicker({dateFormat: "dd.mm.yy"});
});