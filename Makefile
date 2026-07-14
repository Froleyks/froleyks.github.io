.PHONY: run clean

run:
	docker compose pull
	docker compose up -d
	$(MAKE) open

open:
	firefox http://localhost:8080

clean:
	docker compose down
