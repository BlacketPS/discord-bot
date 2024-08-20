import { type ChatInputCommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

import type { Command } from '../../structures/command.js';
import { openPack } from 'blacket-types';
import { resolvePackNameToId } from '../../misc/packUtil.js';

export default {
	data: {
		name: 'simopen',
		description: 'Simulate opening one or many packs.',
		options: [
			{
				name: 'pack',
				type: ApplicationCommandOptionType.String,
				description: 'Pack to open.',
				required: true,

			},
			{
				name: 'amount',
				type: ApplicationCommandOptionType.Integer,
				description: 'Number of packs to simulate opening, defaults to one if not set.'
			},
			{
				name: 'booster',
				type: ApplicationCommandOptionType.Integer,
				description: 'Booster chance, defaults to whatever the current Blacket booster is if not set.'
			}
		]
	},
	opt: {
		userPermissions: ['SendMessages'],
		botPermissions: ['SendMessages'],
		category: 'Fun',
		cooldown: 0o05
	},
	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const packName = interaction.options.getString('pack', true);
		const amount = interaction.options.getInteger('amount') ?? 1;
		const booster = interaction.options.getInteger('booster') ?? 1;

		if (amount > 1_000_000) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❗ Error: Amount ❗')
						.setDescription('You cannot open more than 1,000,000 packs at once.')
						.setColor(0x990000)
						.setThumbnail(`${process.env.VITE_CDN_URL}/content/blooks/Error.png`)
						.setTimestamp()
				]
			});
			return;
		}

		try {
			var packId = await resolvePackNameToId(interaction, packName);
		} catch (error) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❗ Error: Pack ❗')
						.setDescription(error.message)
						.setColor(0x990000)
						.setThumbnail(`${process.env.VITE_CDN_URL}/content/blooks/Error.png`)
						.setTimestamp()
				]
			});
			return;
		}


		const packBlooks = await interaction.client.redis.getBlooksFromPack(packId);

		const openedBlooks = await openPack(packId, packBlooks, booster, amount)

		if (typeof openedBlooks === 'number') {
			const blook = packBlooks.filter((blook) => blook.id === openedBlooks)[0];

			const embed = new EmbedBuilder()
				.setTitle(`📦 Pack Opened 📦`)
				.setDescription(`You simulated opening a ${packName} pack and got:\n\n${blook.name}`)
				.setColor(0x00FF00)
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
			return;
		}

		const blookCountString = Object.entries(openedBlooks).map(([blookId, count]) => {
			const blook = packBlooks.filter((blook) => blook.id === parseInt(blookId))[0];

			return `${blook.name} x${count}`;
		}).join('\n');

		const embed = new EmbedBuilder()
			.setTitle(`📦 ${amount} Pack${amount > 0 ? 's' : ''} Opened 📦`)
			.setDescription(`You simulated opening a ${packName} pack and got:\n\n${blookCountString}`)
			.setColor(0x00FF00)
			.setTimestamp();

		await interaction.editReply({ embeds: [embed] });
	}
} satisfies Command;