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
var max_attributes = 7;

var attribute_selection1 = "1";
var attribute_selection2 = "2";
var attribute_selection3 = "3";

var attribute = {"1" : {sparkline : null, group : null},
                 "2" : {sparkline : null, group : null},
                 "3" : {sparkline : null, group : null},
                 "4" : {sparkline : null, group : null},
                 "5" : {sparkline : null, group : null},
                 "6" : {sparkline : null, group : null},
                 "7" : {sparkline : null, group : null}}





var barchart = {
  dataset: null,
  draw: null,
  margin: null,
  top: 20,
  right: 20,
  bottom: 30,
  left: 40,
  height: null,
  width: null,
  tickcount: 4,
  calculatePercentages: null,
  p_week: null,
  p_28day: null,
  p_1year: null,
  p_2year: null,
  attribute: 'all_collisions',
}

barchart.margin = {top: barchart.top, right: barchart.right, bottom: barchart.bottom, left: barchart.left};
barchart.width = 480 - barchart.margin.left - barchart.margin.right;
barchart.height = 230 - barchart.margin.top - barchart.margin.bottom;


//---------------------------------------------------------------------------------//
//                          FUNCTION LOG TO CONSOLE
//---------------------------------------------------------------------------------//
var logging = true;
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

  if(logging == true) console.log(message);
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

  addBold(attribute_selection1);
  addBold(attribute_selection2);
  addBold(attribute_selection3);
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

    // Remove the bold
    removeBold(attribute_selection1);

    attribute_selection1 = $("#select_attribute_0").val();
    cfsparkline.drawlinechart(lineChart0, attribute[attribute_selection1].sparkline, attribute[attribute_selection1].group);
    dc.renderAll();
    
    // Add the bold
    addBold(attribute_selection1);
  });

  $( "#select_attribute_1" ).change(function(){
    // Remove the bold
    removeBold(attribute_selection2);

    attribute_selection2 = $("#select_attribute_1").val();
    cfsparkline.drawlinechart(lineChart1, attribute[attribute_selection2].sparkline, attribute[attribute_selection2].group);
    dc.renderAll();

    // Add the bold
    addBold(attribute_selection2);
  });


  $( "#select_attribute_2" ).change(function(){
    // Remove the bold
    removeBold(attribute_selection3);

    attribute_selection3 = $("#select_attribute_2").val();
    cfsparkline.drawlinechart(lineChart2, attribute[attribute_selection3].sparkline, attribute[attribute_selection3].group);
    dc.renderAll();

    // Remove the bold
    addBold(attribute_selection3);
  });

  $( "#select_attribute_3" ).change(function(){
    barchart.attribute = $("#select_attribute_3").val();
    log("Selected Attribute: " + barchart.attribute, "initAttributesSelect");

    barchart.draw("#barchart1");
  });
}

// Add/Remove bold when item is selected
function removeBold(n){ $("#clickgroup" + n.toString()).removeClass("attribute_selected");}
function    addBold(n){ $("#clickgroup" + n.toString()).addClass("attribute_selected");}








