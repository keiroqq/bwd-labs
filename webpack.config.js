const path = require("path"); // Импортируем модуль "path" для работы с путями файлов
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./src/index.js", // Точка входа для сборки проекта

  output: {
    filename: "bundle.js", // Имя выходного файла сборки
    path: path.resolve(__dirname, "dist"), // Путь для выходного файла сборки
  },

  devServer: {
    liveReload: true,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    open: true,
    liveReload: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			inject: true,
			chunks: ['index'],
			filename: 'index.html'
		}),
		new HtmlWebpackPlugin({
			template: './src/tasks.html',
			inject: true,
			chunks: ['index'],
			filename: 'tasks.html'
		}),
		new HtmlWebpackPlugin({
			template: './src/error.html',
			inject: true,
			chunks: ['index'],
			filename: 'error.html'
		}),
		new HtmlWebpackPlugin({
			template: './src/about.html',
			inject: true,
			chunks: ['index'],
			filename: 'about.html'
		}),
		new CopyWebpackPlugin({
			patterns: [
			{ from: './src/scripts/jquery-3.7.1.slim.min.js', to: './scripts/jquery-3.7.1.slim.min.js' }, // Копируем jQuery
			{ from: './src/scripts/menu.js', to: './scripts/menu.js' }, // Копируем menu.js
			{ from: './src/scripts/modal.js', to: './scripts/modal.js' }, // Копируем modal.js
			{ from: './src/images/', to: './images/' } // Копируем все изображения из папки src/images
      ],
    }),
	],

  mode: "development", // Режим сборки
};