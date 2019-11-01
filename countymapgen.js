const fs = require("pn/fs");
const cheerio = require("cheerio");
const mapSVG = fs.readFileSync('./optimized.svg');
// console.log(mapSVG.toString());
const $ = cheerio.load(mapSVG.toString());
const svg2png = require("svg2png");
// const $ = load(tmpGeoData);
const countyData = require('./wi_counties.json');
const countiesArray = countyData.objects.cb_2018_us_county_5m.geometries;

function convert(source, dest) {
    fs.readFile(source)
        .then(svg2png)
        .then(buffer => fs.writeFile(dest, buffer))
        .catch(e => console.error(e));
    fs.unlink(source)
}

function renderMaps() {
    if (!fs.existsSync("wisconsin-maps")) {
        fs.mkdirSync("wisconsin-maps");
    }

    countiesArray.forEach((county) => {
        // Use jquery to select g wih the fips code and change its style
        // select counties from the svg
        $(`g#${county.properties.GEOID}`).addClass("highlighted");
        // gtags.unwrap();
        $.root();
        $('svg').addClass("height");
        $('svg').addClass("width");
        $('svg').attr({
            "height": 800,
            "width": 800
        });
        let countyMap = $('svg');
        const sourcePath = `./wisconsin-maps/wi-highlighted-${county.properties.GEOID}.svg`;
        const destPath = `./wisconsin-maps/wi-highlighted-${county.properties.GEOID}.png`;
        fs.writeFileSync(sourcePath, countyMap);
        convert(sourcePath, destPath);

        // reset for next map
        $(`g#${county.properties.GEOID}`).removeClass("highlighted");
    })
}

renderMaps();
