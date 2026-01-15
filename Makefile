.PHONY: build run stop clean restart logs shell help

# 镜像名称
IMAGE_NAME=nova-liu-blog
CONTAINER_NAME=nova-liu-blog
PORT=8080

help:
	@echo "可用命令:"
	@echo "  make build    - 构建 Docker 镜像"
	@echo "  make run      - 运行容器"
	@echo "  make stop     - 停止容器"
	@echo "  make restart  - 重启容器"
	@echo "  make clean    - 删除容器和镜像"
	@echo "  make logs     - 查看容器日志"
	@echo "  make shell    - 进入容器 shell"

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE_NAME)
	@echo "应用已启动，访问 http://localhost:$(PORT)"

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
