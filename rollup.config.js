import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts"

const input = "./lib/index.ts";
const sourcemap = true;

export default [
  {
    input,
    output: {
      file: "dist/togeojson.es.js",
      format: "es",
      sourcemap,
    },
    plugins: [typescript()],
  },
  {
    input,
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
  {
    input,
    output: {
      file: "dist/togeojson.cjs",
      format: "cjs",
      sourcemap,
    },
    plugins: [typescript()],
  },
  {
    input,
    output: {
      file: "dist/togeojson.umd.js",
      format: "umd",
      name: "toGeoJSON",
      sourcemap,
    },
    plugins: [typescript(), terser()],
  },
];
