Docker+Jenkins持续部署Node.js应用

环境: Ubuntu 18.04

> 请确保Docker已被安装，若未安装，可参考我的另一篇文章[docker小白入門.md](https://github.com/chris-envas/Study-notes/blob/master/docker%E5%B0%8F%E7%99%BD%E5%85%A5%E9%96%80.md)

使用下面的 [`docker run`](https://docs.docker.com/engine/reference/commandline/run/) 命令运行 `jenkinsci/blueocean` 镜像作为Docker中的一个容器(记住，如果本地没有镜像，这个命令会自动下载):

```shell
docker run \
  --rm \
  -u root \
  -p 8080:8080 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME":/home \
  jenkinsci/blueoceans
```

上述命令主要做了两件事情

- 将容器中的 `/var/jenkins_home` 目录映射到 Docker [volume](https://docs.docker.com/engine/admin/volumes/volumes/) ，并将其命名为 `jenkins-data`。如果该卷不存在, 那么 `docker run` 命令会自动为你创建卷
- 将主机上的`$HOME` 目录 (即你的本地)映射到 (通常是 `/Users/<your-username>` 目录) 到容器的 `/home` 目录

安装向导

1、当在终端/命令提示窗口出现两组星号时, 浏览 `http://localhost:8080` 并等待 **Unlock Jenkins** 页面出现

![](https://www.jenkins.io/zh/doc/book/resources/tutorials/setup-jenkins-01-unlock-jenkins-page.jpg)

2、再次从终端/命令提示窗口, 复制自动生成的字母数字密码(在两组星号之间)

![](https://www.jenkins.io/zh/doc/book/resources/tutorials/setup-jenkins-02-copying-initial-admin-password.png)

3、在 **Unlock Jenkins** 页面, 粘贴该密码到 **Administrator password** 字段并点击 **Continue**

4、使用插件自定义 Jenkins，新手点击下载建议插件（ **Install suggested plugins**）即可，安装向导显示了正在配置的Jenkins的进程，以及建议安装的插件。这个过程肯需要几分钟

5、最后, Jenkins 要求创建你的第一个管理员用户

6、创建流水线

以上流程可见于**[官方文档](https://www.jenkins.io/zh/doc/tutorials/build-a-node-js-and-react-app-with-npm/)**，由于过于繁乱，我是一名Linux用户，因此仅对Linux环境进行了整理，以供自查

