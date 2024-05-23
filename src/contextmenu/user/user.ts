import { ApplicationCommandType, type UserContextMenuCommandInteraction } from 'discord.js';
import { ContextMenu } from '../../structures/contextMenu';
import { getUser } from '../../database/user';
import { sendUserEmbed } from '../../misc/user';

export default {
    data: {
        type: ApplicationCommandType.User,
        name: 'View Blacket User',
    },
    async execute(interaction: UserContextMenuCommandInteraction<'cached'>) {
        const userLookup = await getUser(interaction, interaction.targetId);

		await sendUserEmbed(interaction, userLookup)
    }
} satisfies ContextMenu;