import type { Collection } from 'discord.js';
import type { Command } from '../../src/structures/command.js';
import { Sequelize } from 'sequelize-typescript';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
        cooldown: Collection<string, Collection<string, number>>;
        sequelize: Sequelize;
    }
}