const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const { LOBBY_CHANNEL_ID, BYPASS_ROLE } = require('../../data/discordinfo.json');
const LOBBY_DATA_PATH = path.join(__dirname, '../../data/lobbies.json');

function loadLobbyData() {
    return JSON.parse(fs.readFileSync(LOBBY_DATA_PATH, 'utf8'));
}

function saveLobbyData(data) {
    fs.writeFileSync(LOBBY_DATA_PATH, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletelobby')
        .setDescription('Admin: Delete a specific lobby or all lobbies.'),

    async execute(interaction) {

        // Permission check
        if (!interaction.member.roles.cache.has(BYPASS_ROLE)) {
            return interaction.reply({
                content: "Only staff can use this command.",
                ephemeral: true
            });
        }

        // Step 1: Ask admin what they want to do
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('deleteLobby_specific')
                .setLabel('Delete Specific Lobby')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('deleteLobby_all')
                .setLabel('Delete ALL Lobbies')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('deleteLobby_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: "What would you like to delete?",
            components: [row],
            ephemeral: true
        });
    }
};