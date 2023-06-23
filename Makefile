NAME = transcendance

all:
	@printf "Execution de la configuration ${NAME}...\n"
	@docker compose up -d --build

down:
	@printf "Arrêt de la configuration ${NAME}...\n"
	@docker compose down

stop:
	@printf "Arret de la configuration ${NAME}...\n"
	@docker compose stop

clean: down
	@printf "Nettoyage de la configuration ${NAME}...\n"
	@docker stop $$(docker ps -qa) | true
	@docker rm $$(docker ps -qa) | true

fclean: clean
	@printf "Arrêt des configurations en cours\n"
	@printf "Nettoyage complet des conteneurs, réseaux, volumes\n"
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

re: stop all

restart: clean all

reset: fclean all

.PHONY: all down clean fclean re reset restart status
