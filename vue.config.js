module.exports = {
  configureWebpack:{
      module: {
        rules: [
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
            use: [{
                loader: "./node_modules/babel-loader/lib/index.js"
            }]
          }
        ]
      }
  },
  devServer: {
    proxy: 'http://localhost:8088'
  },
  css: {
    sourceMap: true
  }
}

