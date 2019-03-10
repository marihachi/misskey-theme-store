const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
	mode: 'development',
	entry: path.resolve(__dirname, './src/entry.ts'),
	output: {
		path: path.resolve(__dirname, '../built/client/scripts'),
		filename: 'mts.js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: { appendTsSuffixTo: [/\.vue$/] }
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
