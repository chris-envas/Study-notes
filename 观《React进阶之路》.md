观《React进阶之路》

state与props是React组件的基本“原料”

使用state的陷阱

1、不能直接修改state，必须通过setState

```javascript
// 错误使用
this.state.name = 'react'

// 正确使用
this.setState({name: 'react'})
```

2、state是异步更新

调用setState时并不能立即获得获得更新后的数据，因为setState仅是将要修改的数据放入队列中，React会自动寻找最佳的执行时机，并且由于性能的原因，React会将多个setState合并为一次，此时的state并不能保证是最新的state

