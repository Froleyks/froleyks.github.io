.PHONY: run open clean talks verify-talks build

DOCKER := $(shell if docker info >/dev/null 2>&1; then echo docker; else echo sudo docker; fi)

run:
	$(DOCKER) compose pull
	$(DOCKER) compose up -d
	@curl --fail --silent --retry 30 --retry-delay 1 --retry-all-errors --retry-max-time 60 --max-time 2 http://localhost:8080/ --output /dev/null || { $(DOCKER) compose logs --tail=50; exit 1; }
	$(MAKE) open

open:
	xdg-open http://localhost:8080 >/dev/null 2>&1 &

clean:
	$(DOCKER) compose down

talks:
	bash bin/import-talks

verify-talks:
	bash bin/import-talks verify

build:
	$(DOCKER) compose exec -T jekyll bundle exec jekyll build
