### 详解webpack的热更新技术包含以下三种

> 篇幅有限，这里重点讲**Live Reload**和**Hot Module Replacement**

- watch - 监控本地代码文件，触发打包，但需要手动刷新网页才可看到最新效果
- Live Reload - 监控本地代码文件，触发打包，通过websocket通知客户端自动刷新页面
- Hot Module Replacement - 监控热更新代码文件，触发打包，利用异步请求，使客户端局部更新

### **Live Reload**

为了使每次代码变更后浏览器的页面能够自动显示最新效果，我们需要**一种通信机制来连接浏览器中的页面与本地代码监控的进程**，在webpack中，我们可以采用`webpack-dev-server`来做到这一点

代码如下：

```javascript
// src/index.js
function render() {
  const div = document.createElement('div')
  div.innerHTML = 'Hello World12'
  document.body.appendChild(div)
}
// webpack.config.reload.js
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true
  },
  plugins: [new HtmlWebpackPlugin()],
} 
// package.json
"dev:reload": "webpack-dev-server --config webpack.config.reload.js",
```

实现效果：

[![61ocWV.gif](https://s3.ax1x.com/2021/03/09/61ocWV.gif)](https://imgtu.com/i/61ocWV)

在实际开发中，**Live Reload**通过websocket连接来监控本地代码变更实现自动刷新网页的效果，极大的简化了我们的开发效率，但在一些大型的项目中，因为其自动刷新的机制，会初始化web应用的状态，而通常我们在调试代码时，仅变更了组件的一小部分，因此给我们的开发带来了困扰

### **Hot Module Replacement**

为了解决页面状态刷新的状态丢失问题，这里重磅引进**Hot Module Replacement**也就是我们常说的**热模块替换**

代码如下:

```javascript
// style/index.css
div {
  color: rgb(39, 37, 37);
}
// index.js
import "./style/index.css"
...

render()
// webpack.config.reload.js
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  ...
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    hot: true
  },
  ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
} 
```

实现效果：

[![6YfNxf.gif](https://s3.ax1x.com/2021/03/11/6YfNxf.gif)](https://imgtu.com/i/6YfNxf)](https://imgtu.com/i/6JogOK)

现象：

- 改动CSS文件可以触发热模块替换

- 改动JS文件无法触发热模块替换

每次变更CSS文件时，会触发两个请求，如下所示

[![6YIwpn.png](https://s3.ax1x.com/2021/03/11/6YIwpn.png)](https://imgtu.com/i/6YIwpn)

在JS文件中调用了`webpackHotUpdate`函数

```javascript
webpackHotUpdate("main",{

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style/index.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style/index.css ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"div {\\r\\n  color: rgb(184, 141, 141);\\r\\n}\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/style/index.css?./node_modules/css-loader/dist/cjs.js");

/***/ })
})
```

`webpackHotUpdate`应该是webpack的模块热替换插件[HotModuleReplacementPlugin](https://webpack.docschina.org/plugins/hot-module-replacement-plugin/)提供的函数

前往官网，正好找到这段描述

> ### [在模块中](https://webpack.docschina.org/concepts/hot-module-replacement/) 
>
> HMR 是可选功能，只会影响包含 HMR 代码的模块。举个例子，通过 [`style-loader`](https://github.com/webpack-contrib/style-loader) 为 style 追加补丁。为了运行追加补丁，`style-loader` 实现了 HMR 接口；当它通过 HMR 接收到更新，它会使用新的样式替换旧的样式。

让我们来回顾CSS文件在webpack被打包的全过程

- css-loader 解析导入的css文件为模块
- style-loader 解析css模块插入到页面中

而`style-loader`默认实现了HMR接口，那么也就意味着，每次变更css文件内容时，HMR 插件会完成自动更新的机制，也就是：**异步请求一份新的JS文件，用来变更页面中的CSS内容**，这也就完成了不用刷新也能更新页面的效果

那么`style-loader`是如何做到利用HMR的接口呢？这要从**HotModuleReplacementPlugin**的[API](https://webpack.docschina.org/api/hot-module-replacement/)说起

其中有两个主要的API

- accept - 接受给定 `依赖模块(dependencies)` 的更新，并触发一个 `回调函数` 来响应更新

  - ```javascript
    module.hot.accept(
      dependencies, // 可以是一个字符串或字符串数组
      callback // 用于在模块更新后触发的函数
    );
    ```

- dispose - 添加一个处理函数，在当前模块代码被替换时执行

  - ```javascript
    module.hot.dispose(data => {
      // 清理并将 data 传递到更新后的模块...
    });
    ```

接下来利用`accept`来手动实现JS的模块热替换

代码如下:

 ```javascript
// text.js
export default 'Hello World' 
// index_hmr.js	
import text from './text.js' 

const div = document.createElement('div') 
document.body.appendChild(div) 
function render() { 
  div.innerHTML = text; 
} 
render() 

// hmr热更新注册
if (module.hot) { 
  module.hot.accept("./text.js", function() { 
    render() 
    console.log('hmr')
  }) 
}
// webpack.config.hmr_t.js
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './src/index_hmr.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    hot: true
  },
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
} 
// package.json
"dev:hmr_t": "webpack-dev-server --config webpack.config.hmr_t.js"
 ```

一旦在`webpack-dev-server`中开启了热替换，**HotModuleReplacementPlugin**的API将挂载在`module.hot`上，因此我们实现对某个模块的更新热替换

从上面的例子可以知道，在webpack中启动热替换必须保证对应的加载器在运行时实现了**HotModuleReplacementPlugin**的模块`accept`功能

