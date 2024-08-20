import { Blook } from "blacket-types";
import { Redis } from "ioredis"

export enum DataKey {
    BLOOK = "blook",
    RARITY = "rarity",
    PACK = "pack",
    ITEM = "item",
    ITEM_SHOP = "itemShop",
    TITLE = "title",
    BANNER = "banner",
    BADGE = "badge",
    FONT = "font",
    EMOJI = "emoji",
    RESOURCE = "resource"
}

export class RedisInstance extends Redis {
	prefix: string;

	constructor() {
		super({ })

		this.prefix = process.env.SERVER_DATABASE_NAME;
	}

	async getAllFromKey(key: string) {
        const keys = await this.keys(`${this.prefix}:${key}:*`);

        let data = keys.length ? await this.mget(keys) : [];
        data = data.filter((item, index) => data.indexOf(item) === index);

        return data.map((item: string) => JSON.parse(item));
    }

    async getKey<T>(key: string, value: any): Promise<T | any> {
        return JSON.parse(await this.get(`${this.prefix}:${key}:${value}`));
    }

	async getBlooksFromPack(packId: number): Promise<Blook[]> {
        const blooks = await this.getAllFromKey(DataKey.BLOOK);

        return blooks.filter((blook) => blook.packId === packId && (!blook.onlyOnDay || blook.onlyOnDay === new Date().getDay() + 1));
    }
}