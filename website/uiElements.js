var minFrame = 0;
var maxFrame = 143761;


function setupUIElements() {
    $('#duration_slider').prop("min", minFrame);
    $('#duration_slider').prop("max", maxFrame-2);

    $("#play_button").click(function() {
        isPlaying = !isPlaying;

        if(isPlaying) {
            $("#play_button").html("Stop")
        }
        else {
            $("#play_button").html("Play")
        }


    });
}