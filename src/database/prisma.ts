import { PrismaClient } from "@prisma/client";

export class PrismaInstance extends PrismaClient {
	constructor() {
		super({
			datasources: {
				db: {
					url: process.env.SERVER_DATABASE_URL,
				}
			}
		})
	}
}