# OPS

## local

- Start just the db

```bash
docker-compose up -d mpm-db
```

- Connect to db

```bash
mysql -h 127.0.0.1 -u root -P 3306
```

- `sequelize` commands

```bash
npx sequelize db:create
```
