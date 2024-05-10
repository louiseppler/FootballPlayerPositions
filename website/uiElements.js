var minFrame = 0;
var maxFrame = 143761-2;


function setupUIElements() {

    setupViewSettings();


    $('#duration_slider').prop("min", minFrame);
    $('#duration_slider').prop("max", maxFrame-2);

    $("#play_button").click(function() {
        isPlaying = !isPlaying;
        nextFrameAt = Date.now()
    });

    $("#dubug_button").click(function() {
        //$('#duration_slider').val(34000);
        debugFlagSet = true;
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
    })
    showGraphForTeam = +($('input[name=graph_select]:checked').val());


    $("#overview_select_group").click(function() {
        showOverviewForTeam = +($('input[name=overview_select]:checked').val());
    })
    showOverviewForTeam = +($('input[name=overview_select]:checked').val());



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

function changePlaybackSpeed(val) {
    playBackSpeed = val;
    isPlaying = true;
    nextFrameAt = Date.now()
    $("#button_pause").show();
    $("#button_play").hide();
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

function setupViewSettings() {
    document.getElementById("show_other_team_btn").checked = true;
    document.getElementById("show_goal_keeper_btn").checked = true;
    document.getElementById("show_shape_graph_btn").checked = true;
    viewSettingsChanged();
}

function viewSettingsChanged() {
    showOtherTeam =  document.getElementById("show_other_team_btn").checked;
    showGoalKeepers = document.getElementById("show_goal_keeper_btn").checked;
    showShapeGraph = document.getElementById("show_shape_graph_btn").checked;
}
