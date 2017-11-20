let path = require('path');
let webpack = require('webpack');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = env => {
    let production = env.production===true,
        platform = process.env.build ? process.env.build:'firefox';
    console.log('Production: ', production);
    console.log('Platform  : ', platform);

    let plugins = [
        new webpack.DefinePlugin(
            {
                'process.env': {
                    NODE_ENV: production ? '"production"':'"development"'
                }
            }
        ),
        new CopyWebpackPlugin(['src/platform/'+platform]),
        new ExtractTextPlugin('css/passwords.css'),
        new OptimizeCSSPlugin(
            {
                cssProcessorOptions: {
                    safe: true
                }
            }
        )
    ];

    if (env.production) {
        plugins.push(
            new UglifyJSPlugin(
                {
                    uglifyOptions: {
                        beautify: false,
                        ecma    : 6,
                        compress: true,
                        comments: false,
                        ascii   : true
                    },
                    cache        : true,
                    parallel     : true
                }
            )
        );
    }


    return {
        entry  : {
            app       : "./src/js/app.js",
            client    : "./src/js/client.js",
            background: "./src/js/background.js"
        },
        output : {
            path    : __dirname + '/dist/',
            filename: "./js/[name].js"
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
                                            options: {resources: path.resolve(__dirname, './src/scss/includes.scss')}
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
                        outputPath     : 'css/',
                        publicPath     : '/',
                        useRelativePath: false
                    }
                }
            ]
        },
        plugins: plugins
    };
};