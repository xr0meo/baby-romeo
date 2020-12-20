require('dotenv').config()
const Discord = require('discord.js');

const client = new Discord.Client();
client.music = require("discord.js-musicbot-addon");

client.music.start(client, {
    youtubeKey: process.env.YT_API_KEY,
    play: {
        // Usage text for the help command.
        usage: "{{prefix}}play some tunes",
        // Whether or not to exclude the command from the help command.
        exclude: false  
    },

    // Make it so anyone in the voice channel can skip the
    // currently playing song.
    anyoneCanSkip: true,

    // Make it so the owner (you) bypass permissions for music.
    ownerOverMember: true,
    ownerID: "yourDiscordId",

    // The cooldown Object.
    cooldown: {
        // This disables the cooldown. Not recommended.
        enabled: false
    }
});

client.login(process.env.TOKEN);