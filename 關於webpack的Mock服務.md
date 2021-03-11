今天在研究[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)時，通過查找源碼時發現，前端項目是請求本地的接口服務，於是我便十分好奇是怎麽樣做到的

在vue-cli的配置文件中，我發現了其借助了webpack-dev-server服務提供的[before]()鈎子來進行混入，類似于中間件的行爲

官方提供了一個極簡示例

```javascript
module.exports = {
  //...
  devServer: {
    before: function (app, server, compiler) {
      app.get('/some/path', function (req, res) {
        res.json({ custom: 'response' });
      });
    },
  },
};
```

與項目中如出一轍

```javascript
// vue.config.js
...
devServer: {
    ...
  before: require('./mock/mock-server.js')
},
```

在`mock-server.js`文件中，提供一個函數供webpack注入express上下文對象進行工作，其中`registerRoutes`的工作内容為循環注冊路由

其中還利用了[chokidar]()來對整個mock數據服務的文件目錄進行監聽，以保證數據源發生變更時，可以隨時更新接口内容，具體的操作是從内存中進行路由的刪除和重新注冊

````javascript
// mock-server.js
...
module.exports = app => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  const mockRoutes = registerRoutes(app)
  var mockRoutesLength = mockRoutes.mockRoutesLength
  var mockStartIndex = mockRoutes.mockStartIndex

  // watch files, hot reload mock server
  chokidar.watch(mockDir, {
    ignored: /mock-server/,
    ignoreInitial: true
  }).on('all', (event, path) => {
    if (event === 'change' || event === 'add') {
      try {
        // remove mock routes stack
        app._router.stack.splice(mockStartIndex, mockRoutesLength)

        // clear routes cache
        unregisterRoutes()

        const mockRoutes = registerRoutes(app)
        mockRoutesLength = mockRoutes.mockRoutesLength
        mockStartIndex = mockRoutes.mockStartIndex

        console.log(chalk.magentaBright(`\n > Mock Server hot reload success! changed  ${path}`))
      } catch (error) {
        console.log(chalk.redBright(error))
      }
    }
  })
}
````

`unregisterRoutes`會在每次監聽文件發生變更時，從[require.cache](http://nodejs.cn/api/modules/require_cache.html)中刪除接口内存

```javascript
function unregisterRoutes() {
  Object.keys(require.cache).forEach(i => {
    if (i.includes(mockDir)) {
      delete require.cache[require.resolve(i)]
    }
  })
}
```

從index.js導出的`mocks`為準備好的假數據，利用`responseFake`進行數據的拼裝

```javascript
function registerRoutes(app) {
  let mockLastIndex
  const { mocks } = require('./index.js')
  const mocksForServer = mocks.map(route => {
    return responseFake(route.url, route.type, route.response)
  })
  for (const mock of mocksForServer) {
    app[mock.type](mock.url, mock.response)
    mockLastIndex = app._router.stack.length
  }
  const mockRoutesLength = Object.keys(mocksForServer).length
  return {
    mockRoutesLength: mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength
  }
}
```

[Mock](http://mockjs.com/)服務我本來一直認爲很麻煩，需要另起一個服務器，比較的繁瑣和麻煩，今天發現居然可以和webpack共用一套服務，那麽我認爲是非常值得的，因爲前端項目在沒有拿到接口時，往往需要等待後端開發，中間的時間是浪費的！如果彼此能提前約定數據格式，那麽利用mock快速製造假數據的能力，可以簡化整個前端項目的開發