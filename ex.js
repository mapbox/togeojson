import { kmlWithFolders } from "./index.js";
import fs from "fs";
import { DOMParser } from "@xmldom/xmldom";

const dom = new DOMParser().parseFromString(
  fs.readFileSync("./test/data/inline_style.kml", "utf8"),
  "application/xml"
);

// console.log(JSON.stringify(kml(dom), null, 2));
console.log(JSON.stringify(kmlWithFolders(dom), null, 2));
