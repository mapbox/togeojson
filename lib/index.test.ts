import fs from "fs";
import path from "path";
import { check } from "@placemarkio/check-geojson";
import * as tj from "./index";
import xmldom from "@xmldom/xmldom";

const d = "./test/data/";

function parse(file: string) {
  return new xmldom.DOMParser().parseFromString(fs.readFileSync(file, "utf8"));
}

describe("toGeoJSON", () => {
  // Loop through all files except hidden ones
  for (const file of fs
    .readdirSync(d)
    .filter((item) => !item.startsWith("."))) {
    it(`${file}`, () => {
      const ext = path.extname(file).substring(1) as "kml" | "tcx" | "gpx";
      const dom = parse(path.join(d, file));
      const res = tj[ext](dom);
      expect(res).toMatchSnapshot();
      expect(() => {
        check(JSON.stringify(res));
      }).not.toThrow();

      if (ext === "kml") {
        expect(tj.kmlWithFolders(dom)).toMatchSnapshot();
      }
    });
  }
});

describe("mini cases", () => {
  it("folder nesting", () => {
    expect(tj.kmlWithFolders(parse(path.join(d, "inline_style_mini.kml"))))
      .toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "geometry": Object {
                  "coordinates": Array [
                    Array [
                      2.3101624,
                      48.7301875,
                    ],
                    Array [
                      2.3098714,
                      48.7300247,
                    ],
                    Array [
                      2.3098051,
                      48.7299542,
                    ],
                  ],
                  "type": "LineString",
                },
                "properties": Object {
                  "name": "With all inline styles",
                  "stroke": "#ff0000",
                  "stroke-opacity": 1,
                  "stroke-width": 3,
                },
                "type": "Feature",
              },
            ],
            "meta": Object {
              "name": "Inline style test",
            },
            "type": "folder",
          },
        ],
        "type": "root",
      }
    `);
  });
});
