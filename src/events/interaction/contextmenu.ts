import { Events, inlineCode } from 'discord.js';

import type { Event } from '../../structures/event.js';
import simpleEmbedMaker, { SemType } from '../../misc/simpleEmbedMaker.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isContextMenuCommand()) return;
        if (!interaction.inCachedGuild()) return;

        const contextMenu = interaction.client.contextMenus.get(interaction.commandName);

        if (!contextMenu?.data) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            await interaction.reply({
                embeds: [
                    simpleEmbedMaker({
                        type: SemType.ERROR,
                        title: 'No command',
                        description: `There is no command matching ${inlineCode(interaction.commandName)}!`
                    })
                ],
                ephemeral: true,
            });
            return;
        };

		try {
			await contextMenu.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [
						simpleEmbedMaker({
							type: SemType.ERROR,
							title: 'Unknown',
							description: `There was an error while executing this command: \n${error.message} \nCheck the console for more info.`
						})
					],
					ephemeral: true
				});
			} else {
				await interaction.reply({
					embeds: [
						simpleEmbedMaker({
							type: SemType.ERROR,
							title: 'Unknown',
							description: `There was an error while executing this command: \n${error.message} \nCheck the console for more info.`
						})
					],
					ephemeral: true
				});
			}
		}
    }
} satisfies Event<Events.InteractionCreate>;