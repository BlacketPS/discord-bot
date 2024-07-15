import { Sequelize } from 'sequelize-typescript';
import * as Models from "blacket-types/dist/models";

export class SequelizeInstance extends Sequelize {
	constructor() {
		super({
			dialect: "postgres",
			username: process.env.SERVER_DATABASE_USER,
			password: process.env.SERVER_DATABASE_PASSWORD,
			database: process.env.SERVER_DATABASE_NAME,
			host: process.env.SERVER_DATABASE_HOST,
			port: +(process.env.SERVER_DATABASE_PORT ?? 5432),
			repositoryMode: true,
			models: Object.values(Models).map((model) => typeof model === "function" ? model : null).filter((model) => model !== null),
			logging: process.env.NODE_ENV === "production" ? false : (msg) => console.log(msg)
		})
	}
}