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
          },

        ]
      },  
  },
  css: {
    sourceMap: true
  }
}

