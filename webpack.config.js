const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/server.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: './[name].js',
        libraryTarget: 'commonjs'
    }
}