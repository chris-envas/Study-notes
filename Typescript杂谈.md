基于requestAnimationFrame探索动画在web领域的运用

> 从程序的角度来看，动画就是不间断的基于时间的更新和重绘

可以简单的理解为类似于 **while(true)** 的死循环，我们的计算机会基于硬件的刷新频率进行不间断的更新重绘

`window.requestAnimationFrame`是浏览器提供的动画执行方法，该方法会对传入的回调函数，更新时调用，并且在执行时会跟随当前硬件显示的刷新频率，使得动画的演示会更加的流程

下面，让我们来测试该方法的刷新频率是否真的维持在一个稳定的频率中

笔者使用的显示器，刷新频率为： 60HZ

```typescript
let start: number = 0;
let lastTime: number = 0;
let count: number = 0;

function step(timestamp: number): void {
  if (!start) start = timestamp;
  if (!lastTime) lastTime = timestamp;
  // 计算当前时间点与第一次时间点的差
  let elapsedMsec: number = timestamp - start;
  // 计算当前时间点与上一次时间点的差
  let inntervalMsc: number = timestamp - lastTime;
  lastTime = timestamp;
  count++;
  console.log("" + count + "timestamp" + timestamp);
  console.log("" + count + "elapsedMsec" + elapsedMsec);
  console.log("" + count + "inntervalMsc" + inntervalMsc);
  window.requestAnimationFrame(step)
}

window.requestAnimationFrame(step)
```

结果：从结果可以看到每次调用回调函数的时间稳定在16毫秒内

[![g9F7Ix.png](https://z3.ax1x.com/2021/04/27/g9F7Ix.png)](https://imgtu.com/i/g9F7Ix)

进一步，将上述功能封装一个完整的类，并增加若干功能

> 在游戏动画领域，oop风格的编程风格得到了大量的运用