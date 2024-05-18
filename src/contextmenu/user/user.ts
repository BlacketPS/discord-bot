import { ApplicationCommandType, type UserContextMenuCommandInteraction } from 'discord.js';
import { ContextMenu } from '../../structures/contextMenu';
import { sendUserEmbed } from '../../commands/blacket/user';
import { getUser } from '../../database/user';

export default {
    data: {
        type: ApplicationCommandType.User,
        name: 'View Blacket User',
    },
    async execute(interaction: UserContextMenuCommandInteraction<'cached'>) {
        await interaction.deferReply();

        const userLookup = await getUser(interaction, interaction.targetId);

		await sendUserEmbed(interaction, userLookup)
    }
} satisfies ContextMenu;