Setup Guide:
Follow the Basic steps for making a discord bot, this is assumed you know this already

1. Inside the data folder; add these files: "auinfo.json", "config.json", "discordinfo.json", "lobbies.json"

2. Populating auinfo:
{
    "V_DRAFT": "[input current version of draft mod]",
    "V_ROLES_EXTENSION": "[input current version of roles extension]",
    "V_MIRA": "[input current version of TOUM]",
    "V_SUBMERGED": "[input current version of submerged]",
    "V_ALELULU": "[input current version of alelulu]"
}

3. in your config.json input

{
	"token": "[Your Bots Token]",
	"clientId": "[The client secret of your bot]",
	"guildId": "[The server ID you want the bot to run in]"
}

4. discordinfo.json

{
    "LOBBY_CHANNEL_ID": "[Channel you want the lobby advertisements to post to]",
    "BYPASS_ROLE": "[Role Id of admin bypass role(any role that should be able to always change lobbies settings)]",
    "PING_ROLE": "[what role id should be pinged if chosen to ping]"
}



With this filled out the bot should work automatically, there probably is a better way to organise this? but for now im just going to expect a level of competence
