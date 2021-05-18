## CI/CD 全流程之牛刀小试(二)

> 本文将引领你通过Jenkins构建 **NodeJS** 项目并将应用打包成 Docker 镜像。

### 前言

前面说过Jenkins绝大多数的能力都是通过插件进行**扩展的**，社区中有超过1000+的优秀插件供你使用，插件的使用通常分为两个步骤：

- 点击Manage Jenkins进入Mange Plugins (插件管理)，安装对应的插件
- 进入Global Tool Configuration(全局工具配置)，设置对应环境的版本安装

[![g33gSK.png](https://z3.ax1x.com/2021/05/07/g33gSK.png)](https://imgtu.com/i/g33gSK)

### 构建NodeJS项目

#### 1、安装插件

进入插件管理搜索可用插件 **=>** 安装对应的Node.js插件 

[![gGIwB6.png](https://z3.ax1x.com/2021/05/08/gGIwB6.png)](https://imgtu.com/i/gGIwB6)

#### 2、设置NodeJS版本

安装成功后 **=>** 进入全局工具配置 **=>** 找到NodeJS安装选项并设置对应版本

> 注意：该选项是因为安装了NodeJS插件才出现的，因此可知 Jenkins 原生支持 JDK、Git 、Gradle 、Ant、Maven等构建选项
>
> 这里没有选择最新版本，截至撰写时，NodeJS 已经更新到 v16，但笔者有不使用最新版本的习惯：）

[![gGom5D.png](https://z3.ax1x.com/2021/05/08/gGom5D.png)](https://imgtu.com/i/gGom5D)

#### 3、创建项目并集成Git仓库

准备Git项目，这里采用官方推荐的仓库：[simple-node-js-react-npm-app](https://github.com/jenkins-docs/simple-node-js-react-npm-app)

在安装Jenkins的主机上生成**公钥与私钥**，通常情况会有几个询问，无脑回车即可：）

```shell
ssh-keygen -t rsa -C "382967255@qq.com"
```

密钥默认生成在 `~/.ssh/id_rsa` 目录下，获取其中公钥

```shell
cat ~/.ssh/id_rsa/id_rsa.pub
```

前往[Github](https://github.com/)登录个人账号后进行SSH密钥设置

[![gtAkLR.png](https://z3.ax1x.com/2021/05/10/gtAkLR.png)](https://imgtu.com/i/gtAkLR)

添加密钥

[![gtAMSe.png](https://z3.ax1x.com/2021/05/10/gtAMSe.png)](https://imgtu.com/i/gtAMSe)

在Jenkins中创建项目，并使用Git管理，输入对应仓库的**SSH链接**，注意此时仓库会显示无法连接，需要进一步添加密钥

[![gtABOs.png](https://z3.ax1x.com/2021/05/10/gtABOs.png)](https://imgtu.com/i/gtABOs)

获取之前生成私钥

```shell
cat ~/.ssh/id_rsa
```

添加私钥：类型选择**SSH Username with private key**, ID与描述等自行填写即可，最重要的是将私钥内容进行填写

[![gtA2fU.png](https://z3.ax1x.com/2021/05/10/gtA2fU.png)](https://imgtu.com/i/gtA2fU)

修改构建脚本

```shell
#!/bin/sh -l

node -v
docker -v
npm install --registry=https://registry.npm.taobao.org
npm run build
docker build -t jenkins-test .
```

[![gtE58S.png](https://z3.ax1x.com/2021/05/10/gtE58S.png)](https://imgtu.com/i/gtE58S)

#### 4、编写Dockerfile构建镜像

> Dockerfile是Docker的基础镜像描述文件，Docker可以通过它来获取执行步骤，生成对应的镜像配置

在Git项目根目录下，新增Dockerfile文件

```shell
FROM nginx:1.15-alpine
COPY build /etc/nginx/html
WORKDIR /etc/nginx/html
```

执行构建成功

![image-20210510095808222](C:\Users\yuanxing08\AppData\Roaming\Typora\typora-user-images\image-20210510095808222.png)

前往查看镜像

```shell
# 查看镜像列表
docker images
```

[![gaygMt.png](https://z3.ax1x.com/2021/05/11/gaygMt.png)](https://imgtu.com/i/gaygMt)