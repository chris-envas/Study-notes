### 使用 splitChunks 优化缓存利用率

splitChunks是构建分包的策略，它的优点如下

- 合并通用依赖
- 提升构建缓存利用率
- 提升资源访问的缓存利用率
- 资源懒加载

其主要的原理就是对第三方的依赖包进行单独chunk，比如Vue项目中，其主要的第三方依赖会被分包，而业务逻辑等会生成另一个chunk，那么即使在频繁的业务需求中，第三方依赖chunk并不受干扰，打包时只是针对业务逻辑的变更的代码进行bundle

代码如下：

> 文中代码是Vue项目的webpack配置代码

```javascript
// vue.config.js
module.exports = {
  ...
  configureWebpack: {
	...
    optimization: {
      splitChunks: {
        chunks: "all"
      }
    }
  }
};
```

比较两次打包文件

第一次：

[![6NqjjH.png](https://s3.ax1x.com/2021/03/12/6NqjjH.png)](https://imgtu.com/i/6NqjjH)

第二次，笔者刻意的修改了部分JS业务代码和css

[![6NLSHI.png](https://s3.ax1x.com/2021/03/12/6NLSHI.png)](https://imgtu.com/i/6NLSHI)

从打包出来的文件中，可以发现其中chunk-vendors.*文件是固定的，因此可以节省HTTP请求资源，合理使用缓存