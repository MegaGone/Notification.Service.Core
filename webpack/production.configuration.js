const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  mode: "production",
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: {
    main: path.resolve(__dirname, "..", "src", "index.ts"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
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
