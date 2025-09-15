import { EmbedBuilder, type ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

import type { Command } from '../../structures/command.js';

export default {
    data: {
        name: 'unlink',
        description: 'Unlink your Discord and Blacket account.',
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Blacket',
        cooldown: 15,
        favourite: true
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
        const user = interaction.user;

        const linkedUser = await interaction.client.prisma.userDiscord.findFirst({
            where: {
                discordId: user.id
            }
        });

        if (!linkedUser) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error: Unlink')
                        .setDescription('You are not linked to any Blacket account.')
                        .setColor(0x990000)
                        .setThumbnail(`${process.env.VITE_MEDIA_URL}/content/icons/error.png`)
                        .setTimestamp()
                ],
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Unlinking your account')
            .setDescription('Unlinking your account will cause you to lose access to commands through Discord as well as easy personal commands.')
            .setColor(0x2b2d31);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Confirm unlink account')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('unlink')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
} satisfies Command;