//---------------------------------------------------------------------------------//
//                                  CF DATES LOAD CSV
//---------------------------------------------------------------------------------//
cfdates.loadCSV = function(filename){

  log("Loading Dates CSV.", "cfdates.loadCSV" + ": " + filename);
  
  cfdates.dataset = [];
  
  d3.csv(filename,
    function(error, data) {            
        data.forEach(function(d,i)
        {
          cfdates.dataset.push({
            all_collisions:       +d.all_collisions,
            injury_collisions:    +d.injures,
            fatal_collisions:     +d.fatalities,
            injures:              +d.injury_collisions, // wrong field name
            fatalities:           +d.fatal_collisions,  // wrong field name
            cyclists_involved:    +d.cyclists_involved,
            pedestrians_involved: +d.pedestrians_involved,
            year:                 +d.year,
            week:                 +d.week,
            row_number:           +d.row_number,
            label:                d.label,
            index:                +d.index,
            date:                 parseDate(d.label.slice(19,30)),
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
          d.last_day             = d.label.substr(19,29);
          d.ts                    = formatDate.parse( d.first_day );
          d.ts2                   = formatDate.parse( d.last_day );
          d.year                  = +d.year;
          d.week                  = +d.week;
          d.index                 = +d.index;
          d.label                 =  d.label;
          d.date                  =  parseDate(d.label.slice(19,30));
          d.all_collisions        = +d.all_collisions;
          d.injury_collisions     = +d.injury_collisions;
          d.fatal_collisions      = +d.fatal_collisions;
          d.injures               = +d.injures;
          d.fatalities              = +d.fatalities;
          d.cyclists_involved       = +d.cyclists_involved;
          d.pedestrians_involved    = +d.pedestrians_involved;
        });

                
        cfsparkline.init();

        barchart.draw("#barchart1");
    });
}





//---------------------------------------------------------------------------------//
//                                  CF INIT
//---------------------------------------------------------------------------------//
cfsparkline.init = function(){

  // cross-filtering
  cf = crossfilter(cfsparkline.dataset);
  cf_time_dim = cf.dimension( function(d){ return d.ts2 } );

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

  // ts2 is the last day of the week ts is the first
  most_recent_date = cfsparkline.dataset[selected_index].ts2;

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
  cfsparkline.drawlinechart(lineChart0, attribute[attribute_selection1].sparkline, attribute[attribute_selection1].group);
  cfsparkline.drawlinechart(lineChart1, attribute[attribute_selection2].sparkline, attribute[attribute_selection2].group);
  cfsparkline.drawlinechart(lineChart2, attribute[attribute_selection3].sparkline, attribute[attribute_selection3].group);

  // Render all DC objects
  dc.renderAll();
}



//---------------------------------------------------------------------------------//
//                             CF DRAW SPARK LINE
//---------------------------------------------------------------------------------//
cfsparkline.drawsparkline = function(cf_sparkline, cf_group){
  // log("Drawing Spark Line", "cfsparkline.drawsparkline");
  cf_sparkline
    .width(cfsparkline.width)
    .height(cfsparkline.height)
    .x(d3.time.scale().domain([parseDate(earliest_date), most_recent_date]))
    .margins({top:cfsparkline.top, right:cfsparkline.right, bottom:cfsparkline.bottom, left:cfsparkline.left})
    .dimension(cf_time_dim)
    .group(cf_group)
    
}



//---------------------------------------------------------------------------------//
//                             CF DRAW LINE CHART
//---------------------------------------------------------------------------------//
cfsparkline.drawlinechart = function(cf_linechart, cf_rangechart, cf_group){
  // log("Drawing Line Chart", "cfsparkline.drawlinechart");
  var datelabel = d3.time.format("%a %e %b");
  cf_linechart
    .width(960)
    .height(120)
    .margins({top: 10, right: 10, bottom: 20, left: 23})
    .dimension(cf_time_dim)
    .group(cf_group)
    .transitionDuration(500)
    .brushOn(false)
    .xUnits(d3.time.week)
    .renderArea(true)
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)    
    .brushOn(false)
    .dimension(cf_time_dim)
    .title(function(d){return d.label;})
    .rangeChart(cf_rangechart)
    .title(function(d){
      return datelabel(d.data.key)
      + "\nNumber of Incidents: " + d.data.value;
      })
    .elasticY(true)
    .x(d3.time.scale().domain(d3.extent(cfsparkline.dataset, function(d) { return d.ts2;})))
    //.x(d3.time.scale().domain([new Date(2012, 06, 01), new Date(2015, 04, 19)]))
    .xAxis();
}




barchart.draw = function(id){

  log("Drawing Bar Chart.", "barchart.draw");

  barchart.calculatePercentages(barchart.attribute);

  //Define tooltip for hover-over info windows
  var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);


var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, barchart.width], .1, .1);

