import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import externals from "rollup-plugin-node-externals";

const isProduction = process.env.PRODUCTION === "true";

export default {
  input: isProduction ? "./src/index.js" : "./app.js",
  plugins: [
    externals({ deps: true }),
    resolve({
      jsnext: true
    }),
    commonjs(),
    json()
  ],
  output: [
    {
      strict: false,
      file: isProduction ? "dist/package/index.js" : "dist/debug/index.js",
      format: "cjs",
      sourcemap: isProduction ? false : true
    }
  ]
};
