window.releaseNotesAPI.onReleaseNotes((releaseNotes) => {
    console.log(releaseNotes)
    $("#content").html(releaseNotes.releaseNotes);
});

$(document).ready(function () {
    $("#ok").click(function () {
        window.releaseNotesAPI.closeWindow();
    })
});

//# sourceURL=releaseNotes.js