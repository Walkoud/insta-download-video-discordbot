/*
██╗    ██╗ █████╗ ██╗     ██╗  ██╗ ██████╗ ██╗   ██╗██████╗       ██╗██████╗ 
██║    ██║██╔══██╗██║     ██║ ██╔╝██╔═══██╗██║   ██║██╔══██╗     ██╔╝╚════██╗
██║ █╗ ██║███████║██║     █████╔╝ ██║   ██║██║   ██║██║  ██║    ██╔╝  █████╔╝
██║███╗██║██╔══██║██║     ██╔═██╗ ██║   ██║██║   ██║██║  ██║    ╚██╗  ╚═══██╗
╚███╔███╔╝██║  ██║███████╗██║  ██╗╚██████╔╝╚██████╔╝██████╔╝     ╚██╗██████╔╝
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝       ╚═╝╚═════╝ 
                                                                             

github.com/Walkoud/insta-download-video-discordbot

 please leave a star <3
                                                    
*/



const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const instagramDl = require("@sasmeee/igdl");
const axios = require('axios');
const fs = require('fs');

let config = require("./config.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});





// Command Usage: !instadel url




client.on('messageCreate', message => {
  // Check if the message author is a bot
  if (message.author.bot) return;

  // Check if the message starts with the desired prefix (e.g., '!')
  if (message.content.startsWith(config.prefix)) {
    // Get the message content without the prefix
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Example commands
    if (command === 'ping') {
      message.reply('Pong!');
    } else if (command === 'hello') {
      message.channel.send('Hello!');
    }

    if (command === config.commandname) { // Handle specific command
      deleteMessage(message);

      let videoUrl = args[0];
      if (!videoUrl) return message.reply("Please specify a video URL...").then((m) => { deleteMessage(m) });

      async function getVideo() {
        try {
          const dataList = await instagramDl(videoUrl);
          console.log(dataList[0].download_link);
          return dataList;
        } catch {
          message.reply("Error: Invalid Video URL...").then((m) => { deleteMessage(m) });
          return;
        }
      }

      async function sendVideo(fileName) {
        try {
          await message.channel.send({ files: [fileName] });
          message.reply('The video has been successfully sent!').then((m) => { deleteMessage(m) });
        } catch (error) {
          console.error('Error sending the video:', error);
          message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
        }
      }

      start();

      async function start() {
        let dataList = await getVideo();
        if (!dataList) return;
        let videoURL = dataList[0].download_link;

        try {
            const response = await axios.get(videoURL, { responseType: 'stream' });
            let count = 1;
            let fileName = 'temp_video.mp4';
  
            while (fs.existsSync(fileName)) {
              fileName = `temp_video_${count}.mp4`;
              count++;
            }
  
            const writer = fs.createWriteStream(fileName);
            response.data.pipe(writer);
  
            writer.on('finish', async () => {
              await sendVideo(fileName);
              fs.unlinkSync(fileName);
            });
          } catch (error) {
            console.error('Error downloading or sending the video:', error);
            message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
          }
      }
    }
  }
});

function deleteMessage(message) {
  setTimeout(() => {
    message.delete();
  }, 3000);
}

client.login(config.token);
