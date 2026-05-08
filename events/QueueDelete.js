// events/QueueDelete.js

const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const LOBBY_DATA_PATH = path.join(__dirname, '../data/lobbies.json');
const { BYPASS_ROLE } = require('../data/discordinfo.json');

function loadLobbyData() {
    return JSON.parse(fs.readFileSync(LOBBY_DATA_PATH, 'utf8'));
}

function saveLobbyData(data) {
    fs.writeFileSync(LOBBY_DATA_PATH, JSON.stringify(data, null, 4));
}

module.exports = async function QueueDelete(interaction) {

    // Only handle interactions relevant to lobby deletion
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // Staff-only protection
    if (!interaction.member.roles.cache.has(BYPASS_ROLE)) {
        return interaction.reply({
            content: "Only staff can use this.",
            ephemeral: true
        });
    }

    // 
    // DELETE SPECIFIC LOBBY Dropdown
    // 
    if (interaction.isButton() && interaction.customId === 'deleteLobby_specific') {

        const data = loadLobbyData();
        const lobbyCodes = Object.keys(data.lobbies);

        if (lobbyCodes.length === 0) {
            return interaction.reply({
                content: "There are no active lobbies to delete.",
                ephemeral: true
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('deleteLobby_select')
            .setPlaceholder('Select a lobby to delete')
            .addOptions(
                lobbyCodes.map(code => ({
                    label: `Lobby ${code}`,
                    value: code
                }))
            );

        const row = new ActionRowBuilder().addComponents(select);

        return interaction.reply({
            content: "Select the lobby you want to delete:",
            components: [row],
            ephemeral: true
        });
    }

    // 
    // DELETE SPECIFIC LOBBY → DROPDOWN SELECTED
    // 
    if (interaction.isStringSelectMenu() && interaction.customId === 'deleteLobby_select') {

        const code = interaction.values[0];
        let data = loadLobbyData();

        if (!data.lobbies[code]) {
            return interaction.reply({
                content: `Lobby **${code}** no longer exists.`,
                ephemeral: true
            });
        }

        delete data.lobbies[code];
        saveLobbyData(data);

        return interaction.reply({
            content: `Lobby **${code}** has been deleted.`,
            ephemeral: true
        });
    }

    // 
    // DELETE ALL LOBBIES
    // 
    if (interaction.isButton() && interaction.customId === 'deleteLobby_all') {

        let data = loadLobbyData();
        data.lobbies = {};
        saveLobbyData(data);

        return interaction.reply({
            content: 'All lobbies have been deleted.',
            ephemeral: true
        });
    }

    // 
    // CANCEL
    // 
    if (interaction.isButton() && interaction.customId === 'deleteLobby_cancel') {
        return interaction.reply({
            content: 'Lobby deletion cancelled.',
            ephemeral: true
        });
    }
};