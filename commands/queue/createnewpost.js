const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createnewpost')
        .setDescription('Create a new Among Us lobby post.'),

    async execute(interaction) {

        // Create modal
        const modal = new ModalBuilder()
            .setCustomId('createLobbyModal')
            .setTitle('Create New Lobby');

        // Host input
        const hostInput = new TextInputBuilder()
            .setCustomId('hostInput')
            .setLabel('Host Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Example: Doc')
            .setRequired(true);

        // Region input
        const regionInput = new TextInputBuilder()
            .setCustomId('regionInput')
            .setLabel('Region (MEU/MNA/MASIA)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Example: MEU')
            .setRequired(true);

        // Code input
        const codeInput = new TextInputBuilder()
            .setCustomId('codeInput')
            .setLabel('Lobby Code')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Example: ABCDEF')
            .setRequired(true);

        // Build rows
        const row1 = new ActionRowBuilder().addComponents(hostInput);
        const row2 = new ActionRowBuilder().addComponents(regionInput);
        const row3 = new ActionRowBuilder().addComponents(codeInput);

        modal.addComponents(row1, row2, row3);

        // Show modal
        await interaction.showModal(modal);
    }
};