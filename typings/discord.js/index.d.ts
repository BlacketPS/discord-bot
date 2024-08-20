import type { Collection } from 'discord.js';
import type { Command } from '../../src/structures/command.js';
import { Redis } from 'ioredis';
import { ContextMenu } from '../../src/structures/contextMenu.js';
import { SelectMenu } from '../../src/structures/selectMenu.js';
import { RedisInstance } from '../../src/redis/redis.js';
import { PrismaInstance } from '../../src/database/prisma.js';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
        contextMenus: Collection<string, ContextMenu>;
        selectMenus: Collection<string, SelectMenu>;
        cooldown: Collection<string, Collection<string, number>>;
        prisma: PrismaInstance;
        redis: RedisInstance;
    }
}