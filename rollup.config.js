import { terser } from "rollup-plugin-terser";

const input = "index.js";
const sourcemap = true;

export default [
  {
    input,
    output: {
      file: "dist/togeojson.es.js",
      format: "es",
      sourcemap
    }
  },
  {
    input,
    output: {
      file: "dist/togeojson.js",
      format: "cjs",
      sourcemap
    }
  },
  {
    input,
    output: {
      file: "dist/togeojsons.min.js",
      format: "umd",
      name: "toGeoJSON",
      sourcemap
    },
    plugins: [terser()]
  }
];
