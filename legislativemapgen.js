const fs = require("pn/fs");
const cheerio = require("cheerio");
const mapSVG = fs.readFileSync('./optimized.svg');
const $ = cheerio.load(mapSVG.toString());
const svg2png = require("svg2png");
// const $ = load(tmpGeoData);
const hodData = require('./va_hod.json');
const senData = require('./va_sen.json');
const hodArray = hodData.objects.va_hod_v1.geometries;
const senArray = senData.objects.va_sen_v1.geometries;

function convert(source, dest) {
    fs.readFile(source)
        .then(svg2png)
        .then(buffer => fs.writeFile(dest, buffer))
        .catch(e => console.error(e));
    fs.unlink(source)
}

function renderMaps() {
    if (!fs.existsSync("va-maps")) {
        fs.mkdirSync("va-maps");
    }

    hodArray.forEach((hod) => {
        // Use jquery to select g wih the fips code and change its style
        // select counties from the svg
        $(`g#hod_district${hod.properties.district}`).addClass("highlighted");
        // gtags.unwrap();
        $.root();
        $('svg').addClass("height");
        $('svg').addClass("width");
        $('svg').attr({
            "height": 352,
            "width": 800
        });
        let map = $('svg');
        const sourcePath = `./va-maps/va-highlighted-Y_${hod.properties.district}.svg`;
        const destPath = `./va-maps/va-highlighted-Y_${hod.properties.district}.png`;
        fs.writeFileSync(sourcePath, map);
        convert(sourcePath, destPath);

        // reset for next map
        $(`g#hod_district${hod.properties.district}`).removeClass("highlighted");
    });

    senArray.forEach((sen) => {
        // Use jquery to select g wih the fips code and change its style
        // select counties from the svg
        $(`g#sen_district${sen.properties.district}`).addClass("highlighted");
        // gtags.unwrap();
        $.root();
        $('svg').addClass("height");
        $('svg').addClass("width");
        $('svg').attr({
            "height": 352,
            "width": 800
        });
        let map = $('svg');
        const sourcePath = `./va-maps/va-highlighted-Z_${sen.properties.district}.svg`;
        const destPath = `./va-maps/va-highlighted-Z_${sen.properties.district}.png`;
        fs.writeFileSync(sourcePath, map);
        convert(sourcePath, destPath);

        // reset for next map
        $(`g#sen_district${sen.properties.district}`).removeClass("highlighted");
    });
}

renderMaps();
