### 安装

#### Centos环境

```shell
# 安装`yum-utils`软件包（提供`yum-config-manager` 实用程序）
sudo yum update && yum install -y yum-utils
# 安装源
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# 查看docker版本
sudo yum list docker-ce --showduplicates | sort -r
# 安装
sudo yum install docker-ce docker-ce-cli containerd.io
```

#### Ubuntu环境

```shell
sudo apt-get update 
# 安装所需第三方依赖包
sudo apt install apt-transport-https ca-certificates curl software-properties-common
# 设置源
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic test"
sudo apt update
# 安装docker
sudo apt install docker-ce
```

#### 启动

```shell
sudo systemctl start docker
```

加载Nginx镜像

> Docker 首先会检查本地是否有`nginx`这个镜像，如果发现本地没有这个镜像，Docker 就会去 Docker Hub 官方仓库下载此镜像

```shell
sudo docker pull nginx
```

启动并访问该主机下IP的8080端口

```shell
docker run --name nginx-test -p 8080:80 -d nginx
```

#### 帮助

常见指令

- -p 本机端口:容器端口 映射本地端口到容器
- -P 将容器端口映射为本机随机端口
- -v 本地路径或卷名:容器路径 将本地路径或者数据卷挂载到容器的指定位置
- -it 作为交互式命令启动
- -d 将容器放在后台运行 --rm 容器退出后清除资源

查看容器

```shell
# 查看运行中的容器
docker ps
 
# 查看所有容器（包括正在运行和已经停止运行的）
docker ps -a
```

停止容器命令

```shell
# 通过id直接关闭容器
# docker kill a0fbf4519279
# 通过容器名称直接关闭容器
docker kill docker-nginx
 
# 通过id直接容器 默认等待十秒 超时强制关闭
# docker stop a0fbf4519279
# 通过容器名称关闭容器 默认等待十秒 超时强制关闭  等价于 docker stop -t=10 docker-nginx
docker stop docker-nginx
```

删除镜像及实例

```shell
# 镜像删除
docker image rm image_name
# 通过id实例删除
docker rm a0fbf4519279
```

重新启动容器

```shell
# 启动容器可通过容器id或者容器名称
# 通过容器名称启动容器，如果已启动则忽略
docker start docker-nginx
 
# 通过容器名称重新启动容器，如果未启动则直接启动，如果已启动则关闭再启动
# docker restart docker-nginx
```



### 原理

**chroot**可以创建并运行一个隔离的虚拟软件系统拷贝，人们称其为“软件监狱”，chroot的几个优点是当前容器的雏形	

- **测试和开发** - 可以经由chroot创建一个测试环境，用来测试软件。这可以减少将软件直接布署到整个生产系统中可能造成的风险
- **依赖控制** - 可以在chroot创建的环境下，进行软件开发，组建以及测试，只保留这个程序需要的软件依赖。这可以避免在系统中预先安装的各种[软件库](https://zh.wikipedia.org/wiki/软件库)，影响到开发
- **特权分离** - 将允许开启文件描述子（例如文件，[流水线](https://zh.wikipedia.org/wiki/管道_(Unix))或是网络连线）的程序放到chroot下运行，不用特地将工作所需的文件，放到chroot路径底下，这可以简化软件监狱的设计。chroot简化了安全设计，可以创造出一个沙盒环境，来运行一个有潜在危险的特权程序，以先期防御可能的安全漏洞

面我们通过一个实例来演示下 chroot:

创建一个 rootfs 目录

```shell
cd /tmp && mkdir rootfs && cd /tmp/rootfs
```

docker使用 busybox 镜像来创建一个系统

```shell
docker export $(docker create busybox) -o busybox.tar && tar -xf busybox.tar
```

查看当前目录下的内容

```shell
ls
bin  busybox.tar  dev  etc  home  proc  root  sys  tmp  usr  var
```

使用chroot,启动一个 sh 进程，并且把 /tmp/rootfs 作为 sh 进程的根目录,并使用ls指令查看当前进程，你会发现已经与主机目录隔离了

[![6U2WHe.png](https://s3.ax1x.com/2021/03/12/6U2WHe.png)](https://imgtu.com/i/6U2WHe)

但是这种隔离，仅仅是进程上的，它只做到了进程目录上的隔离，网络环境，硬件资源并未隔离

**Docker 是利用 Linux 的 Namespace 、Cgroups 和联合文件系统三大机制来保证实现的， 所以它的原理是使用 Namespace 做主机名、网络、PID 等资源的隔离，使用 Cgroups 对进程或者进程组做资源（例如：CPU、内存等）的限制，联合文件系统用于镜像构建和容器运行环境**

### 概念

什么是镜像？

实际是是一个只读的文件和文件夹组合。它包含了容器运行时所需要的所有基础文件和配置信息

什么是容器？

容器是镜像的运行实体。镜像是静态的只读文件，而容器带有运行时需要的可写文件层，并且容器中的进程属于运行状态

什么是仓库？

Docker 的镜像仓库类似于代码仓库，用来存储和分发 Docker 镜像。镜像仓库分为公共镜像仓库和私有镜像仓库

Docker是如何工作的？

Docker 使用的是 C/S 结构，即客户端/服务器体系结构，如下所示：

```shell
$ docker version
Client: Docker Engine - Community
 Version:           20.10.5
 API version:       1.41
 Go version:        go1.13.15
 Git commit:        55c4c88
 Built:             Tue Mar  2 20:17:04 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.5
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.13.15
  Git commit:       363e9a8
  Built:            Tue Mar  2 20:15:27 2021
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.4.4
  GitCommit:        05f951a3781f4f2c1911b05e61c160e9c30eaa8e
 runc:
  Version:          1.0.0-rc93
  GitCommit:        12644e614e25b05da6fd08a38ffa0cfe1903fdec
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

Docker 客户端与 Docker 服务端交互， 核心是：Docker 服务端负责构建、运行和分发 Docker 镜像

所里所谓的客户端，我的理解是：**通过RESTful 、 stock 或网络接口与远程 Docker 服务端进行通信**

因此Docker提供了多种语言的支持，我们可以通过编码的方式，构建属于我们自己的客户端!

想要知道Docker支持的语言SDK,点击[传送门](https://docs.docker.com/engine/api/sdk/)