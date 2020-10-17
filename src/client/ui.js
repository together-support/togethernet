$(document).ready(function() {
    $("#_infoToggle").click(function() {
        $("#infoToggleIcon").toggleClass("fas fa-eye fas fa-eye-slash");
        $(".overlay").toggle();

        if (
            $(".publicMsg").is(":visible") == false ||
            $(".privateMsg").is(":visible") == true
        ) {
            $(".overlay").text(
                "p2p mode does not store any messages on the server."
            );
        }
        if (
            $(".publicMsg").is(":visible") == true &&
            $(".privateMsg").is(":visible") == false
        ) {
            $(".overlay").text(
                "archival mode automatically pushes messages to the server."
            );
        }
    });
    $("#_privacyToggle").click(function() {
        $("#privacyToggleIcon").toggleClass(
            "fas fa-upload fas fa-people-arrows"
        );
        // reset toggle button styling
        $('#_privacyToggle').css('border', '1px solid black');

        if (
            $(".publicMsg").is(":visible") == false ||
            $(".privateMsg").is(":visible") == false
        ) {
            $(".privateMsg").toggle();
            $(".publicMsg").toggle();
        }
        if (
            $(".publicMsg").is(":visible") == true &&
            $(".privateMsg").is(":visible") == true
        ) {
            $(".publicMsg").toggle();
        }
    });
    $("#_duoToggle").click(function() {
        $("#duoToggleIcon").toggleClass("fas fa-plus fas fa-minus");
        if (
            $(".privateMsg").is(":visible") == true &&
            $(".publicMsg").is(":visible") == false
        ) {
            $(".publicMsg").toggle();
        } else if (
            $(".publicMsg").is(":visible") == true &&
            $(".privateMsg").is(":visible") == false
        ) {
            $(".privateMsg").toggle();
        } else if (
            $(".publicMsg").is(":visible") == true &&
            $(".privateMsg").is(":visible") == true
        ) {
            $(".publicMsg").toggle();
        }
    });
    // under dev alerts
    $("#_recordBtn").click(function() {
        alert("recording feature coming soon");
    });
    $("#_historyToggle").click(function() {
        alert("history feature coming soon");
    });
});