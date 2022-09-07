const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode:'development',
    entry: './src/main.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'index_bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title:'watermark',
            template: "index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    }
}