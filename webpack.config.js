let path = require('path');
let webpack = require('webpack');
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry  : "./src/js/main.js",
    output : {
        path    : __dirname,
        filename: "./dist/js/passwords.js"
    },
    resolve: {
        modules   : ['node_modules', 'src'],
        extensions: ['.js', '.vue', '.json'],
        alias     : {
            'vue$': 'vue/dist/vue.esm.js',
            '@vue': path.join(__dirname, 'src/vue'),
            '@js' : path.join(__dirname, 'src/js')
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
                                        options: {resources: path.resolve(__dirname, './src/scss/_variables.scss')}
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
                    outputPath     : 'dist/css/',
                    publicPath     : './',
                    useRelativePath: true
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('./dist/css/passwords.css'),
        new OptimizeCSSPlugin(
            {
                cssProcessorOptions: {
                    safe: true
                }
            }
        ),
        new UglifyJSPlugin(
            {
                uglifyOptions: {
                    beautify: false,
                    ecma    : 6,
                    compress: true,
                    comments: false
                },
                cache: true,
                parallel: true
            }
        )
    ]
};