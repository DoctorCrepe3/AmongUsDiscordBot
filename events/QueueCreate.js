//
// Basic Setup
//
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

// get id's from discordinfo & path from lobbies
const { LOBBY_CHANNEL_ID, BYPASS_ROLL, PING_ROLE } = require('../data/discordinfo.json');
const LOBBY_DATA_PATH = path.join(__dirname, '../data/lobbies.json');
const {V_DRAFT, V_MIRA, V_SUBMERGED, V_ALELULU, V_ROLES_EXTENSION } = require('../data/auinfo.json');


module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Ignore anything that is not a queue-related button
if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) return;


//
// ignore non-queue interactions, not sure if still needed but it caused problems earlier
//
if (
    !interaction.isButton() &&
    !interaction.isModalSubmit() &&
    !interaction.isStringSelectMenu() &&
    !interaction.isUserSelectMenu()
) return;

// All valid QueueCreate prefixes
const validPrefixes = [
    'createLobbyModal',
    'modSelect_',
    'versionSelect_',
    'customVersionModal_',
    'pingChoice_',
    'addExtraText_',
    'extraTextModal_',
    'continueSettings_',
    'incPlayers_',
    'decPlayers_',
    'toggleStatus_',
    'transferMenu_',
    'transferOwner_',
    'transferOwnerMenu_',
    'transferBoth_',
    'transferBothMenu_',
    'changeHost_',
    'changeHostModal_',
    'endLobby_',
    'confirmEnd_',
    'cancelEnd_'
];

// If the interaction doesn't match any QueueCreate prefix, ignore it
if (!validPrefixes.some(prefix => interaction.customId?.startsWith(prefix))) {
    return;
}

//
// Load and save the Lobby info
//
        function loadLobbyData() {
            return JSON.parse(fs.readFileSync(LOBBY_DATA_PATH, 'utf8'));
        }

        function saveLobbyData(data) {
            fs.writeFileSync(LOBBY_DATA_PATH, JSON.stringify(data, null, 4));
        }

        //
        // Check if people have permissions
        //
        function isManagerOrBypass(interaction, lobby) {
            return (
                interaction.user.id === lobby.manager ||
                interaction.member.roles.cache.has(BYPASS_ROLE)
            );
        }

        // 
        // get a name for a user that doesnt exist
        //
        function getBestName(member) {
            if (!member) return 'Unknown';
            return member.displayName || member.user.globalName || member.user.username;
        }

        //
        // create a row of buttons
        // 
        function buildManagementRow(code) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`incPlayers_${code}`)
                    .setLabel('+ Player')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`decPlayers_${code}`)
                    .setLabel('- Player')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId(`toggleStatus_${code}`)
                    .setLabel('Toggle Status')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`transferMenu_${code}`)
                    .setLabel('Transfer')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`endLobby_${code}`)
                    .setLabel('End Lobby')
                    .setStyle(ButtonStyle.Danger)
            );
        }

        // 
        // Refresh Lobby Message
        // 
