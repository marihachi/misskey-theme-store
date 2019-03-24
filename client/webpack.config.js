const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, './src/entry.ts'),
	output: {
		path: path.resolve(__dirname, '../built/client/scripts'),
		filename: 'mts.js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: [
					{ loader: 'vue-loader' }
				]
			},
			{
				test: /\.scss$/,
				use: [
					{ loader: 'vue-style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'sass-loader' }
				]
			},
			{
				test: /\.ts$/,
				use: [
					{ loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } }
				]
			},
			{
				test: /\.css/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader', options: { url: false } }
				]
			},
		]
	},
	resolve: {
		extensions: ['.ts', '.js', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		}
	},
	plugins: [
		new VueLoaderPlugin()
	]
}
