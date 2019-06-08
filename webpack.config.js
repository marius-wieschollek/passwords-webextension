let webpack              = require('webpack'),
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
                    BUILD_TARGET: `"${platform}"`
                }
            }
        ),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin(['src/platform/generic', 'src/platform/' + platform]),
        new MiniCssExtractPlugin({filename: 'css/passwords.css'})
    ];

    if(env.production) {
        plugins.push(
            new OptimizeCSSPlugin({cssProcessorOptions: {safe: true}})
        );
        plugins.push(new CleanWebpackPlugin());
    }


    return {
        mode   : production ? 'production':'development',
        devtool: 'none',
        entry  : {
            app       : `${__dirname}/src/js/app.js`,
            client    : `${__dirname}/src/js/client.js`,
            background: `${__dirname}/src/js/background.js`
        },
        output : {
            path    : `${__dirname}/build/`,
            filename: "js/[name].js"
        },
        resolve: {
            modules   : ['node_modules', 'src'],
            extensions: ['.js', '.vue', '.json'],
            alias     : {
                'vue$': 'vue/dist/vue.esm.js',
                '@vue': `${__dirname}/src/vue`,
                '@js' : `${__dirname}/src/js`
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
                        limit          : 2048,
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
                            loader : MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader : 'sass-loader',
                            options: {outputStyle: 'compressed'}
                        },
                        {
                            loader : 'sass-resources-loader',
                            options: {
                                sourceMap: true,
                                resources: [
                                    `${__dirname}/src/scss/includes.scss`
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