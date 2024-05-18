import { Client, Collection, GatewayIntentBits } from 'discord.js';

import { loadStructures } from '../misc/util';

import type { Command } from './command';
import type { Event } from './event';
import { SequelizeInstance } from '../database/sequelize';
import path from 'node:path';
import { readdir } from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
import { ContextMenu } from './contextMenu';

export class ExtendedClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
            ],
            failIfNotExists: false,
            rest: {
                retries: 3,
                timeout: 15_000
            },
        });
        this.commands = new Collection<string, Command>();
        this.contextMenus = new Collection<string, ContextMenu>();
        this.cooldown = new Collection<string, Collection<string, number>>();
        this.sequelize = new SequelizeInstance();
    };

    /**
     * Loads all commands and events from their respective folders.
     */
    private async loadModules() {

        // Command handling
        const commandFolderPath = path.join(__dirname, '../commands');
        const commandFiles: Command[] = await loadStructures(commandFolderPath, ['data', 'execute']);

        for (const command of commandFiles) {
            this.commands.set(command.data.name, command);
        }

        // Context Menu handling
        const contextMenuFolderPath = path.join(__dirname, '../contextmenu');
        const contextMenuFiles: ContextMenu[] = await loadStructures(contextMenuFolderPath, ['data', 'execute']);

        for (const contextMenu of contextMenuFiles) {
            this.contextMenus.set(contextMenu.data.name, contextMenu);
            console.log(`Loaded context menu ${contextMenu.data.name}`)
        }

        // Event handling
        const eventFolderPath = path.join(__dirname, '../events');
        const eventFiles: Event[] = await loadStructures(eventFolderPath, ['name', 'execute']);

        for (const event of eventFiles) {
            this[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
        }

        // Load Fonts
        GlobalFonts.registerFromPath('/var/www/blacket-rewrite/frontend/public/content/fonts/Nunito Bold.ttf', 'Nunito');
        GlobalFonts.registerFromPath('/var/www/blacket-rewrite/frontend/public/content/fonts/Titan One.ttf', 'Titan One');
    }

    /**
     * This is used to log into the Discord API with loading all commands and events.
     */
    start() {
        this.loadModules();
        this.login(); // Since the token is named DISCORD_TOKEN in the .env file, we don't need to pass it in here as it will be automatically grabbed.
    };
};