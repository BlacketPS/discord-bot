import { type ChatInputCommandInteraction, ApplicationCommandOptionType } from 'discord.js';

import type { Command } from '../../structures/command.js';
import { getUser } from '../../database/user.js';
import { sendUserEmbed } from '../../misc/user.js';



export default {
    data: {
        name: 'user',
        description: 'Get and display information about a user.',
		options: [
			{
				name: 'user',
				type: ApplicationCommandOptionType.String,
				description: 'The user to get information about.'
			}
		]
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Blacket',
        cooldown: 5
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const userLookup = await getUser(interaction, interaction.options.getString('user'));

        await sendUserEmbed(interaction, userLookup);
    }
} satisfies Command;