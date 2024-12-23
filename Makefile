build:
	docker build -t environment-map-img .
run:
	docker run --name environment-map-dev --rm -v /app/node_modules -v $(PWD):/app/ \
		-p 3000:5173 environment-map-img