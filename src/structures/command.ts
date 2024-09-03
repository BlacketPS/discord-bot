import type { PermissionType } from 'blacket-types';
import type { CommandInteraction, PermissionResolvable, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody } from 'discord.js';

interface CustomOptions {
    /**
     * The permissions the user needs to run the command
     */
    userPermissions?: PermissionResolvable[];
    /**
     * The permissions the bot needs to run the command
     */
    botPermissions?: PermissionResolvable[];
    /**
     * The permissions the bot needs to run the command
     */
    blacketPermissions?: PermissionType[];
    /**
     * The category the command belongs to
     */
    category?: string;
    /**
     * The cooldown of the command in seconds
     */
    cooldown?: number;
    /**
     * Whether the command shown on the main help page
     */
    favourite?: boolean;
};

/**
 * Defines the structure of a command.
 */
export type Command = {
    /**
     * The data for the command
     */
    data: (RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody) & { description: string, integration_types: number[], contexts: number[] };
    /**
     * The custom options for the command
     */
    opt?: CustomOptions;
    /**
     * The function to execute when the command is called
     *
     * @param interaction - The interaction of the command
     */
    execute(interaction: CommandInteraction): Promise<void> | void;
};