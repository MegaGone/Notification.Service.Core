const path = require("path");
const NodemonPlugin = require("nodemon-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  mode: "development",
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: {
    main: path.resolve(__dirname, "..", "src", "index.ts"),
  },
  plugins: [
    new NodemonPlugin({
      script: path.resolve(__dirname, "..", "dist", "main.js"),
      watch: path.resolve(__dirname, "..", "dist"),
      ignore: ["*.js.map"],
      verbose: true,
    }),
  ],
  devtool: "inline-source-map",
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 500,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "..", "tsconfig.json"),
      }),
    ],
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "[name].js",
  },
};
