import fs from "fs";
import path from "path";
import * as tj from "../index";
import xmldom from "xmldom";
import { test } from "tap";

const d = "./test/data/";

test("toGeoJSON", t => {
  for (let file of fs.readdirSync(d)) {
    t.matchSnapshot(
      tj[path.extname(file).substring(1)](
        new xmldom.DOMParser().parseFromString(
          fs.readFileSync(path.join(d, file), "utf8")
        )
      ),
      file
    );
  }
  t.end();
});
