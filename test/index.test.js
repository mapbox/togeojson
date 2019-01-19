import fs from "fs";
import path from "path";
import * as tj from "../index";
import xmldom from "xmldom";

const d = "./test/data/";

it("toGeoJSON", () => {
  for (let file of fs.readdirSync(d)) {
    expect(
      tj[path.extname(file).substring(1)](
        new xmldom.DOMParser().parseFromString(
          fs.readFileSync(path.join(d, file), "utf8")
        )
      )
    ).toMatchSnapshot();
  }
});
