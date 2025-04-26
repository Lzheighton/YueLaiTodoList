const path = require('path');

module.exports = {
  // 入口文件
  entry: './ts/main.ts',
  
  // 输出配置
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  
  // 解析配置
  resolve: {
    extensions: ['.ts', '.js']  // 自动解析这些扩展名
  },
  
  // 模块规则
  module: {
    rules: [
      {
        test: /\.ts$/,          // 匹配所有.ts文件
        use: 'ts-loader',       // 使用ts-loader处理
        exclude: /node_modules/ // 排除node_modules目录
      }
    ]
  },
  
  // 开发工具配置
  devtool: 'source-map',        // 生成源映射文件，便于调试
  
  // 模式
  mode: 'development'           // 开发模式，还可以是'production'或'none'
};