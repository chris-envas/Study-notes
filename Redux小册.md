前言

**MVC**框架是广泛应用的一应用框架模型。在后端开发中，它几乎是一个事实标准，因为它确实非常的好用！这种框架把应用分成了三个部分：

- Model(模型) - 负责管理数据，存放大量的业务逻辑
- View(视图) - 负责视图，避免涉及业务逻辑
- Controller(控制器) - 负责接收用户的请求，操作对应的Model，来完成View的更新输出

MVC框架提出的数据流非常理想。用户请求由Controller接收，再由Controller调用Model来获得数据，最后把数据交给View，完成输出

![Understanding Microsoft ASP.NET MVC Fundamentals - CodeProject](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDO5YXuE1msbaHQiMC1kOuss2L8BRSp5FGAQ&usqp=CAU)

而在后端开发中每次请求都是单向流通，请求在 **Controller => Model => View** 流通后，返回结果后这个生命周期就结束了，数据流程得以被销毁。

但是在前端应用中，渲染页面后Model还存在于浏览器中，这会诱惑开发者，直接使Model和View进行对话（数据传递）, 那么其结果将导致代码发生强耦合，设想一下，用户通过View在交互时更新Model的数据，而Model又去激发其他的Model的数据更新，开发者在后期的维护中，不敢轻易增加功能，因为这种 **多对多** 的关系，很容易 “牵一发而动全身” 影响到其他的功能

<div align=center><img src='https://z3.ax1x.com/2021/05/11/gUb9Cq.png'  /></div>

Fackbook团队在React发布时也一并发布了Flux来作为解决上述问题的方案，Flux制定了严格的数据传递机制，只有遵守其中的规则，才能完成对数据的更新，而这就是 **单向数据流** 机制

[![gULt3t.png](https://z3.ax1x.com/2021/05/11/gULt3t.png)](https://imgtu.com/i/gULt3t)

这种图看起来或许比较抽象，无法理解，让我们从实际的角度出发，假设现在页面存在一个输入框