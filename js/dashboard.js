/*
*   Filename: dashboard.js
*/

// --- File Globals
var thisFileName = "dashboard.js";
var list_of_precincts = [1,5,6,7,9,10,13,14,17,18,19,20,22,23,24,25,26,28,30,32,33,34,40,41,42,43,44,45,46,47,48,49,50,52,60,61,62,63,66,67,68,69,70,71,72,73,75,76,77,78,79,81,83,84,88,90,94,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,120,121,122,123];
var selected_index = null;
var selected_date = null;
var parseDate = d3.time.format("%Y-%m-%d").parse;

var indexAttribute = 0;
var MAX_CHARTS = 3;

var cf,cf_time_dim;
var cf_all_collisions_group, cf_injures_group, cf_fatalities_group, cf_cyclists_group, cf_injury_group, cf_fatal_group, cf_pedestrians_group; 

var sparkline1, sparkline2, sparkline3, sparkline4, sparkline5, sparkline6, sparkline7;

var lineChart0, lineChart1, lineChart2;

var most_recent_date, earliest_date;

// --- Sparkline Global Variables
var cfdates = {
  loadCSV: null,
  initDropdownDates: null,
  csvFileDirectory: "./csv/pcts/",
  csvFileName: "collisions_",
  csvFileExtension: ".csv",
};


var cfsparkline = {
  dataset: null,
  draw: null,
  loadCSV: null,
  init: null,
  drawsparkline: null,
  drawlinechart: null,
  initialPrecinct: 1,
  csvFileDirectory: "./csv/pcts/",
  csvFileName: "collisions_",
  csvFileExtension: ".csv",
  width: 200,
  height: 30,
  top: 0, 
  right: 5, 
  bottom: -1, 
  left: -1,
}

// TODO: populate the attribute dropdown with names.  If you select an attribute then remove it from the choices of the others
//var attribute_names = ['ALL COLLISIONS','INJURY COLLISIONS','FATAL COLLISIONS','INJURIES','FATALITIES','CYCLISTS INVOLVED','PEDESTRIANS INVOLVED'];

var attribute = {"1" : {sparkline : null, group : null},
                 "2" : {sparkline : null, group : null},
                 "3" : {sparkline : null, group : null},
                 "4" : {sparkline : null, group : null},
                 "5" : {sparkline : null, group : null},
                 "6" : {sparkline : null, group : null},
                 "7" : {sparkline : null, group : null}}









//---------------------------------------------------------------------------------//
//                          FUNCTION LOG TO CONSOLE
//---------------------------------------------------------------------------------//
function log(m, f){

  var message;

  if(f.length == 0)
  {
    message = "[" + thisFileName + "]"; 
  } 
  else if(f.length > 0)
  {
    message = "[" + thisFileName + "][" + f + "] " + m;
  }
  console.log(message);  
}






//---------------------------------------------------------------------------------//
//                                  INIT DASHBOARD
//---------------------------------------------------------------------------------//
function initDashboard(){

  log("Initializing", "initDashboard");

  // Initialize the precinct dropdown
  initPrecinctSelect();

  // Initialize attribute change dropdown
  initAttributesSelect();

  // Load the dates for the dropdown menu
  // Note: this was the oroginal load csv function for sparklines but after changes it was still necessary to keep
  // the code functioning properly.  Load times are not an issue
  cfdates.loadCSV(cfsparkline.csvFileDirectory + cfsparkline.csvFileName + cfsparkline.initialPrecinct + cfsparkline.csvFileExtension);

  // Load the CF Spark Line Dataset
  cfsparkline.loadCSV(cfsparkline.csvFileDirectory + cfsparkline.csvFileName + cfsparkline.initialPrecinct + cfsparkline.csvFileExtension);
}









