// this script was used by a makefile to combine district data into
// one SVG, which was then used as a template for other SVGs.
const fs = require("fs");
const d3 = require("d3");
const topojson = require("topojson");
let JSDOM = require("jsdom").JSDOM;

const [
  HOD,
  SEN,
  STATE_OUTLINE,
  OUTPUT_FILE,
  STATE,
  STATE_FIPS
] = process.argv.slice(2);
const hod = fs.readFileSync(HOD).toString();
const sen = fs.readFileSync(SEN).toString();
const stateOutline = fs.readFileSync(STATE_OUTLINE).toString();

const keyFunction = c => {
  return c && c.properties.GEOID ? c.properties.GEOID : `${STATE}-gov-`;
};

function renderSVG() {
  // JSDOM lets us fake a dom target, with some caveots.
  const window = new JSDOM(`<html><head></head><body></body></html>`, {
    pretendToBeVisual: true
  }).window;

  // we need to know the height and width so we can calculate the translation and scale
  let width = 800,
    height = 0;

  window.d3 = d3.select(window.document);

  // albers = decent for US
  // mercator = decent for single states
  let projection = d3.geoMercator();
  let path = d3.geoPath(projection);
  let hod_source_shapes = JSON.parse(hod);
  let sen_source_shapes = JSON.parse(sen);
  let state_source_shapes = JSON.parse(stateOutline);

  // reset the scale to 1, and move to 0,0
  projection.scale(1).translate([0, 0]);

  let hod_topo_shapes = topojson.feature(
    hod_source_shapes,
    hod_source_shapes.objects["va_hod_v1"]
  );

  let sen_topo_shapes = topojson.feature(
    sen_source_shapes,
    sen_source_shapes.objects["va_sen_v1"]
  );

  let state_topo_shapes = topojson.feature(
    state_source_shapes,
    state_source_shapes.objects["va_sen_v1"]
  );

  let bounds = path.bounds(state_topo_shapes);
  let heightRatio =
    (bounds[1][1] - bounds[0][1]) / (bounds[1][0] - bounds[0][0]);
  height = Math.floor(width * heightRatio);

  let svg = window.d3
    .select("body")
    .append("div")
    .append("svg")
    // default is the full view box
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("xmlns", "http://www.w3.org/2000/svg");

  projection.fitExtent([[0, 0], [width, height]], state_topo_shapes);

  svg
    // .select("body")
    .append("style")
    .text(`.county{ fill: #D5D5D5;
      stroke: #666766;
      stroke-width: 1px;
      fill-opacity: 0.8;
      stroke-opacity: 0.6
    }
    .state{
      fill: #dddddd;
      stroke: none;
    }
    
    .hod{ 
      fill: none;
      stroke: none;
    }
    .sen{ 
      fill: none;
      stroke: none;
    }
      
    .citylabel {
      fill: #000;
      stroke: #E9E9E9;
      stroke-width: 2px;
      font-size: 0.875em;
      font-family: Franklin, arial, sans-serif;
      pointer-events: none;
      paint-order: stroke;      
    }
    
    .city {
      fill: #2A2A2A;
      stroke: #FFFFFF;
      stroke-width: 1px;
      pointer-events: none;
    }
    .highlighted {
      fill: black;
      stroke: black;
      stroke-width: 1.5px;
    }
    .capital {
      stroke-width: 1.5px;
      fill: #2A2A2A;
      stroke: #FFFFFF;
    }
    .population {
      opacity: 0.65;
    }
    `);

  svg
    .selectAll("g.basemap.state")
    .data(state_topo_shapes.features)
    .enter()
    .append("g")
    .attr("class", "state")
    // new data = make a new path
    .append("path")
    // d = the path data
    .attr("d", d => path(d));

  svg
    .selectAll("g.basemap.hod")
    .data(hod_topo_shapes.features)
    .enter()
    .append("g")
    // set the class on the group so we get a nice
    .attr("class", "hod")
    .attr("id", d => `hod_district${d.properties.district}`)
    // new data = make a new path
    .append("path")
    // d = the path data
    .attr("d", d => path(d));

  svg
    .selectAll("g.basemap.sen")
    .data(sen_topo_shapes.features)
    .enter()
    .append("g")
    .attr("class", "sen")
    .attr("id", d => `sen_district${d.properties.district}`)
    // new data = make a new path
    .append("path")
    // d = the path data
    .attr("d", d => path(d));

  let data = window.d3.select("div").html();

  fs.writeFileSync(`./${OUTPUT_FILE}`, data);
}

renderSVG();
