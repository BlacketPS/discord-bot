import { type ChatInputCommandInteraction, inlineCode, AttachmentBuilder, EmbedBuilder, TimestampStyles, time, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserContextMenuCommandInteraction } from 'discord.js';

import SimpleEmbedMaker, { SemType } from '../misc/simpleEmbedMaker.js';
import User from '../models/user.model.js';
import { Repository } from 'sequelize-typescript';

import Canvas from '@napi-rs/canvas';
import { Op } from 'sequelize';
import { experienceToLevel } from '../misc/util.js';
import UserDiscord from '../models/userDiscord.model.js';
import UserGroup from '../models/userGroup.model.js';
import Group from '../models/group.model.js';
import Resource from '../models/resource.model.js';

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

async function getDbUser(interaction: ChatInputCommandInteraction<'cached'> | UserContextMenuCommandInteraction<'cached'>, userLookup: any) {
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
		include: [
			{
				model: interaction.client.sequelize.getRepository(UserGroup),
				include: [
					{
						model: interaction.client.sequelize.getRepository(Group),
						include: [
							{
								model: interaction.client.sequelize.getRepository(Resource)
							}
						]
					}
				]
			},
			'avatar', 'banner', 'title', 'discord', 'statistics']
	});

	return user;
}

async function renderRectangleRounded(ctx: Canvas.SKRSContext2D, x: number, y: number, width: number, height: number, radius: number, color: string) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + width, y, x + width, y + height, radius);
	ctx.arcTo(x + width, y + height, x, y + height, radius);
	ctx.arcTo(x, y + height, x, y, radius);
	ctx.arcTo(x, y, x + width, y, radius);
	ctx.closePath();
	ctx.fill();

}

async function renderBadge(ctx: Canvas.SKRSContext2D, scale: number, color: string, i: number, badges: string[], badgeContainersPerRow: number, badgeContainerSize: number, badgeContainerPadding: number, badgeSize: number) {
	const xBadge = 10 * scale + (i % badgeContainersPerRow) * badgeContainerSize;
	const yBadge = (138 + 20) * scale + Math.floor(i / badgeContainersPerRow) * badgeContainerSize;

	const x = xBadge - badgeContainerPadding;
	const y = yBadge - badgeContainerPadding;
	const width = badgeSize + badgeContainerPadding * 2;
	const height = badgeSize + badgeContainerPadding * 2;
	const radius = 10 * scale;

	await renderRectangleRounded(ctx, x, y, width, height, radius, color);

	const badge = await Canvas.loadImage(process.env.RELATIVE_FILE_URL + badges[i]);
	ctx.drawImage(badge, xBadge, yBadge, badgeSize, badgeSize);
}

export async function sendUserEmbed(interaction: any, userLookup: any) {
	const user = await getDbUser(interaction, userLookup);

	if (!user) {
		if (!isNaN(userLookup)) var discUserResolve = await interaction.client.users.fetch(userLookup);

		await interaction.reply({
			embeds: [
				SimpleEmbedMaker({
					type: SemType.ERROR,
					title: 'User not found',
					description: `No user found with the ID/Username ${discUserResolve??false ? discUserResolve : inlineCode(userLookup)}!`
				})
			]
		});
		return;
	}

	
	/**
	 * Constants
	*/
	const scale = 1;
	const primaryColor = '#1f1f1f';
	const levelFilledColor = '#00bfff';
	
	const userLevel = experienceToLevel(user.experience);

	const badgeContainersPerRow = 8;
	const badgeContainerSize = 63 * scale;
	const badgeContainerPadding = 10 * scale;
	const badgeSize = 32 * scale;

	const levelBarX = 148 * scale;
	const levelBarY = 112 * scale;
	const levelBarWidth = 345 * scale;
	const levelBarHeight = 18 * scale;
	const levelBarRadius = 10 * scale;
	const completedLevelWidth = levelBarWidth * ( userLevel % 2 );


	/**
	 * Get user groups and sort them by priority
	 * Then get the badge image paths and assign them to a variable
	 */
	let groups = user.groups.map(group => group.group);
	groups = groups.sort((a, b) => b.priority - a.priority);
	const badges = groups.map(group => group.image.path);

	const badgeHolderContainerSize = Math.ceil(badges.length / badgeContainersPerRow) * badgeContainerSize;

	const sizeX = 494 * scale;
	const sizeY = (138 * scale) + badgeHolderContainerSize;


	/**
	 * Create canvas and context
	 */
	const canvas = Canvas.createCanvas(sizeX, sizeY);
	const ctx = canvas.getContext('2d');

	/**
	 * Render user header
	 * TODO: Move the beginning of the URL to a config file
	 */
	const userAvatar = await Canvas.loadImage(process.env.RELATIVE_FILE_URL + user.avatar.path);
	ctx.drawImage(userAvatar, 0, 0, 111.83 * scale, 128 * scale);

	const userBanner = await Canvas.loadImage(process.env.RELATIVE_FILE_URL + user.banner.path);
	ctx.drawImage(userBanner, 132.83 * scale, 18.6 * scale, 361.29 * scale, 80 * scale);


	/**
	 * Render badges
	 */
	for (let i = 0; i < badges.length; i++) {
		await renderBadge(ctx, scale, primaryColor, i, badges, badgeContainersPerRow, badgeContainerSize, badgeContainerPadding, badgeSize);
	}


	/**
	 * Render level bar
	 */
	await renderRectangleRounded(ctx, levelBarX, levelBarY, levelBarWidth, levelBarHeight, levelBarRadius, primaryColor);
	await renderRectangleRounded(ctx, levelBarX, levelBarY, completedLevelWidth, levelBarHeight, levelBarRadius, levelFilledColor);

	
	/**
	 * Render level star
	 */
	const levelStar = await Canvas.loadImage(process.env.RELATIVE_FILE_URL + "/content/levelStar.png");
	ctx.drawImage(levelStar, 127 * scale, 103 * scale, 35 * scale, 35 * scale);

	
	/**
	 * Render text
	 *  - Level
	 *  - Username
	 *  - Role
	*/
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';

	ctx.font = `${20 * scale}px Titan One`;
	ctx.fillText(Math.floor(userLevel).toString(), 145.5 * scale, 127 * scale);
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 1.5 * scale;
	ctx.strokeText(Math.floor(userLevel).toString(), 145.5 * scale, 127 * scale);

	ctx.shadowColor = '#000000';
	ctx.shadowOffsetX = 2 * scale;
	ctx.shadowOffsetY = 2 * scale;
	ctx.shadowBlur = 1;
	ctx.font = `${32 * scale}px Nunito`;
	ctx.fillText(user.username, 313.475 * scale, 55.6 * scale);

	ctx.font = `${16 * scale}px Nunito`;
	ctx.fillText(user.title.name, 313.475 * scale, 78.6 * scale);

	
	/**
	 * Send embed
	*/
	const userHeaderAttachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'user.png' });

	await interaction.reply({
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
								"\n**Exp:** " + `<:exp:1030683507514687508> ${user.experience.toLocaleString()} [<:level:1030683508596809748> ${Math.floor(userLevel)}]` +
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