//---------------------------------------------------------------------------------//
//                                INIT PRECINCT SELECT
//---------------------------------------------------------------------------------//
function initPrecinctSelect(){

  // Populate the precincts dropdown dynamically
  list_of_precincts.forEach(function(d){$( "<option value=\"" + d + "\">" + "Precinct: " + d + "</option>" ).appendTo( $( "#select_precincts" ) );});

  // On-click
  $( "#select_precincts" ).change(function()
  {
    // Get the precinct value from the dropdown
    var csvFileNumber = $("#select_precincts").val();

    // Load the Spark Line Dataset
    cfdates.loadCSV(cfsparkline.csvFileDirectory + cfsparkline.csvFileName + csvFileNumber + cfsparkline.csvFileExtension);

    // Load the CF Spark Line Dataset
    cfsparkline.loadCSV(cfsparkline.csvFileDirectory + cfsparkline.csvFileName + csvFileNumber + cfsparkline.csvFileExtension);
 

    log("Loading Precinct: " + csvFileNumber, "initPrecinctSelect");
  });
  
  log("Initialize Dropdown Precincts", "initPrecinctSelect");
}







//---------------------------------------------------------------------------------//
//                              INIT ATTRIBUTE SELECT
//---------------------------------------------------------------------------------//
function initAttributesSelect(){

  // TODO: maybe set the color of the sparkline name to red if it is selected

  log("Initializing Attribute Dropdowns", "initAttributeSelect");

  $( "#select_attribute_0" ).change(function(){
    var selection = $("#select_attribute_0").val();
    cfsparkline.drawlinechart(lineChart0, attribute[selection].sparkline, attribute[selection].group);
    dc.renderAll();
  });

  $( "#select_attribute_1" ).change(function(){
    var selection = $("#select_attribute_1").val();
    cfsparkline.drawlinechart(lineChart1, attribute[selection].sparkline, attribute[selection].group);
    dc.renderAll();
  });


  $( "#select_attribute_2" ).change(function(){
    var selection = $("#select_attribute_2").val();
    cfsparkline.drawlinechart(lineChart2, attribute[selection].sparkline, attribute[selection].group);
    dc.renderAll();
  });
}








//---------------------------------------------------------------------------------//
//                                  CF DATES LOAD CSV
//---------------------------------------------------------------------------------//
cfdates.loadCSV = function(filename){

  log("Loading Sparkline CSV.", "sparkline.loadCSV" + ": " + filename);
  
  cfdates.dataset = [];

  
  d3.csv(filename,
    function(error, data) {            
        data.forEach(function(d,i)
        {
          cfdates.dataset.push({
            all_collisions: +d.all_collisions,
            injury_collisions: +d.injury_collisions,
            fatal_collisions: +d.fatal_collisions,
            injures: +d.injures,
            fatalities: +d.fatalities,
            cyclists_involved: +d.cyclists_involved,
            pedestrians_involved: +d.pedestrians_involved,
            year: +d.year,
            week: +d.week,
            row_number: +d.row_number,
            label: d.label,
            index: +d.index,
            date: parseDate(d.label.slice(19,30)),
          })

    }); //data.forEach

    // Populate the dropdown with dates
    cfdates.initDropdownDates();
   
  });
}





