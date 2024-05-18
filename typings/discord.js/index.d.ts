import type { Collection } from 'discord.js';
import type { Command } from '../../src/structures/command.js';
import { Sequelize } from 'sequelize-typescript';
import { ContextMenu } from '../../src/structures/contextMenu.js';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
        contextMenus: Collection<string, ContextMenu>;
        cooldown: Collection<string, Collection<string, number>>;
        sequelize: Sequelize;
    }
}