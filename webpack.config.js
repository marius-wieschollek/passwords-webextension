let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry  : "./js/main.js",
    output : {
        path    : __dirname,
        filename: "./js/passwords.js"
    },
    resolve: {
        modules   : ['node_modules', 'src'],
        extensions: ['.js', '.vue', '.json'],
        alias     : {
            'vue$': 'vue/dist/vue.esm.js',
            '@vue': path.join(__dirname, 'vue'),
            '@js' : path.join(__dirname, 'js'),
            '@vc' : path.join(__dirname, 'js/Components')
        }
    },
    module : {
        loaders: [
            {
                test   : /\.vue$/,
                loader : 'vue-loader',
                options: {
                    extractCSS: true,
                    loaders   : {
                        scss: ExtractTextPlugin.extract(
                            {
                                use     : [
                                    {
                                        loader : 'css-loader',
                                        options: {minimize: true, sourceMap: false}
                                    }, {
                                        loader : 'sass-loader',
                                        options: {minimize: true, sourceMap: false}
                                    }, {
                                        loader : 'sass-resources-loader',
                                        options: {resources: path.resolve(__dirname, './css/_variables.scss')}
                                    }
                                ],
                                fallback: 'vue-style-loader'
                            }
                        )
                    }
                }
            },
            {
                test   : /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader : 'url-loader',
                options: {
                    limit          : 2048,
                    outputPath     : 'css/static/',
                    publicPath     : '../../',
                    useRelativePath: false
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('./css/passwords.css'),
        new OptimizeCSSPlugin(
            {
                cssProcessorOptions: {
                    safe: true
                }
            }
        )
    ]
};