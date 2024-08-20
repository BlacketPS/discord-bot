import { EmbedBuilder, type ChatInputCommandInteraction, ApplicationCommandOptionType, bold, ColorResolvable } from 'discord.js';

import type { Command } from '../../structures/command.js';
import { titleTextDiscord } from '../../misc/util.js';

const RarityEmoji = {
    "Common": '<:common:1040120690147328040>',
    "Uncommon": '<:uncommon:1031049539802640445>',
    "Rare": '<:rare:1031049538984742972>',
    "Epic": '<:epic:1031049542361170040>',
    "Legendary": '<:legendary:1031049541107069030>',
    "Chroma": '<:chroma:1031049540658282536>',
    "Mystical": '<:mystical:1031049658266558517>',
    "Unique": '<:unique:1216503452364963880>',
    "Iridescent": '<a:iridescent:1100457898687070318>'
};

export default {
    data: {
        name: 'pack',
        description: 'View pack information.',
		options: [
            {
                name: 'pack',
                type: ApplicationCommandOptionType.String,
                description: 'Pack to see information about.',
                autocomplete: true,
                required: true
            }
        ]
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Blacket',
        cooldown: 5,
		favourite: true
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		const packName = interaction.options.getString('pack', true);

        const pack = await interaction.client.prisma.pack.findFirst({
            where: {
                name: packName
            },
            include: {
                resource: true
            }
        });

        const packBlooks = await interaction.client.redis.getBlooksFromPack(pack.id);
        const sortedPackBlooks = packBlooks.sort((a, b) => a.priority - b.priority);

        const totalChance = packBlooks.reduce((acc, blook) => acc + blook.chance, 0);

        const formattedBlooks = await Promise.all(
            sortedPackBlooks
                .map(async (blook) => {
                    const rarity = await interaction.client.redis.getRarityNameFromId(blook.rarityId);
                    console.log(rarity)
                    const emoji = await RarityEmoji[rarity.name]
                    const chance = (blook.chance / totalChance) * 100;

                    return `${emoji} ${blook.name} (${chance}%)`
                }) 
        );

        const embed = new EmbedBuilder()
            .setColor(pack.innerColor as ColorResolvable)
            .setTitle(pack.name)
            .setDescription(`${bold("Price:")} <:token:1030683509616037948> ${pack.price}

            ${titleTextDiscord("Blooks")}
            ${formattedBlooks.join('\n')}`)
            .setThumbnail(pack.resource.path);

		await interaction.reply({ embeds: [embed] });
    }
} satisfies Command;