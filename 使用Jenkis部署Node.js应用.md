使用Jenkis部署Node.js应用

本文旨如何完成CI/CD部署，因此略过Jenkis的安装过程，直接使用[`jenkinsci/blueocean`](https://hub.docker.com/r/jenkinsci/blueocean/) Docker 镜像

[如果你是一名Docker新手，你应该先安装](https://github.com/chris-envas/Study-notes/blob/master/docker%E5%B0%8F%E7%99%BD%E5%85%A5%E9%96%80.md)

加载`jenkinsci/blueocean`镜像

> 如果本地没有镜像，这个命令会自动下载

```shell
docker run \
  --rm \
  -u root \
  -p 8080:8080 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME":/home \
  jenkinsci/blueocean	
```

- ​	`jenkins-data:/var/jenkins_home`指令将容器中的 `/var/jenkins_home` 目录映射到 Docker [volume](https://docs.docker.com/engine/admin/volumes/volumes/) ，并将其命名为 `jenkins-data`。如果该卷不存在, 那么 `docker run` 命令会自动为你创建卷
-  `"$HOME":/home `指令将主机上的`$HOME` 目录 (即你的本地)映射到 (通常是 `/Users/<your-username>` 目录) 到容器的 `/home` 目录