.PHONY: build run stop clean restart logs shell help deploy

# 镜像名称
IMAGE_NAME=nova-liu-blog
CONTAINER_NAME=nova-liu-blog
PORT=8080

# Remote deployment config
DEPLOY_HOST := 47.83.13.240
DEPLOY_USER := root
DEPLOY_DIR := /home/admin/nova-liu

help:
	@echo "可用命令:"
	@echo "  make build    - 构建 Docker 镜像"
	@echo "  make run      - 运行容器"
	@echo "  make stop     - 停止容器"
	@echo "  make restart  - 重启容器"
	@echo "  make clean    - 删除容器和镜像"
	@echo "  make logs     - 查看容器日志"
	@echo "  make shell    - 进入容器 shell"
	@echo "  make deploy   - 部署到远程服务器"

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE_NAME)
	@echo "应用已启动，访问 http://localhost:$(PORT)"

deploy:
	@echo "正在构建前端项目..."
	npm run build
	@echo "正在创建远程目录..."
	ssh $(DEPLOY_USER)@$(DEPLOY_HOST) "mkdir -p $(DEPLOY_DIR)"
	@echo "正在上传文件..."
	scp -r dist Dockerfile nginx.conf Makefile $(DEPLOY_USER)@$(DEPLOY_HOST):$(DEPLOY_DIR)/
	@echo "正在远程构建并启动容器..."
	ssh $(DEPLOY_USER)@$(DEPLOY_HOST) "cd $(DEPLOY_DIR) && \
		docker build -t $(IMAGE_NAME) . && \
		(docker stop $(CONTAINER_NAME) || true) && \
		(docker rm $(CONTAINER_NAME) || true) && \
		docker run -d -p 80:80 -p 443:443 --name $(CONTAINER_NAME) $(IMAGE_NAME)"
	@echo "部署完成！"

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

restart: stop run

clean: stop
	docker rmi $(IMAGE_NAME) || true

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) sh
