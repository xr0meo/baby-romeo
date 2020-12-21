require('dotenv').config()
const Discord = require('discord.js');
const search = require('youtube-search');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const searchTerm = 'kodak black skr';

function getVideoUrl(searchTerm) {
    const opts = {
        maxResults: 1,
        key: process.env.YT_KEY
      };
      search(searchTerm, opts, function(err, result) {
        if(err) return console.log(err);
        console.log(result[0].link)
      });
}

getVideoUrl(searchTerm);