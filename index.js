require('dotenv').config()
const Discord = require('discord.js');
const yts = require('youtube-search');
const ytdl = require('ytdl-core');
const prefix = '!';

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("ready :)");
});

client.once("reconnecting", () => {
  console.log("reconnecting -.-");
});

client.once("disconnect", () => {
  console.log("disconnect, cu");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send("pls enter a valid command!!!");
  }
});

async function getVideoUrl(searchTerm) {
    const opts = {
        maxResults: 1,
        key: process.env.YT_KEY
    };
    const response = await yts(searchTerm, opts);
    console.log(response);
    return response.results[0].link;
}

async function execute(message, serverQueue) {
  const searchTerm = message.content.split(/ (.+)/)[1];
  console.log(searchTerm);

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
        "you need to be in a voice channel to play music^^"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
        "i need the permissions to join and speak ;)"
        );
    }

    const videoUrl = await getVideoUrl(searchTerm);

    const songInfo = await ytdl.getInfo(videoUrl);
    const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 2,
        playing: true
        };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0], videoUrl);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
    } else {
        serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** has been added to the queue^^`);
    }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "you have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("there is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "you have to be in a voice channel to stop the music!"
    );
    
  if (!serverQueue)
    return message.channel.send("there is no song that I could stop!");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song, videoUrl) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  //serverQueue.textChannel.send(videoUrl);
  serverQueue.textChannel.send(`we are listening now to **${song.title}**`);
}

client.login(process.env.TOKEN);

