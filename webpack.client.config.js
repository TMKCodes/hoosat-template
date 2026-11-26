// webpack.client.config.js
import { resolve as _resolve } from "path";
import TerserPlugin from 'terser-webpack-plugin';

export default (_env, argv) => {
  const mode = argv.mode || 'development';
  const isDevelopment = mode === 'development';
  const buildDir = isDevelopment ? 'build-dev' : 'build';
  return {
    devtool: "source-map",
    mode,
    target: "web",
    entry: './src/client/index.tsx',
    output: {
      filename: "bundle.[contenthash].js",
      path: _resolve(`./${buildDir}/public`),
      publicPath: "/",
      // Must match webpack.server.config.js so server rendered asset URLs equal the client ones.
      assetModuleFilename: "assets/[contenthash][ext]",
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|avif|webp|svg|ico|otf|ttf|woff2?)$/i,
          type: 'asset/resource',
        },
        {
          // swc compiles TypeScript and JSX with the settings in .swcrc. It does not type check,
          // `npm run typecheck` (tsc) does that.
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["swc-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    optimization: {
      emitOnErrors: false,
      moduleIds: 'deterministic',
      minimize: !isDevelopment,
      minimizer: [new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            // Enable aggressive minification options
            defaults: true,
            arrows: true,
            arguments: true,
            module: true,
            unused: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            loops: true,
            passes: 5,
          },
        },
      })],
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        maxSize: 1000000,
        minChunks: 1,
        maxAsyncRequests: 15,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      usedExports: true,
    }
  }
};
