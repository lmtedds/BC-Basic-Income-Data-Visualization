const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const LicenseWebpackPlugin = require("license-webpack-plugin").LicenseWebpackPlugin;
const TerserPlugin = require("terser-webpack-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const glob = require("glob-all");

const websiteConfig = (env, argv) => {
  const devMode = argv.mode !== "production";
  const PATHS = {
    src: path.resolve(__dirname, "src")
  };

  return   {
    target: "web",
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 0
      },
      minimizer: [
        new TerserPlugin({
          cache: devMode,
          parallel: true,
          sourceMap: true, // Must be set to true if using source-maps in production
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            output: {
              comments: false // Take out all comments. Licenses are already preserved with plugin.
            }
          }
        }),
      ]
    },
    entry: {
      "app": "./src/main.tsx",
    },
    output: {
      filename: "[name].[chunkhash].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/" // This should make script and link paths absolute which will allow full depth links.
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      plugins: [new TsconfigPathsPlugin({ /*configFile: "./path/to/tsconfig.json" */ })]
    },
    module: {
      rules: [
        { 
          test: /.tsx?$/, 
          loader: "ts-loader" 
        },
        { 
          test: /\.js$/, 
          use: ["source-map-loader"], 
          enforce: "pre" 
        },
        { 
          test: /\.scss$/, 
          use: [
                  devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                  "css-loader",
                  "sass-loader"
               ]
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: true }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif)$/, // Bundle small graphics files inline
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 1000
              }
            }
          ]
        }
      ]
    },
    devServer: {
      open: true,
      historyApiFallback: {
        index: "/index.html",
      },
      port: 8080,
    },
    devtool: "source-map",
    plugins: [
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, "index.html"),
        filename: path.resolve(__dirname, "dist", "index.html"),

        //favicon: "public/img/favicon.ico",

        minify: devMode ? false : {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyJS: true
        }
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[chunkhash].css",
        chunkFilename: "[id].[chunkhash].css"
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorPluginOptions: {
          preset: [
            "default", 
            { 
              discardComments: { removeAll: true }
            },
          ],
        },
        canPrint: true
      }),
      // new PurgecssPlugin({
      //   paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
      //   whitelist: ["body", "html", "show", "active"]
      // }),
      new LicenseWebpackPlugin({
        perChunkOutput: false
      }),
      new webpack.DefinePlugin({
        DEVELOPMENT: devMode
      })
    ]
  };
};

module.exports = (env, argv) => {
  return websiteConfig(env, argv);
};