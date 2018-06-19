const Discord = require("discord.js");
const { history, swamp, habits, ping, writeHistory } = require ('./commands');

const client = new Discord.Client();
const config = require("./config.json");

const messageRegex = /<@!(\d+)> -> .+?(LOST|WON).+?\$(.+?) .+ \$(.+?)\.$/;

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("message", async message => {

  // MAIN BOT LOGIC ENTRY

  // if (message.author.bot && message.author.username === 'BoxBot') {
  //   const mention = message.mentions.users;
  //   let mentionedUser;
  //   // There will only be one user
  //   mention.forEach((key, value, map) => {
  //     mentionedUser = value;
  //   });
  //   const text = message.content;
  //   const isCoinFlip = text.includes('**WON**') || text.includes('**LOST**');
  //   if (!isCoinFlip) return;
  //   const gambleWin = text.includes('**WON**') ? 'won' : 'lost';
  //   const split = text.split(' ');
  //   const gambled = gambleWin === 'won'
  //     ? parseInt(split[5].replace('$', '').replace(',', ''), 10)
  //     : parseInt(split[4].replace('$', '').replace(',', ''), 10);
  //   const amount = gambleWin ? gambled : -gambled;
  //   const total = parseInt(split[split.length - 1].replace('$', '').replace(',', '').slice(0, -1));
  //   addHistory(mentionedUser, amount, total, message.createdTimestamp);
  //   message.channel.send(`Looks like <@!${mentionedUser || 'someone'}> just gambled and ${gambleWin} $${gambled}!`);
  // }

  // Daniel S only (debug)
  if (message.author.id = '151226694588432384') {
    const originalMessage = Object.assign({}, message);
    console.log('original msg', originalMessage)
    const messageContent = originalMessage.content;
    const parsed = messageContent.match(messageRegex);
    console.log('parsed', parsed);
    const mention = message.mentions.users;
    // console.log('mentioned:', mention);
    let mentionedUser;
    let username;
    // Parse Input
    const isCoinFlip = parsed[2] === ('WON') || parsed[2] === ('LOST');
    // If not a coin flip, ignore
    if (!isCoinFlip) return;

    mentionedUser = parsed[1];

    // There will only be one user
    mention.forEach((key, value, map) => {
      const data = map.get(value);
      console.log('data', data);
      username = data.username;
    });
    const gambleWin = parsed[2] === 'WON' ? 'won' : 'lost';
    const gambled = parseFloat(parsed[3].replace('.', ''));
    const total = parseFloat(parsed[4].replace(',', ''));
    const change = gambleWin === 'WON' ? gambled : -gambled;
    // writeHistory(mentionedUser, username, change, total, message.createdTimestamp);
    message.channel.send(`Looks like <@!${mentionedUser || 'someone'}> just gambled and ${gambleWin} $${gambled}!`);
  }

  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const currentUser = message.author.id;
  const username = message.author.username;

  // Command Switchboard!
  switch (command) {
    case 'habits':
      habits(currentUser, message);
      break;
    case 'history':
      history(currentUser, message);
      break;
    case 'ping':
      ping(message, client);
      break;
    case 'swamp':
      swamp(message);
      break;
    case 'fakewin':
      writeHistory(currentUser, username, 1000, 100000, message.createdTimestamp);
      break;
    case 'fakeloss':
      writeHistory(currentUser, username, -500, 50000, message.createdTimestamp);
      break;
    default:
      console.log('Unknown command:', command);
      break;
  }
});

client.login(config.token);
