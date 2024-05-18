import { ChatInputCommandInteraction, UserContextMenuCommandInteraction } from "discord.js"
import { UserDiscord } from "../models"

export async function getUser(interaction: ChatInputCommandInteraction<'cached'> | UserContextMenuCommandInteraction<'cached'>, id: string) {
	const pingedUserId = id?.match(/<@!?(\d+)>/)?.[1];

	if (!id || pingedUserId) {
		const userDiscord = await interaction.client.sequelize.getRepository(UserDiscord).findOne({
			where: {
				discordId: pingedUserId ?? interaction.user.id
			}
		}).catch(() => { throw new Error('User not found') })

		return userDiscord.userId;
	}

	const userDiscord = await interaction.client.sequelize.getRepository(UserDiscord).findOne({
		where: {
			discordId: id
		}
	})

	if (userDiscord) return userDiscord.userId;

	return id;
}