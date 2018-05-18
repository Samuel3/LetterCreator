const {ipcRenderer, remote} = require('electron');

ipcRenderer.on("releaseNotes-available", (event, releaseNotes) => {
    console.log(releaseNotes)
    $("#content").html(releaseNotes.releaseNotes);
});

$(document).ready(function () {
    $("#ok").click(function () {
        remote.getCurrentWindow().close();
    })
});