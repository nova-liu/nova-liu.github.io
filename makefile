# npm run build and copy the dist to replace dir deploy/
deploy:
	npm run build
	rm -rf deploy/*
	cp -r dist/* deploy/
	@echo "Deployment completed successfully"

# Clean up build and deployment directories
clean:
	rm -rf dist/
	rm -rf deploy/
	npm run clean

# Default target
.PHONY: all
all: deploy

# Help target to display available commands
help:
	@echo "Available targets:"
	@echo "  deploy - Build and copy files to deployment directory"
	@echo "  clean  - Remove build and deployment directories"
	@echo "  help   - Show this help message"

.PHONY: deploy clean help all