//---------------------------------------------------------------------------------//
//                             INIT DROPDOWN DATES
//---------------------------------------------------------------------------------//
cfdates.initDropdownDates = function(){  

  log("Initializing Dropdown Dates", "initDropdownDates");
  
  // Append each of the dates to the dropdown
  cfdates.dataset.forEach(function(d){$( "<option value=\"" + d.index + "\">" + d.label + "</option>" ).appendTo( $( "#select_dates" ) );});
  
  // Set the initial selected_index
  selected_index = d3.max(cfdates.dataset, function(d){return d.index;});

  // Set the initial selected_date
  selected_date = d3.max(cfdates.dataset, function(d){return d.date;});

  earliest_date = cfdates.dataset[0].label.slice(0,10);

  // Set the current date range to the most recent date
  $( "#select_dates").val(d3.max(cfdates.dataset, function(d){return d.index;}));

  // Set the weekly aggregated numbers of the html paragraphs next to the sparkline
  $("#number1").text(cfdates.dataset[selected_index]["all_collisions"]);
  $("#number2").text(cfdates.dataset[selected_index]["injury_collisions"]);
  $("#number3").text(cfdates.dataset[selected_index]["fatal_collisions"]);
  $("#number4").text(cfdates.dataset[selected_index]["injures"]);
  $("#number5").text(cfdates.dataset[selected_index]["fatalities"]);
  $("#number6").text(cfdates.dataset[selected_index]["cyclists_involved"]);
  $("#number7").text(cfdates.dataset[selected_index]["pedestrians_involved"]);

  // On-Change
  $( "#select_dates" ).change(function(){
    selected_index = $("#select_dates").val();
    
    // Naive number filling
       
    $("#number1").text(cfdates.dataset[selected_index]["all_collisions"]);
    $("#number2").text(cfdates.dataset[selected_index]["injury_collisions"]);
    $("#number3").text(cfdates.dataset[selected_index]["fatal_collisions"]);
    $("#number4").text(cfdates.dataset[selected_index]["injures"]);
    $("#number5").text(cfdates.dataset[selected_index]["fatalities"]);
    $("#number6").text(cfdates.dataset[selected_index]["cyclists_involved"]);
    $("#number7").text(cfdates.dataset[selected_index]["pedestrians_involved"]);


    // Redraw all sparklines
    cfsparkline.loadCSV(cfsparkline.csvFileDirectory + cfsparkline.csvFileName + cfsparkline.initialPrecinct + cfsparkline.csvFileExtension);
    
  });
}












//---------------------------------------------------------------------------------//
//                          CF SPARKLINE LOAD CSV
//---------------------------------------------------------------------------------//
cfsparkline.loadCSV = function(filename){
  
  log("Loading CSV.", "cfsparkline.loadCSV" + ": " + filename);
  cfsparkline.dataset = [];

  d3.csv(filename, function(error, d){
        cfsparkline.dataset = d;

        formatWeek = d3.time.format("%Y %U");
        formatDate = d3.time.format("%Y-%m-%d");

        // year,week,precinct,label,all_collisions,injury_collisions,fatal_collisions,injures,fatalities,cyclists_involved,pedestrians_involved,index
        // 2012,26,1,2012-06-25 through 2012-07-01,7,0,0,0,0,0,0,0
        // 2012,27,1,2012-07-02 through 2012-07-08,61,9,0,11,0,4,5,1
        cfsparkline.dataset.forEach(function(d){
          d.first_day             = d.label.substr(0,10);
          d.ts                    = formatDate.parse( d.first_day );
          d.year                  = +d.year;
          d.week                  = +d.week;
          d.index                 = +d.index;
          d.label                 =  d.label;
          d.date                  =  parseDate(d.label.slice(19,30)),
          d.all_collisions        = +d.all_collisions;
          d.injury_collisions     = +d.injury_collisions;
          d.fatal_collisions      = +d.fatal_collisions;
          d.injures               = +d.injures;
          fatalities              = +d.fatalities;
          cyclists_involved       = +d.cyclists_involved;
          pedestrians_involved    = +d.pedestrians_involved;
        });

                
        cfsparkline.init();
    });
}




