import fs from "fs";
import path from "path";
import * as tj from "../index";
import xmldom from "xmldom";
import { test } from "tap";

const d = "./test/data/";

test("toGeoJSON", t => {
  // Loop through all files except hidden ones
  for (let file of fs.readdirSync(d).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))) {
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
