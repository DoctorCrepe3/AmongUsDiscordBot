const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listlobbies')
        .setDescription('Lists all active lobbies.'),

    async execute(interaction) {
        // Correct path for your project structure
        const filePath = path.join(process.cwd(), 'data', 'lobbies.json');

        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: "No lobby data found.", flags: 64 });
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!data.lobbies || Object.keys(data.lobbies).length === 0) {
            return interaction.reply({ content: "There are no active lobbies.", flags: 64 });
        }

        // Sort by playerCount descending
        const sorted = Object.entries(data.lobbies)
            .sort(([, a], [, b]) => (b.playerCount || 0) - (a.playerCount || 0));

        let output = "";

        for (const [code, lobby] of sorted) {
            const host = lobby.host || "Unknown";
            const playerCount = lobby.playerCount || 0;
            const extraMods = lobby.mods?.length ? lobby.mods.join(", ") : "None";

            output += `**${host}** | Code: \`${code}\` | Players: **${playerCount}** | Extra Mods: **${extraMods}**\n`;
        }

        return interaction.reply({ content: output, flags: 64 });
    }
};