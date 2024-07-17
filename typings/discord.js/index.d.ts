import type { Collection } from 'discord.js';
import type { Command } from '../../src/structures/command.js';
import { Sequelize } from 'sequelize-typescript';
import { ContextMenu } from '../../src/structures/contextMenu.js';
import { SelectMenu } from '../../src/structures/selectMenu.js';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
        contextMenus: Collection<string, ContextMenu>;
        selectMenus: Collection<string, SelectMenu>;
        cooldown: Collection<string, Collection<string, number>>;
        sequelize: Sequelize;
    }
}