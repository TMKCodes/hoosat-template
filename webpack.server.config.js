// webpack.server.config.js
import { resolve as _resolve } from "path";
import webpack from 'webpack';

export default (_env, argv) => {
  const mode = argv.mode || 'development';
  const isDevelopment = mode === 'development';
  const buildDir = isDevelopment ? 'build-dev' : 'build';
  return {
    devtool: "source-map",
    mode,
    target: "node22",
    entry: "./src/server/index.tsx",
    output: {
      filename: "server.js",
      path: _resolve(`./${buildDir}`),
      module: true,
      chunkFormat: "module",
      library: { type: "module" },
      publicPath: "/",
      // Must match webpack.client.config.js so server rendered asset URLs equal the client ones.
      assetModuleFilename: "assets/[contenthash][ext]",
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          // swc compiles TypeScript and JSX with the settings in .swcrc. It does not type check,
          // `npm run typecheck` (tsc) does that.
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["swc-loader"],
        },
        {
          test: /\.css$/i,
          use: ["css-loader"],
        },
        {
          // The client build emits these files, the server only needs their URLs.
          test: /\.(png|jpe?g|gif|avif|webp|svg|ico|otf|ttf|woff2?)$/i,
          type: 'asset/resource',
          generator: { emit: false },
        },
        {
          test: /\.node$/,
          loader: 'node-loader',
        },
      ],
    },
    resolve: {
      alias: {
        'mongodb-client-encryption': 'mongodb-client-encryption-browserify'
      },
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    ignoreWarnings: [
      /aws-crt/,
      /mongodb\/lib\/utils.js/,
      /mongodb\/lib\/deps.js/,
      // Optional native performance add-ons of ws.
      /Can't resolve '(bufferutil|utf-8-validate)'/,
    ],
    plugins: [
      new webpack.DefinePlugin({
        'global.GENTLY': false,
      }),
      new webpack.DefinePlugin({
        '__dirname': JSON.stringify(_resolve()),
        '__filename': JSON.stringify(_resolve('server.js')),
      }),
    ],
  }
};
