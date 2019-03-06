var path = require('path');
module.exports = {
    name:"app",
    target: "web",
    entry: {
        app:[
            './src/index.js',
            './src/scss/style.scss'
        ]
    },
    output: {
        path: path.resolve("./dist"),
        publicPath: "dist/",
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
            test: /\.scss$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: "[name].css",
                    }
                },
                {
                    loader: 'extract-loader',
                    options: {
                        publicPath: "../",
                    }
                },
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'sass-loader'
                }
            ],
            },//scss
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: '../images/'
                        }
                    },
                ]
            },//img
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'vue-loader'
                }
            }
        ],

    },
    devServer: {
        port: 3000
    }
};