var y = d3.scale.linear()
    .range([barchart.height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(barchart.tickcount)
    .tickFormat(formatPercent);

  // Remove the existing svg then draw
  d3.select(id).select("svg").remove();

  // Redraw the svg
  var svg = d3.select(id).append("svg")
    .attr("width", barchart.width + barchart.margin.left + barchart.margin.right)
    .attr("height", barchart.height + barchart.margin.top + barchart.margin.bottom)
  .append("g")
    .attr("transform", "translate(" + barchart.margin.left + "," + barchart.margin.top + ")");

  x.domain(barchart.dataset.map(function(d) { return d.range; }));
  y.domain([-d3.max(barchart.dataset, function(d) { return Math.abs(d.percent); }), d3.max(barchart.dataset, function(d) { return Math.abs(d.percent); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + barchart.height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // .text("Collisions");

  svg.selectAll(".bar")
      .data(barchart.dataset)
    .enter().append("rect")
      .attr("class", function(d){return d.percent < 0 ? "bar_negative" : "bar_positive";})
      .attr({
          x: function(d){
            return x(d.range);
          },
          y: function(d){
            return y(Math.max(0, d.percent)); 
          },
          width: x.rangeBand(),
          height: function(d){
            return Math.abs(y(d.percent) - y(0)); 
          }
        })
      .on('mouseover', function(d){
              d3.select(this)
                  .style("opacity", 0.5)
          
          var info = div
                  .style("opacity", 1)
                  .style("left", (d3.event.pageX-100) + "px")
                  .style("top", (d3.event.pageY-100) + "px")
                  .text(d.range);

              info.append("p")
                  .text(formatPercent(d.percent));
          
            })
                .on('mouseout', function(d){
                  d3.select(this)
              .style({'stroke-opacity':0.5})
              .style("opacity",1);

              div
                  .style("opacity", 0);
                });

}






barchart.calculatePercentages = function(attribute){
  
  var past, present;

  // Check to see if the time range goes back 1 week
  if( (selected_index - 1) >= 0 ){
    past    = parseInt(cfsparkline.dataset[selected_index-1][attribute]);
    present = parseInt(cfsparkline.dataset[selected_index][attribute]);
    // Check for divide by 0
    barchart.p_week = (past == 0 ? 0 : (present - past) / past);
  }
  else{
    barchart.p_week = 0;
  }

  // Check to see if the time range goes back 1 week
  if( (selected_index - 4) >= 0 ){
    past    = parseInt(cfsparkline.dataset[selected_index-4][attribute]);
    present = parseInt(cfsparkline.dataset[selected_index][attribute]);
    barchart.p_28day = (past == 0 ? 0 : (present - past) / past);
  }
  else{
    barchart.p_28day = 0;
  }

  // Check to see if the time range goes back 1 week
  if( (selected_index - 52) >= 0 ){
    past    = parseInt(cfsparkline.dataset[selected_index-52][attribute]);
    present = parseInt(cfsparkline.dataset[selected_index][attribute]);
    barchart.p_1year = (past == 0 ? 0 : (present - past) / past);
  }
  else{
    barchart.p_1year = 0;
  }

  // Check to see if the time range goes back 1 week
  if( (selected_index - 104) >= 0 ){
    past    = parseInt(cfsparkline.dataset[selected_index-104][attribute]);
    present = parseInt(cfsparkline.dataset[selected_index][attribute]);
    barchart.p_2year = (past == 0 ? 0 : (present - past) / past);
  }
  else{
    barchart.p_2year = 0;
  }

  barchart.dataset = [  {range: 'Week', percent: barchart.p_week},
                        {range: '28 Days',       percent: barchart.p_28day},
                        {range: '1 Year',       percent: barchart.p_1year},
                        {range: '2 Years',       percent: barchart.p_2year}];

  // console.log(barchart.p_week, barchart.p_28day, barchart.p_1year, barchart.p_2year);
}
