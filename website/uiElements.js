var minFrame = 0;
var maxFrame = 143761-2;


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

    $("#button_show_color_mode_x").click(function() {
        showGraphColorMode = 1;
    });
    $("#button_show_color_mode_y").click(function() {
        showGraphColorMode = 2; 
    });
    $("#button_show_color_mode_d").click(function() {
        showGraphColorMode = 0;
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
        //$('#duration_slider').val(34000);
        debugFlagSet = true;
    });

    $("#shape_mode").click(function() {
        shapeGraphMode += 1;
        if(shapeGraphMode > 1) shapeGraphMode = 0
    });


    $("#smoothing_slider").click(function() {
        //debugFlagSet = true;
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

      
      $("#graph_select_group").click(function() {
        showGraphForTeam = +($('input[name=graph_select]:checked').val());
        console.log("chaning to " + showGraphForTeam);
      })
      showGraphForTeam = +($('input[name=graph_select]:checked').val());

      $("#team_select_group").click(function() {
        setShowTeam( $('input[name=team_select]:checked').val() );   
      })
      setShowTeam( $('input[name=team_select]:checked').val() );  
      
      
      $("#button_play").click(function() {
        isPlaying = true;
        $("#button_pause").show();
        $("#button_play").hide();
      })
      $("#button_pause").click(function() {
        isPlaying = false;
        $("#button_pause").hide();
        $("#button_play").show();
      })
      $("#button_pause").hide();

}

function setShowTeam(str) {
    if(str == "team_a") {
        showTeamA = true;
        showTeamB = false;
    }
    else if(str == "team_b") {
        showTeamA = false;
        showTeamB = true;
    }
    else if(str == "team_both") {
        showTeamA = true;
        showTeamB = true;
    }
}

function updateColor(i) {
    console.log("updating color");
    showGraphColorMode = i;
}

function smoothingSliderDidChange(val) {
    document.getElementById("smoothing_text").innerHTML = "Smoothing " + val
}
