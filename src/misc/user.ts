import { type ChatInputCommandInteraction, inlineCode, AttachmentBuilder, EmbedBuilder, TimestampStyles, time, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserContextMenuCommandInteraction } from 'discord.js';

import SimpleEmbedMaker, { SemType } from '../misc/simpleEmbedMaker.js';
import User from '../models/user.model.js';
import { Repository } from 'sequelize-typescript';

import Canvas from '@napi-rs/canvas';
import { Op } from 'sequelize';
import { experienceToLevel } from '../misc/util.js';
import UserDiscord from '../models/userDiscord.model.js';

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

export async function sendUserEmbed(interaction: any, userLookup: any) {
	const UserRepo: Repository<User> = interaction.client.sequelize.getRepository(User);
		const user = await UserRepo.findOne({
			where: {
				[Op.or]: [
					{
						id: userLookup
					},
					{
						username: userLookup
					}
				]
			},
			include: ['avatar', 'banner', 'title', 'discord', 'statistics']
		});

		if (!user) {
			const discUserResolve = await interaction.client.users.fetch(userLookup);
			await interaction.editReply({
				embeds: [
					SimpleEmbedMaker({
						type: SemType.ERROR,
						title: 'User not found',
						description: `No user found with the ID/Username ${discUserResolve ? discUserResolve : inlineCode(userLookup)}!`
					})
				]
			});
			return;
		}

		// user header creation
		const userHeaderCanvas = Canvas.createCanvas(494, 138);
		const userHeaderCtx = userHeaderCanvas.getContext('2d');

		const userAvatar = await Canvas.loadImage("https://rewrite.blacket.org" + user.avatar.path);
		userHeaderCtx.drawImage(userAvatar, 0, 0, 111.83, 128);

		const userBanner = await Canvas.loadImage("https://rewrite.blacket.org" + user.banner.path);
		userHeaderCtx.drawImage(userBanner, 132.83, 18.6, 361.29, 80);

		// blank level bar
		userHeaderCtx.fillStyle = '#2f2f2f'

		const level = experienceToLevel(user.experience);

		const x = 148;
		const y = 112;
		const width = 345;
		const height = 18;
		const radius = 10;

		userHeaderCtx.beginPath();
		userHeaderCtx.moveTo(x + radius, y);
		userHeaderCtx.arcTo(x + width, y, x + width, y + height, radius);
		userHeaderCtx.arcTo(x + width, y + height, x, y + height, radius);
		userHeaderCtx.arcTo(x, y + height, x, y, radius);
		userHeaderCtx.arcTo(x, y, x + width, y, radius);
		userHeaderCtx.closePath();

		userHeaderCtx.fill();

		// level bar filled
		userHeaderCtx.fillStyle = '#00bfff'

		const levelWidth = width * ( level % 2 );

		userHeaderCtx.beginPath();
		userHeaderCtx.moveTo(x + radius, y);
		userHeaderCtx.arcTo(x + levelWidth, y, x + levelWidth, y + height, radius);
		userHeaderCtx.arcTo(x + levelWidth, y + height, x, y + height, radius);
		userHeaderCtx.arcTo(x, y + height, x, y, radius);
		userHeaderCtx.arcTo(x, y, x + levelWidth, y, radius);
		userHeaderCtx.closePath();

		userHeaderCtx.fill();

		const levelStar = await Canvas.loadImage("https://rewrite.blacket.org/content/levelStar.png");
		userHeaderCtx.drawImage(levelStar, 127, 103, 35, 35);

		userHeaderCtx.fillStyle = '#ffffff';
		userHeaderCtx.textAlign = 'center';

		// level
		userHeaderCtx.font = '20px Titan One';
		userHeaderCtx.fillText(Math.floor(level).toString(), 145.5, 127);
		userHeaderCtx.strokeStyle = '#000000';
		userHeaderCtx.lineWidth = 1.5;
		userHeaderCtx.strokeText(Math.floor(level).toString(), 145.5, 127);

		// username
		userHeaderCtx.shadowColor = '#000000';
		userHeaderCtx.shadowOffsetX = 2;
		userHeaderCtx.shadowOffsetY = 2;
		userHeaderCtx.shadowBlur = 1;
		userHeaderCtx.font = '32px Nunito';
		userHeaderCtx.fillText(user.username, 313.475, 55.6);

		// role
		userHeaderCtx.font = '16px Nunito';
		userHeaderCtx.fillText(user.title.name, 313.475, 78.6);

		const userHeaderAttachment = new AttachmentBuilder(await userHeaderCanvas.encode('png'), { name: 'user.png' });

		// swnd
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x2b2d31)
					.setImage('attachment://user.png'),
				new EmbedBuilder()
					.setColor(0x2b2d31)
					.setFields([
						{
							name: '__``Stats``__',
							value: 	"**Tokens:** " + `<:token:1030683509616037948> ${user.tokens.toLocaleString()}` +
									"\n**Exp:** " + `<:exp:1030683507514687508> ${user.experience.toLocaleString()} [<:level:1030683508596809748> ${Math.floor(level)}]` +
									"\n**Packs Opened:** " + `<:openedIcon:1045911376494874646> ${user.statistics.packsOpened.toLocaleString()}`,
							inline: true
						},
						{
							name: '__``User Info``__',
							value: 	"**Messages:** " + `<:messagesIcon:1045939184562602046> ${user.statistics.messagesSent.toLocaleString()}` +
									"\n**Discord:** " + (user.discord ? userMention(user.discord.discordId) : "No linked account") +
									"\n**Joined:** " + time(user.createdAt, TimestampStyles.ShortDate) +
									"\n**Last Seen:** " + time(user.updatedAt, TimestampStyles.RelativeTime),
							inline: true
						},
						{
							name: '__``Standing``__',
							value: 	"**Banned:** " + "<:error:1033851534754201832>" +
									"\n**Muted:** " + "<:error:1033851534754201832>",
							inline: true
						},
					])
					.setFooter({ text: `ID: ${user.id}  •  Clan: None` })
					.setImage('https://i.imgur.com/8NdaHgw.png')
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setLabel('View Profile')
							.setURL(`https://rewrite.blacket.org/stats?name=${user.id}`)
							.setStyle(ButtonStyle.Link),
						new ButtonBuilder()
							.setLabel('View Clan')
							.setURL(`https://rewrite.blacket.org/stats?name=${user.id}`)
							.setStyle(ButtonStyle.Link)
					),
			],
			files: [userHeaderAttachment],
		});
}