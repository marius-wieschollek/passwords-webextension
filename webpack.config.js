let webpack              = require('webpack'),
    config               = require('./package.json'),
    CopyWebpackPlugin    = require('copy-webpack-plugin'),
    {CleanWebpackPlugin} = require('clean-webpack-plugin'),
    VueLoaderPlugin      = require('vue-loader/lib/plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    CssMinimizerPlugin   = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
    let production = argv.mode === 'production',
        platform   = env.platform ? env.platform:'firefox';
    console.log('Production: ', production);
    console.log('Platform  : ', platform);


    let replaceVersion = (content) => {
        return content.toString('utf8').replaceAll('X.X.X', config.version);
    };

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
        new CopyWebpackPlugin(
            {
                patterns: [
                    {from: `${__dirname}/src/platform/generic`, to: `${__dirname}/build`},
                    {from: `${__dirname}/src/platform/${platform}`, to: `${__dirname}/build`, transform: replaceVersion}
                ]
            }
        ),
        new MiniCssExtractPlugin({filename: 'css/[name].css'}),
        new CleanWebpackPlugin(
            {
                cleanStaleWebpackAssets     : false,
                cleanOnceBeforeBuildPatterns: ['**/*'],
                cleanAfterEveryBuildPatterns: ['js/Platform', 'scss']
            }
        )
    ];

    let jsPlatformDir = platform !== 'chrome' ? `${__dirname}/src/js/Platform`:`${__dirname}/src/platform/${platform}/js/Platform`;
    return {
        mode        : production ? 'production':'development',
        devtool     : production ? false:'source-map',
        entry       : {
            client    : {
                publicPath: '/',
                import    : `${__dirname}/src/js/client.js`,
                runtime   : false
            },
            popup     : `${__dirname}/src/js/popup.js`,
            options   : `${__dirname}/src/js/options.js`,
            preview   : `${__dirname}/src/js/preview.js`,
            passlink  : `${__dirname}/src/js/passlink.js`,
            background: `${__dirname}/src/js/background.js`
        },
        output      : {
            path         : `${__dirname}/build/`,
            filename     : 'js/[name].js',
            chunkFilename: production ? 'js/[name].js':'js/[name].[hash].js'
        },
        optimization: {
            minimize : production,
            minimizer: [
                `...`,
                new CssMinimizerPlugin(
                    {
                        parallel: true
                    }
                )
            ]
        },
        resolve     : {
            modules   : ['node_modules', 'src'],
            extensions: ['.js', '.vue', '.json'],
            fallback  : {
                path  : false,
                crypto: false
            },
            alias     : {
                'vue$'        : 'vue/dist/vue.esm.js',
                '@'           : `${__dirname}/src`,
                '@vue'        : `${__dirname}/src/vue`,
                '@js/Platform': jsPlatformDir,
                '@js'         : `${__dirname}/src/js`,
                '@scss'       : `${__dirname}/src/scss`,
                '@scssP'      : `${__dirname}/src/platform/${platform}/scss`
            }
        },
        module      : {
            rules: [
                {
                    test  : /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.s?css$/,
                    use : [
                        {loader: 'vue-style-loader'},
                        {
                            loader : MiniCssExtractPlugin.loader,
                            options: {
                                esModule: true
                            }
                        },
                        {
                            loader : 'css-loader',
                            options: {
                                esModule: true,
                                modules : 'global'
                            }
                        },
                        {
                            loader : 'sass-loader',
                            options: {
                                sassOptions: {
                                    sourceMap  : !production,
                                    outputStyle: production ? 'compressed':null
                                }
                            }
                        }
                    ]
                },
                {
                    test     : /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    type     : 'asset',
                    generator: {
                        filename: 'css/[contenthash][ext][query]'
                    }
                }
            ]
        },
        plugins
    };
};