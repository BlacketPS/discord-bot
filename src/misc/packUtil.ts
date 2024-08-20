import { Pack } from "blacket-types";
import { ChatInputCommandInteraction, inlineCode } from "discord.js";

export async function resolvePackNameToId(interaction: ChatInputCommandInteraction<'cached'>, packName: string): Promise<number> {
	const pack = await interaction.client.sequelize.getRepository(Pack).findOne({
		where: {
			name: packName
		},
		attributes: ['id']
	});

	if (!pack) throw new Error(`No pack with the name ${inlineCode(packName)}!`);

	return pack.id;
}