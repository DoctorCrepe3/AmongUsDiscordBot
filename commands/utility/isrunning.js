const { SlashCommandBuilder, MessageFlags} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('isrunning').setDescription('Check whether the bot is running.'),
	async execute(interaction) {
		await interaction.reply({
			content: 'The bot is running, if you are experiencing problems, please contact doctorCrepe',
			flags: MessageFlags.Ephemeral,
		});
	},
};