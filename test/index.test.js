const glob = require("glob");
const fs = require("fs");
const tj = require("../");
const xmldom = require("xmldom");

it("KML", () => {
  glob.sync("test/data/*.kml").forEach(file => {
    expect(
      JSON.stringify(tj.kml(toDOM(fs.readFileSync(file))), null, 4)
    ).toMatchSnapshot();
  });
});

it("GPX", () => {
  glob.sync("test/data/*.gpx").forEach(file => {
    expect(tj.gpx(toDOM(fs.readFileSync(file, "utf8")))).toMatchSnapshot();
  });
});

function toDOM(_) {
  if (typeof DOMParser === "undefined") {
    return new xmldom.DOMParser().parseFromString(_.toString());
  } else {
    return new DOMParser().parseFromString(_, "text/xml");
  }
}