async function refreshLobbyMessage(code, interaction) {
    let data = loadLobbyData();
    const lobby = data.lobbies[code];

let channel = interaction.guild.channels.cache.get(lobby.channelId);

    const msg = await channel.messages.fetch(lobby.messageId);


    const { host, region, mods, versions, manager, playerCount, status } = lobby;

    const managerTag = `<@${manager}>`;

    // 
    // Add on additional text
    // 
    let finalText = "";

    if (lobby.extraText && lobby.extraText.trim() !== "") {
        finalText += `${lobby.extraText}\n\n`;
    }

    if (lobby.ping) {
        finalText += PING_ROLE + `\n\n`;
    }

    // 
    // Mod Links
    // 
    let modLines = [];

    if (mods.includes('draft')) {
        modLines.push(`**[Draft ${versions.draft}](https://github.com/Cinnamonpuma/DraftModeTOUM)**`);
    }

    if (mods.includes('roleExtensions')) {
        modLines.push(`**[Role Extension ${versions.roleExtensions}](https://github.com/rewalo/TownOfUsMiraRolesExtension)**`);
    }

    if (mods.includes('submerged')) {
        modLines.push(`**[Submerged ${versions.submerged}](https://github.com/SubmergedAmongUs/Submerged)**`);
    }
    if (mods.includes('alelulu')) {
        modLinespush(`**[Alelulu ${versions.alelulu}](https://townofus.pl/lobby-15-plus)**`);
    }

    // 
    // FINAL MESSAGE PASTE
    // 
    const content = [
        `🎮 **Among Us Lobby Information**`,
        ``,
        `**Host:** ${host}`,
        `**Lobby Manager:** ${managerTag}`,
        '**Code:** ```{code}```',
        `**Players:** **${playerCount}**/15`,
        `**Region:** ${region}`,
        `**Status:** ${status === "in_lobby" ? "In Lobby" : "In Game"}`,
        `**Version:** ${versions.base}`,
        ``,
        finalText,  
        ...modLines, 
    ].join("\n");

await msg.edit({
    content,
    components: [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`incPlayers_${code}`)
                .setLabel('+ Player')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`decPlayers_${code}`)
                .setLabel('- Player')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(`toggleStatus_${code}`)
                .setLabel('Toggle Status')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`transferMenu_${code}`)
                .setLabel('Transfer')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`endLobby_${code}`)
                .setLabel('End Lobby')
                .setStyle(ButtonStyle.Danger)
        )
    ]
});
}

        // 
        // create new lobby
        // 
        if (interaction.isModalSubmit() && interaction.customId === 'createLobbyModal') {

            const host = interaction.fields.getTextInputValue('hostInput');
            const region = interaction.fields.getTextInputValue('regionInput');
            const code = interaction.fields.getTextInputValue('codeInput').toUpperCase();

            let data = loadLobbyData();

            if (data.lobbies[code]) {
                return interaction.reply({
                    content: "A lobby with that code already exists. if it shouldn't please let an admin know",
                    ephemeral: true
                });
            }

            data.lobbies[code] = {
                host,
                region,
                mods: [],
                modsLatest: false,
                versions: {
                    base: V_MIRA,
                    draft: V_DRAFT,
                    roleExtensions: V_ROLES_EXTENSION,
                    submerged: V_SUBMERGED,
                    alelulu: V_ALELULU
                },
                manager: interaction.user.id,
                playerCount: 1,
                status: "in_lobby",
                messageId: null
            };

            saveLobbyData(data);

            //
            // SEND MOD SELECTION MENU
            //
            const modMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`modSelect_${code}`)
                    .setPlaceholder('Select the mods used in this lobby')
                    .setMinValues(0)
                    .setMaxValues(3)
                    .addOptions([
                        {
                            label: 'No Extra Mods',
                            value: 'none'
                        },
                        {
                            label: 'Draft Mode',
                            value: 'draft'
                        },
                        {
                            label: 'Role Extensions',
                            value: 'roleExtensions'
                        },
                        {
                            label: 'Submerged',
                            value: 'submerged'
                        },
                        {
                            label: 'Alelulu',
                            value: 'alelulu'
                        }
                    ])
            );

            return interaction.reply({
                content: `Lobby **${code}** created! Now choose mods.`,
                components: [modMenu],
                ephemeral: true
            });
        }

// Helper: send Additional Lobby Settings UI
async function sendAdditionalLobbySettings(interaction, code) {
    const pingRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`pingChoice_${code}`)
            .setPlaceholder('Ping settings')
            .addOptions([
                { label: 'Admin Ping', value: 'ping' },
                { label: 'No ping', value: 'nopin' }
            ])
    );

    const extrasRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`addExtraText_${code}`)
            .setLabel('Add Additional Text')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId(`continueSettings_${code}`)
            .setLabel('Continue')
            .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
        content: 'Additional Lobby Settings',
        components: [pingRow, extrasRow],
        flags: 64
    });
}



// 
// version select
// 
if (interaction.isStringSelectMenu() && interaction.customId.startsWith('modSelect_')) {

    const code = interaction.customId.split('_')[1];
    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    const selected = interaction.values;

    // If "No Extra Mods" selected → lock permanently
    if (selected.includes("none")) {
        lobby.mods = []; // store empty array
        saveLobbyData(data);

        const versionMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`versionSelect_${code}`)
                .setPlaceholder('Select version mode')
                .addOptions([
                    {
                        label: 'Use Latest Versions',
                        value: 'latest'
                    },
                    {
                        label: 'Use Custom Versions',
                        value: 'custom'
                    }
                ])
        );

await interaction.deferUpdate();

return interaction.followUp({
    content: "No extra mods selected. Now choose version mode.",
    components: [versionMenu],
    ephemeral: true
});
    }

    // Otherwise, store selected mods normally
    lobby.mods = selected;
    saveLobbyData(data);

    const versionMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`versionSelect_${code}`)
            .setPlaceholder('Select version mode')
            .addOptions([
                {
                    label: 'Use Latest Versions',
                    value: 'latest'
                },
                {
                    label: 'Use Custom Versions',
                    value: 'custom'
                }
            ])
    );

