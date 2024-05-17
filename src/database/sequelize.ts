import { Sequelize } from 'sequelize-typescript';
import * as Models from "../models";

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
			models: Object.values(Models),
			logging: process.env.NODE_ENV === "production" ? false : (msg) => console.log(msg)
		})
	}
}