## CI/CD 全流程之牛刀小试(一)

### 前文

> 本文为安装篇，主要涉及对Docker 和 Jenkins的安装和使用

CI/CD是Devops非常重要的功能，当前较为通用的技术栈搭配分别为：

- Docker - 基于Go开源的应用容器。允许开发者将自己的应用打包在镜像中，进而迁移到其他平台的Dokcer中，开发者可以自定义镜像的运行环境、文件、代码、配置等内容且不必担心环境造成的运行等问题，换句话说，使用Docker抹除了平台和环境的差异性！
- Jenkins - 基于Java的持续集成和持续部署的开源软件。得益于Jenkins优秀的插件扩展机制，社区超过1000个的优秀插件，可以满足绝大多数项目的构建、部署、自动化需求
- Kubernetes - Google开源的管理容器的应用程序的开源系统，简称**k8s**。Docker开启了容器化的时代，在容器化的世界里，Kubernetes提供了大规模的容器编排和管理的能力，可以快速构建多容器的服务，在集群上调度和伸缩这些容器，以及管理它们的应用状态



### Centos篇之Docker安装

#### 1、准备工作

**首次**安装Docker时，需要设置Docker仓库，方便后续的安装和更新。

设置仓库需要用到的软件包，`yum-utils`提供了yum-config-manager，并且Docker的**Device mapper**需要`device-mapper-persistent-data(linux下的高级驱动技术)` 和`lvm2(逻辑卷管理)`支持

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
```

#### 2、设置Docker源加速安装

```shell
# 阿里云的镜像源
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装
yum install docker-ce -y

# 查看版本
docker version
```

#### 3、启动Docker服务

```shell
service docker start
```



### Centos篇之Jenkins安装

#### 1、安装Java JDK

因为Jenkins是基于Java的持续集成软件，因此需要安装Java JDK

```shell
yum install -y java
```

#### 2、安装Jenkins

由于yum不自带`Jenkins`的源，因此需要我们手动下载

```shell
# 下载Jenkins文件
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# 导入签名文件
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key

# 安装
yum install jenkins
```

#### 3、启动Jenkins

```shell
service jenkins start
# 成功打印
Starting jenkins (via systemctl):                          [  OK  ]

# service jenkins restart restart 重启 Jenkins
# service jenkins restart stop 停止 Jenkins
```

Jenkins默认的启动端口服务是**8080**，但默认防火墙限制，因此需要解除限制，方可访问

**如果是云主机，一般可前往对应云平台的控制台中解除端口限制**

```shell
# 添加端口
firewall-cmd --zone=public --add-port=8080/tcp --permanent

# 重启防火墙，即可访问
systemctl reload firewalld
```

[![gl0yRA.png](https://z3.ax1x.com/2021/05/06/gl0yRA.png)](https://imgtu.com/i/gl0yRA)

#### 4、初始化配置

Jenkins首次启动后需要进行解锁

[![glDqET.png](https://z3.ax1x.com/2021/05/06/glDqET.png)](https://imgtu.com/i/glDqET)

安装默认推荐插件

[![glr1IS.png](https://z3.ax1x.com/2021/05/06/glr1IS.png)](https://imgtu.com/i/glr1IS)

静候安装：）

[![glrBIU.png](https://z3.ax1x.com/2021/05/06/glrBIU.png)](https://imgtu.com/i/glrBIU)

#### 5、测试使用

创建项目

[![glgPhT.png](https://z3.ax1x.com/2021/05/06/glgPhT.png)](https://imgtu.com/i/glgPhT)

拉取最新的Node镜像

[![glgW5V.png](https://z3.ax1x.com/2021/05/06/glgW5V.png)](https://imgtu.com/i/glgW5V)

构建失败

[![gl2pKH.png](https://z3.ax1x.com/2021/05/06/gl2pKH.png)](https://imgtu.com/i/gl2pKH)

**注意！**错误的提示信息：**[Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running? ](https://stackoverflow.com/questions/55055488/jenkins-in-docker-cannot-connect-to-the-docker-daemon-at-unix-var-run-docke)**该报错表明：Jenkins执行失败 无法连接Docker的**守护进程**，需要检查 /var/run/docker.sock 是否存在该文件

导致该错误可能存在两个原因：

1、Docker默认需要root用户权限才能进行**socket**通信，因此需要在Docker的用户组**docker**中添加Jenkins的终端用户

```shell
# 新增docker用户组
sudo groupadd docker       

# 将当前用户添加至docker用户组
sudo gpasswd -a jenkins docker  

# 更新docker用户组
newgrp docker          

# 重启Jenkins
sudo service jenkins restart
```

2、由于Docker是典型的C/S架构，需要确定是否已经启动Docker服务

```shell
# 查看Docker服务
service docker status

# 若不存在，则启动
service docker start
```

再次执行构建，显示执行成功

[![g1b2K1.png](https://z3.ax1x.com/2021/05/07/g1b2K1.png)](https://imgtu.com/i/g1b2K1)