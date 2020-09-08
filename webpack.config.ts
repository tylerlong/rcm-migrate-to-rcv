/* eslint-disable node/no-unpublished-import */
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import dotenv from 'dotenv-override-true';
import {DefinePlugin} from 'webpack';

type ConfigOptions = {
  fileName: string;
  pageTitle: string;
  entryFile: string;
};

const createConfig = (configOptions: ConfigOptions) => {
  return {
    mode: 'development',
    devtool: 'source-map',
    entry: configOptions.entryFile,
    output: {
      path: path.resolve(__dirname, 'docs'),
      filename: `${configOptions.fileName}.js`,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: configOptions.pageTitle,
        filename: `${configOptions.fileName}.html`,
      }),
      new DefinePlugin({
        'process.env': JSON.stringify(dotenv.config().parsed),
      }),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
  };
};

const mainConfig = createConfig({
  fileName: 'index',
  pageTitle: 'RCM to RCV migration tool',
  entryFile: './src/index.tsx',
});

const microsoftConfig = createConfig({
  fileName: 'microsoft',
  pageTitle: 'Authorize to access Microsoft',
  entryFile: './src/microsoft/index.tsx',
});

const ringcentralConfig = createConfig({
  fileName: 'ringcentral',
  pageTitle: 'Authorize to access RingCentral',
  entryFile: './src/ringcentral/index.tsx',
});

export default [mainConfig, microsoftConfig, ringcentralConfig];
