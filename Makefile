NAME = transcendance

all:
	@printf "Execution of configuration ${NAME}...\n"
	@docker compose up --build

down:
	@printf "Stopping configuration ${NAME}...\n"
	@docker compose down

stop:
	@printf "Stopping configuration ${NAME}...\n"
	@docker compose stop

clean: down
	@printf "Cleaning configuration ${NAME}...\n"
	@docker stop $$(docker ps -qa) | true
	@docker rm $$(docker ps -qa) | true

fclean: clean
	@printf "Stopping running configurations\n"
	@printf "Complete cleanup of containers, networks, volumes\n"
	@docker system prune --all --force
	@docker system prune --volumes
	@docker rmi -f $$(docker images -qa) | true
	@docker volume rm $$(docker volume ls -q) | true
	@docker network rm $$(docker network ls -q) | true
	@docker volume rm transcendance_postgres-data | true
	@docker volume rm transcendance_pgadmin-data | true

status:
	docker compose ps
	docker compose ls
	docker container ls
	docker image ls
	docker volume ls

test:
	@printf "Tests start...\n"
	@docker compose run --rm backend npm run test
	@docker compose run --rm frontend npm run test:unit
	@printf "Tests end.\n"

re: stop all

restart: clean all

reset: fclean all

.PHONY: all down clean fclean re reset restart status
