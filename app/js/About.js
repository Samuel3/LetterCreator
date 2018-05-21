const {ipcRenderer} = require("electron")
require("../js/i18n");

$(document).ready(function () {
    var version = require("../package.json").version;
    $("#content").html("LetterCreator was created by Samuel Mathes<br><br>Version: " + version +"<br><br>License: <a href='https://raw.githubusercontent.com/Samuel3/LetterCreator/master/LICENSE'>MIT License</a><br><br>Fork me on <a href='https://github.com/Samuel3/LetterCreator'>Github</a><br><br>&copy; 2018 by Samuel Mathes");
    $("#progressbar").progressbar({value: false});
    $("#progressbar").hide();
    $("#messageBox").hide();
});

ipcRenderer.on("progress", (event, progress) => {
    $("#progressbar").show();
    $("#messageBox").html(i18n("message.nextreleaseavailable")).show();
    $("#progressbar").progressbar("option",{
        value: progress
    });
});