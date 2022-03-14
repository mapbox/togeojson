import fs from "fs";
import path from "path";
import { check } from "@placemarkio/check-geojson";
import * as tj from "../index";
import xmldom from "@xmldom/xmldom";

const d = "./test/data/";

describe("toGeoJSON", () => {
  // Loop through all files except hidden ones
  for (let file of fs.readdirSync(d).filter((item) => !item.startsWith("."))) {
    it(`${file}`, () => {
      const ext = path.extname(file).substring(1) as "kml" | "tcx" | "gpx";
      const dom = new xmldom.DOMParser().parseFromString(
        fs.readFileSync(path.join(d, file), "utf8")
      );
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
