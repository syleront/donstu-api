import path from "path";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import del from "rollup-plugin-delete";
import typescript from "rollup-plugin-typescript2";
import externals from "rollup-plugin-node-externals";

const isProduction = process.env.PRODUCTION === "true";
const isTest = process.env.TEST_BUILD === "true";

let outputDir;
if (isProduction) {
  outputDir = "dist/package";
} else if (isTest) {
  outputDir = "dist/test";
} else {
  outputDir = "dist/debug";
}

export default {
  input: isTest ? "./tests/app.ts" : "./src/index.ts",
  plugins: [
    del({ targets: path.join(outputDir, "*") }),
    externals({ deps: true, devDeps: true }),
    resolve(),
    typescript(),
    commonjs(),
    json()
  ],
  output: [
    {
      strict: false,
      file: path.join(outputDir, "index.js"),
      format: "cjs",
      sourcemap: !isProduction
    }
  ]
};
