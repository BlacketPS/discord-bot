import { type ChatInputCommandInteraction, inlineCode, ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } from 'discord.js';

import type { Command } from '../../structures/command.js';
import SimpleEmbedMaker, { SemType } from '../../misc/simpleEmbedMaker.js';
import User from '../../models/user.model.js';
import { Repository } from 'sequelize-typescript';

import Canvas from '@napi-rs/canvas';
import { Op } from 'sequelize';
import { experienceToLevel } from '../../misc/util.js';

export default {
    data: {
        name: 'user',
        description: 'Get and display information about a user.',
		options: [
			{
				name: 'user',
				type: ApplicationCommandOptionType.String,
				description: 'The user to get information about.',
				required: true
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

        const UserRepo: Repository<User> = interaction.client.sequelize.getRepository(User);
		const user = await UserRepo.findOne({
			where: {
				[Op.or]: [
					{
						id: interaction.options.getString('user')
					},
					{
						username: interaction.options.getString('user')
					}
				]
			},
			include: ['avatar', 'banner', 'title']
		});

		if (!user) {
			await interaction.editReply({
				embeds: [
					SimpleEmbedMaker({
						type: SemType.ERROR,
						title: 'User not found',
						description: `No user found with the ID/Username ${inlineCode(interaction.options.getString('user'))}!`
					})
				]
			});
			return;
		}

		console.log(user)

		const start = Date.now();
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

		console.log(level)

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

		console.log(`User header took ${Date.now() - start}ms`);

		// swnd
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x2b2d31)
					.setImage('attachment://user.png'),
				new EmbedBuilder()
					.setColor(0x2b2d31)
					.setDescription("nother image here for shit")
					.setImage('https://i.imgur.com/8NdaHgw.png'),
				new EmbedBuilder()
					.setColor(0x2b2d31)
					.setDescription(`[View Profile](https://rewrite.blacket.org/stats?name=${user.id})`)
					.setImage('https://i.imgur.com/8NdaHgw.png')
					.setTimestamp(new Date())
			],
			files: [userHeaderAttachment],
		});
    }
} satisfies Command;