await interaction.deferUpdate();

return interaction.followUp({
    content: "Mods selected. Now choose version mode.",
    components: [versionMenu],
    ephemeral: true
});
}



// 
// VERSION MODAL — Select Menu
// 
if (interaction.isStringSelectMenu() && interaction.customId.startsWith('versionSelect_')) {

    const code = interaction.customId.split('_')[1];
    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    const choice = interaction.values[0];

    // User chose latest versions
    if (choice === "latest") {
        lobby.modsLatest = true;
        saveLobbyData(data);

        // Go straight to Additional Lobby Settings
        return sendAdditionalLobbySettings(interaction, code);
    }

    // User chose custom versions
    if (choice === "custom") {
        lobby.modsLatest = false;
        saveLobbyData(data);

        // Build dynamic modal fields
        const modal = new ModalBuilder()
            .setCustomId(`customVersionModal_${code}`)
            .setTitle('Custom Mod Versions');

        const inputs = [];

        // Town of Us Mira (base) — always
        const baseInput = new TextInputBuilder()
            .setCustomId('baseVersion')
            .setLabel('Town of Us Mira version')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(lobby.versions?.base || V_MIRA);
        inputs.push(baseInput);

        // Draft
        if (lobby.mods.includes('draft')) {
            const draftInput = new TextInputBuilder()
                .setCustomId('draftVersion')
                .setLabel('Draft version')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(lobby.versions?.draft || V_DRAFT);
            inputs.push(draftInput);
        }

        // Role Extensions
        if (lobby.mods.includes('roleExtensions')) {
            const reInput = new TextInputBuilder()
                .setCustomId('roleExtensionsVersion')
                .setLabel('Role Extensions version')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(lobby.versions?.roleExtensions || V_ROLES_EXTENSION);
            inputs.push(reInput);
        }

        // Submerged
        if (lobby.mods.includes('submerged')) {
            const subInput = new TextInputBuilder()
                .setCustomId('submergedVersion')
                .setLabel('Submerged version')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(lobby.versions?.submerged || V_SUBMERGED);
            inputs.push(subInput);
        }

        // Add each input as its own row
        modal.addComponents(
            ...inputs.map(input => new ActionRowBuilder().addComponents(input))
        );

        return interaction.showModal(modal);
    }
}



// 
// CUSTOM VERSION MODAL — Submit
// 
if (interaction.isModalSubmit() && interaction.customId.startsWith('customVersionModal_')) {

    const code = interaction.customId.split('_')[1];
    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    const versions = { ...lobby.versions };

    versions.base = interaction.fields.getTextInputValue('baseVersion');

    if (lobby.mods.includes('draft')) {
        versions.draft = interaction.fields.getTextInputValue('draftVersion');
    }

    if (lobby.mods.includes('roleExtensions')) {
        versions.roleExtensions = interaction.fields.getTextInputValue('roleExtensionsVersion');
    }

    if (lobby.mods.includes('submerged')) {
        versions.submerged = interaction.fields.getTextInputValue('submergedVersion');
    }

    lobby.versions = versions;
    saveLobbyData(data);

    // Now go to Additional Lobby Settings
    return sendAdditionalLobbySettings(interaction, code);
}



// 
// Ping settings
// 
if (interaction.isStringSelectMenu() && interaction.customId.startsWith('pingChoice_')) {
    const code = interaction.customId.split('_')[1];
    const choice = interaction.values[0];

    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    lobby.ping = (choice === 'ping');
    saveLobbyData(data);

    await interaction.deferUpdate();

return interaction.followUp({
    content: "Ping setting updated.",
    ephemeral: true
});
}



// 
// Additional Text
// 
if (interaction.isButton() && interaction.customId.startsWith('addExtraText_')) {
    const code = interaction.customId.split('_')[1];

    const modal = new ModalBuilder()
        .setCustomId(`extraTextModal_${code}`)
        .setTitle('Additional Text');

    const textInput = new TextInputBuilder()
        .setCustomId('extraText')
        .setLabel('Enter additional text')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(textInput));

    return interaction.showModal(modal);
}



// 
// ADDITIONAL TEXT — Modal Submit
// 
if (interaction.isModalSubmit() && interaction.customId.startsWith('extraTextModal_')) {
    const code = interaction.customId.split('_')[1];
    const text = interaction.fields.getTextInputValue('extraText');

    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    lobby.extraText = text;
    saveLobbyData(data);

    // Instead of stopping here, re-show the settings UI
    return sendAdditionalLobbySettings(interaction, code);
}



