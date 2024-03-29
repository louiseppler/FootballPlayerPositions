var minFrame = 0;
var maxFrame = 143761;


function setupUIElements() {
    $('#duration_slider').prop("min", minFrame);
    $('#duration_slider').prop("max", maxFrame-2);

    $("#play_button").click(function() {
        isPlaying = !isPlaying;

        if(isPlaying) {
            $("#play_button").html("Pause")
        }
        else {
            $("#play_button").html("Play")
        }
    });

    $("#button_team_a").click(function() {
        showTeamA = true;
        showTeamB = false;
    });
    $("#button_team_b").click(function() {
        showTeamA = false;
        showTeamB = true;  
    });
    $("#button_team_both").click(function() {
        showTeamA = true;
        showTeamB = true;
    });

    

    $("#button_show_graph_a").click(function() {
        showGraphForTeam = 1
    });    
    $("#button_show_graph_b").click(function() {
        showGraphForTeam = 2
    });
    $("#button_show_graph_none").click(function() {
        showGraphForTeam = 0
    });  
    
    $("#dubug_button").click(function() {
        debugFlagSet = true;
    });

    $( "#slider-range" ).slider({
        range: true,
        min: minFrame,
        max: maxFrame,
        values: [ minFrame, maxFrame ],
        slide: function( event, ui ) {
          //get called when slider is updated
        }
      });
}