let webpack              = require('webpack'),
    config               = require('./package.json'),
    CopyWebpackPlugin    = require('copy-webpack-plugin'),
    {CleanWebpackPlugin} = require('clean-webpack-plugin'),
    VueLoaderPlugin      = require('vue-loader/lib/plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    OptimizeCSSPlugin    = require('optimize-css-assets-webpack-plugin');

module.exports = env => {
    let production = env.production === true,
        platform   = env.platform ? env.platform:'firefox';
    console.log('Production: ', production);
    console.log('Platform  : ', platform);

    let plugins = [
        new webpack.DefinePlugin(
            {
                'process.env': {
                    NODE_ENV    : production ? '"production"':'"development"',
                    APP_VERSION : `"${config.version}"`,
                    APP_NAME    : '"extension"',
                    APP_PLATFORM: `"${platform}"`,
                    BUILD_TARGET: `"${platform}"`
                }
            }
        ),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin(['src/platform/' + platform]),
        new MiniCssExtractPlugin({filename: 'css/[name].css'}),
        new CleanWebpackPlugin(
            {
                cleanStaleWebpackAssets: false,
                cleanOnceBeforeBuildPatterns: ['**/*'],
                cleanAfterEveryBuildPatterns: ['js/Platform', 'scss']
            }
        )
    ];

    if(env.production) {
        plugins.push(
            new OptimizeCSSPlugin({cssProcessorOptions: {safe: true}})
        );
    }

    let platformDir = platform === 'firefox' ? `${__dirname}/src/js/Platform`:`${__dirname}/src/platform/${platform}/js/Platform`;
    return {
        mode   : production ? 'production':'development',
        devtool: 'none',
        entry  : {
            client    : `${__dirname}/src/js/client.js`,
            popup     : `${__dirname}/src/js/popup.js`,
            options   : `${__dirname}/src/js/options.js`,
            background: `${__dirname}/src/js/background.js`
        },
        output : {
            path         : `${__dirname}/build/`,
            filename     : 'js/[name].js',
            chunkFilename: 'js/[name].[hash].js'
        },
        resolve: {
            modules   : ['node_modules', 'src'],
            extensions: ['.js', '.vue', '.json'],
            alias     : {
                'vue$'        : 'vue/dist/vue.esm.js',
                '@vue'        : `${__dirname}/src/vue`,
                '@js/Platform': platformDir,
                '@js'         : `${__dirname}/src/js`
            }
        },
        module : {
            rules: [
                {
                    test  : /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test   : /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    loader : 'url-loader',
                    options: {
                        limit          : 256,
                        outputPath     : 'css/',
                        publicPath     : '/css/',
                        useRelativePath: false
                    }
                },
                {
                    test: /\.scss$/,
                    use : [
                        {loader: 'vue-style-loader'},
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader : 'sass-loader',
                            options: {
                                sassOptions: {
                                    outputStyle: 'compressed'
                                }
                            }
                        },
                        {
                            loader : 'sass-resources-loader',
                            options: {
                                sourceMap: true,
                                resources: [
                                    `${__dirname}/src/scss/includes.scss`,
                                    `${__dirname}/src/platform/${platform}/scss/browser.scss`
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        plugins
    };
};