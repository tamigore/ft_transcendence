module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://nestjs_container:3000',
        changeOrigin: true,
        secure: false, 
        pathRewrite: {
          '^/api': '/api'
        },
        headers: {
          Connection: 'keep-alive'
        },
        logLevel: 'debug' 
      },
    }
  },
  configureWebpack: {
      devServer: {
          hot: true,
      },
      watch: true,
      watchOptions: {
          ignored: /node_modules/,
          poll: 1000,
      },
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          // treat any tag that starts with ion- as custom elements
          isCustomElement: tag => tag.startsWith('ion-')
        }
      }))
  },
  transpileDependencies: true,
};
