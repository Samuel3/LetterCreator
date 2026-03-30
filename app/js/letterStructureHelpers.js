function colorize(str) {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)) ;
    var color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
}

function buildAddress(values, noReceiverMsg) {
    var fullAddress = [];
    function isEmpty(val) {
        return typeof val === "undefined" || val === null || val === "";
    }
    if (!isEmpty(values[0]) || !isEmpty(values[1]) || !isEmpty(values[2]) || !isEmpty(values[3])) {
        var _name = (values[0] || "") + " " + (values[1] || "") + " " + (values[2] || "") + " " + (values[3] || "");
        _name = _name.replace(/  /g, " ").trim();
        fullAddress.push(_name);
    }
    if (!isEmpty(values[4])) {
        fullAddress.push(values[4]);
    }
    if (!isEmpty(values[5])) {
        fullAddress.push(values[5]);
    }
    if (!isEmpty(values[6])) {
        fullAddress.push(values[6]);
    }
    if (!isEmpty(values[7]) || !isEmpty(values[8])) {
        var _city = ((values[7] || "") + " " + (values[8] || "")).trim();
        fullAddress.push(_city);
    }
    if (!isEmpty(values[9])) {
        fullAddress.push(values[9]);
    }
    if (fullAddress.length === 0) {
        return [noReceiverMsg || "", "", "", ""];
    }
    return fullAddress;
}

module.exports = { colorize, buildAddress };