// 
// Lobby Post
// 
if (interaction.isButton() && interaction.customId.startsWith('continueSettings_')) {
    const code = interaction.customId.split('_')[1];

let data = loadLobbyData();
const lobby = data.lobbies[code];

// Choose correct channel based on ping setting
let channel = interaction.guild.channels.cache.get(
    LOBBY_CHANNEL_ID
);

const msg = await channel.send("Creating lobby post...");


lobby.channelId = channel.id;
lobby.messageId = msg.id;
saveLobbyData(data);

    await refreshLobbyMessage(code, interaction);

await interaction.deferUpdate();

return interaction.followUp({
    content: "Lobby posted!",
    ephemeral: true
});
}


//
// PLAYER COUNT — Increase
//
if (interaction.isButton() && interaction.customId.startsWith('incPlayers_')) {

    const code = interaction.customId.split('_')[1];
    let data = loadLobbyData();
    const lobby = data.lobbies[code];


    if (!isManagerOrBypass(interaction, lobby)) {
        return interaction.reply({ content: "You are not the lobby manager.", ephemeral: true });
    }

    if (lobby.playerCount < 15) {
        lobby.playerCount++;
        saveLobbyData(data);
        await refreshLobbyMessage(code, interaction);
    }

    return interaction.deferUpdate();
}
        //
        // PLAYER COUNT — Decrease
        //
        if (interaction.isButton() && interaction.customId.startsWith('decPlayers_')) {

            const code = interaction.customId.split('_')[1];
            let data = loadLobbyData();
            const lobby = data.lobbies[code];

            if (!isManagerOrBypass(interaction, lobby)) {
                return interaction.reply({ content: "You are not the lobby manager.", ephemeral: true });
            }

            if (lobby.playerCount > 1) {
                lobby.playerCount--;
                saveLobbyData(data);
                await refreshLobbyMessage(code, interaction);
            }

            return interaction.deferUpdate();
        }

        //
        // STATUS TOGGLE
        //
        if (interaction.isButton() && interaction.customId.startsWith('toggleStatus_')) {

            const code = interaction.customId.split('_')[1];
            let data = loadLobbyData();
            const lobby = data.lobbies[code];

            if (!isManagerOrBypass(interaction, lobby)) {
                return interaction.reply({ content: "You are not the lobby manager.", ephemeral: true });
            }

            lobby.status = lobby.status === "in_lobby" ? "in_game" : "in_lobby";
            saveLobbyData(data);

            await refreshLobbyMessage(code, interaction);
            return interaction.deferUpdate();
        }

        // 
        // TRANSFER MENU
        // 
        if (interaction.isButton() && interaction.customId.startsWith('transferMenu_')) {

            const code = interaction.customId.split('_')[1];
            let data = loadLobbyData();
            const lobby = data.lobbies[code];

            if (!isManagerOrBypass(interaction, lobby)) {
                return interaction.reply({
                    content: "You are not the lobby manager.",
                    ephemeral: true
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`transferOwner_${code}`)
                    .setLabel('Transfer Manager')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`changeHost_${code}`)
                    .setLabel('Change Host Name')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`transferBoth_${code}`)
                    .setLabel('Transfer & Set Host')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`cancelTransfer_${code}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

await interaction.deferUpdate();

return interaction.followUp({
    content: `Transfer options for lobby **${code}**:`,
    components: [row],
    ephemeral: true
});
        }

        // 
        // TRANSFER MENU — Cancel
        // 
        if (interaction.isButton() && interaction.customId.startsWith('cancelTransfer_')) {
            return interaction.update({
                content: "Transfer menu closed.",
                components: []
            });
        }

// 
// CHANGE HOST — MODAL
// 
if (interaction.isButton() && interaction.customId.startsWith('changeHost_')) {
    const code = interaction.customId.split('_')[1];

    const modal = new ModalBuilder()
        .setCustomId(`changeHostModal_${code}`)
        .setTitle('Change Host Name');

    const hostInput = new TextInputBuilder()
        .setCustomId('newHost')
        .setLabel('Enter the new host name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(hostInput));

    return interaction.showModal(modal);
}

if (interaction.isModalSubmit() && interaction.customId.startsWith('changeHostModal_')) {
    const code = interaction.customId.split('_')[1];
    const newHost = interaction.fields.getTextInputValue('newHost');

    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    if (!lobby) {
        return interaction.reply({ content: "Lobby not found.", flags: 64 });
    }

    lobby.host = newHost;
    saveLobbyData(data);

    await refreshLobbyMessage(code, interaction);

    return interaction.reply({
        content: `Host name updated to **${newHost}**.`,
        flags: 64
    });
}



// 
// TRANSFER MANAGER — USER SELECT MENU
// 
if (interaction.isButton() && interaction.customId.startsWith('transferOwner_')) {
    const code = interaction.customId.split('_')[1];

    const menu = new UserSelectMenuBuilder()
        .setCustomId(`transferOwnerMenu_${code}`)
        .setPlaceholder('Select the new manager')
        .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(menu);

await interaction.deferUpdate();

return interaction.followUp({
    content: "Choose the new manager:",
    components: [row],
    ephemeral: true
});
}

if (interaction.isUserSelectMenu() && interaction.customId.startsWith('transferOwnerMenu_')) {
    const code = interaction.customId.split('_')[1];
    const newManager = interaction.values[0];

    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    if (!lobby) {
        return interaction.reply({ content: "Lobby not found.", flags: 64 });
    }

    lobby.manager = newManager;
    saveLobbyData(data);

    await refreshLobbyMessage(code, interaction);

    return interaction.reply({
        content: `Manager transferred to <@${newManager}>.`,
        flags: 64
    });
}



// 
// TRANSFER MANAGER + SET HOST — USER SELECT MENU
// 
if (interaction.isButton() && interaction.customId.startsWith('transferBoth_')) {
    const code = interaction.customId.split('_')[1];

    const menu = new UserSelectMenuBuilder()
        .setCustomId(`transferBothMenu_${code}`)
        .setPlaceholder('Select the new manager')
        .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(menu);

await interaction.deferUpdate();

return interaction.followUp({
    content: "Choose the new manager (host will match their display name):",
    components: [row],
    ephemeral: true
});
}

if (interaction.isUserSelectMenu() && interaction.customId.startsWith('transferBothMenu_')) {
    const code = interaction.customId.split('_')[1];
    const newManager = interaction.values[0];

    let data = loadLobbyData();
    const lobby = data.lobbies[code];

    if (!lobby) {
        return interaction.reply({ content: "Lobby not found.", flags: 64 });
    }

    const member = await interaction.guild.members.fetch(newManager).catch(() => null);
    const bestName = member?.displayName || member?.user?.username || "Unknown";

    lobby.manager = newManager;
    lobby.host = bestName;

    saveLobbyData(data);

    await refreshLobbyMessage(code, interaction);

    return interaction.reply({
        content: `Manager transferred to <@${newManager}> and host set to **${bestName}**.`,
        flags: 64
    });
}

        // 
        // END LOBBY — Confirmation Menu
        // 
        if (interaction.isButton() && interaction.customId.startsWith('endLobby_')) {

            const code = interaction.customId.split('_')[1];
            let data = loadLobbyData();
            const lobby = data.lobbies[code];

            if (!isManagerOrBypass(interaction, lobby)) {
                return interaction.reply({
                    content: "You are not the lobby manager.",
                    ephemeral: true
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirmEnd_${code}`)
                    .setLabel('Yes, End Lobby')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId(`cancelEnd_${code}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

await interaction.deferUpdate();

return interaction.followUp({
    content: `Are you sure you want to end lobby **${code}**?`,
    components: [row],
    ephemeral: true
});
        }

        // 
        // END LOBBY — Cancel
        // 
        if (interaction.isButton() && interaction.customId.startsWith('cancelEnd_')) {
            return interaction.update({
                content: "Lobby end cancelled.",
                components: []
            });
        }

        // 
        // END LOBBY — Confirm & Delete
        // 
        if (interaction.isButton() && interaction.customId.startsWith('confirmEnd_')) {

            const code = interaction.customId.split('_')[1];
            let data = loadLobbyData();

            const lobby = data.lobbies[code];
            if (!lobby) {
                return interaction.update({
                    content: "Lobby not found. It may have already been closed.",
                    components: []
                });
            }

            if (!isManagerOrBypass(interaction, lobby)) {
                return interaction.update({
                    content: "You are not the lobby manager.",
                    components: []
                });
            }

            const channel = interaction.guild.channels.cache.get(lobby.channelId);

            try {
                const msg = await channel.messages.fetch(lobby.messageId);
                await msg.edit({
                    content: `❌ **Lobby ${code} has been closed.**`,
                    components: []
                });
            } catch (err) {
                // Message might be deleted — ignore safely
            }

            delete data.lobbies[code];
            saveLobbyData(data);

            return interaction.update({
                content: `Lobby **${code}** has been closed and removed.`,
                components: []
            });
        }
    }
};