//---------------------------------------------------------------------------------//
//                                  CF INIT
//---------------------------------------------------------------------------------//
cfsparkline.init = function(){

  // cross-filtering
  cf = crossfilter(cfsparkline.dataset);
  cf_time_dim = cf.dimension( function(d){ return d.ts } );

  cf_all_collisions_group = cf_time_dim.group().reduceSum( function(d){ return d.all_collisions;});
  cf_injury_group         = cf_time_dim.group().reduceSum( function(d){ return d.injury_collisions } );
  cf_fatal_group          = cf_time_dim.group().reduceSum( function(d){ return d.fatal_collisions } );
  cf_injures_group        = cf_time_dim.group().reduceSum( function(d){ return d.injures } );
  cf_fatalities_group     = cf_time_dim.group().reduceSum( function(d){ return d.fatalities } );      
  cf_cyclists_group       = cf_time_dim.group().reduceSum( function(d){ return d.cyclists_involved } );
  cf_pedestrians_group    = cf_time_dim.group().reduceSum( function(d){ return d.pedestrians_involved } );

  sparkline1 = dc.lineChart('#sparkline1');
  sparkline2 = dc.lineChart('#sparkline2');
  sparkline3 = dc.lineChart('#sparkline3');
  sparkline4 = dc.lineChart('#sparkline4');
  sparkline5 = dc.lineChart('#sparkline5');
  sparkline6 = dc.lineChart('#sparkline6');
  sparkline7 = dc.lineChart('#sparkline7');

  lineChart0 = dc.lineChart('#line-chart0');
  lineChart1 = dc.lineChart('#line-chart1');
  lineChart2 = dc.lineChart('#line-chart2');

  most_recent_date = cfsparkline.dataset[selected_index].ts;

  // Set up the attributes dictionary
  attribute['1'].sparkline = sparkline1; attribute['1'].group = cf_all_collisions_group;
  attribute['2'].sparkline = sparkline2; attribute['2'].group = cf_injury_group;
  attribute['3'].sparkline = sparkline3; attribute['3'].group = cf_fatal_group;
  attribute['4'].sparkline = sparkline4; attribute['4'].group = cf_injures_group;
  attribute['5'].sparkline = sparkline5; attribute['5'].group = cf_fatalities_group;
  attribute['6'].sparkline = sparkline6; attribute['6'].group = cf_cyclists_group;
  attribute['7'].sparkline = sparkline7; attribute['7'].group = cf_pedestrians_group;


  // Draw Spark Lines
  cfsparkline.drawsparkline(sparkline1, cf_all_collisions_group);
  cfsparkline.drawsparkline(sparkline2, cf_injury_group);
  cfsparkline.drawsparkline(sparkline3, cf_fatal_group);
  cfsparkline.drawsparkline(sparkline4, cf_injures_group);
  cfsparkline.drawsparkline(sparkline5, cf_fatalities_group);
  cfsparkline.drawsparkline(sparkline6, cf_cyclists_group);
  cfsparkline.drawsparkline(sparkline7, cf_pedestrians_group);

  // Draw Line Charts
  cfsparkline.drawlinechart(lineChart0, sparkline1, cf_all_collisions_group);
  cfsparkline.drawlinechart(lineChart1, sparkline2, cf_injury_group);
  cfsparkline.drawlinechart(lineChart2, sparkline3, cf_fatal_group);

  // Render all DC objects
  dc.renderAll();
>>>>>>> master
}



//---------------------------------------------------------------------------------//
//                             CF DRAW SPARK LINE
//---------------------------------------------------------------------------------//
cfsparkline.drawsparkline = function(cf_sparkline, cf_group){
  log("Drawing Spark Line", "cfsparkline.drawsparkline");
  cf_sparkline
    .width(cfsparkline.width)
    .height(cfsparkline.height)
    .x(d3.time.scale().domain([parseDate(earliest_date), most_recent_date]))
    .margins({top:cfsparkline.top, right:cfsparkline.right, bottom:cfsparkline.bottom, left:cfsparkline.left})
    .dimension(cf_time_dim)
    .group(cf_group);
}



//---------------------------------------------------------------------------------//
//                             CF DRAW LINE CHART
//---------------------------------------------------------------------------------//
cfsparkline.drawlinechart = function(cf_linechart, cf_rangechart, cf_group){
  log("Drawing Line Chart", "cfsparkline.drawlinechart");
  cf_linechart
    .renderArea(true)
    .width(960)
    .height(120)
    .mouseZoomable(true)
    .x(d3.time.scale().domain(d3.extent(cfsparkline.dataset, function(d) { return d.ts;})))
    .margins({top: 10, right: 10, bottom: 20, left: 23})
    .xUnits(d3.time.week)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .title(cfsparkline.dataset,function(d){return d.label;}) // TODO: FIX THIS TITLE
    .brushOn(false)
    .dimension(cf_time_dim)
    .rangeChart(cf_rangechart)
    .group(cf_group);
}








