const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const Discord = require("discord.js");

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ users: [] }).write();

// DB Actions
const createUser = (userId) => db.get('users').push({ id: userId, history: [], total: 0 }).write();
const getUser = (userId) => {
  const value = db.get('users').find({ id: userId }).value();
  if (!value) {
    createUser(userId);
    return getUser(userId);
  }
  return value;
}

const addHistory = (userId, amount, total, timestamp) => {
  if (!userId || !amount || !total || !timestamp) return;
  getUser(userId);
  db.get('users').find({ id: userId }).get('history').push({ timestamp, amount, total }).write();
};

const getHistory = (userId) => getUser(userId).history;

// Command Definitions
const habits = (user) => {
  const value = getUser(user, message);
  console.log(value);
  message.channel.send(`<@!${user}>, your gambling addiction has you at: $${value.total}`);
};

const history = (user, message) => {
  const userHistory = getHistory(user);
  const history = [];
  userHistory.forEach((item) => {
    const date = new Date(item.timestamp)
    dateString = date.toDateString();
    timeString = date.toLocaleTimeString();
    const winString = item.amount < 0 ? `(L: -$${Math.abs(item.amount)})` : `(W: +$${item.amount})`;
    history.push(`<${dateString} ${timeString}> $${item.total} ${winString}`);
  });
  const richEmbed = new Discord.RichEmbed({ description: `Bet history for <@!${user}>` });
  const fieldValue = history.join('\n');
  const footer = ' Wins: 3 | Losses: 3';
  const response = richEmbed.addField('Win Percent: 50%', fieldValue).setFooter(footer);
  message.channel.send(response);
  // message.channel.send(`<@!${user}>, here are your last few bets:
  // this is a test of the formatting
  // (<timestamp here>) Win 12343
  // (<timestamp here>) Lose 12343
  // (<timestamp here>) Win 12343`);
};

const ping = async (message) => {
  console.log('ping!');
  const m = await message.channel.send("Ping?");
  m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
};

const swamp = () => {
  const richEmbed = new Discord.RichEmbed({ description: 'What are you doing in my swamp?' });
  message.channel.send(richEmbed.setImage('https://i.imgur.com/Av9gTzB.gif'));
};

const client = new Discord.Client();
const config = require("./config.json");

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

  // if (message.author.id = '151226694588432384') { // Daniel S only (debug)
  //   console.log(message);
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
  //   addHistory(mentionedUser, amount, message.createdTimestamp);
  //   message.channel.send(`Looks like <@!${mentionedUser || 'someone'}> just gambled and ${gambleWin} $${gambled}!`);
  // }


  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const currentUser = message.author.id;

  // All supported commands
  switch (command) {
    case 'habits':
      habits(currentUser, message);
      break;
    case 'history':
      history(currentUser, message);
      break;
    case 'ping':
      ping(message);
      break;
    case 'swamp':
      swamp();
      break;
    case 'fakewin':
      addHistory(currentUser, 1000, 100000, message.createdTimestamp);
      break;
    case 'fakehistory':
      addHistory(currentUser, -500, 50000, message.createdTimestamp);
      break;
    default:
      console.log('Unknown command:', command);
      break;
  }

  // const habits = (user) => {
  //   const value = getUser(user);
  //   console.log(value);
  //   message.channel.send(`<@!${user}>, your gambling addiction has you at: $${value.total}`);
  // };

  // const history = (user) => {
  //   message.channel.send(`<@!${user}>, here are your last 10 bets:
  //   this is a test of the formatting
  //   (<timestamp here>) Win 12343
  //   (<timestamp here>) Lose 12343
  //   (<timestamp here>) Win 12343`);
  // };

  // const ping = async () => {
  //   console.log('ping!');
  //   const m = await message.channel.send("Ping?");
  //   m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  // };

  // const swamp = () => {
  //   const richEmbed = new Discord.RichEmbed({ description: 'What are you doing in my swamp?' });
  //   message.channel.send(richEmbed.setImage('https://i.imgur.com/Av9gTzB.gif'));
  // };
  // if (command === 'habits') {
  //   const user = message.author.id;
  //   const value = getUser(user);
  //   console.log(value);
  //   message.channel.send(`<@!${user}>, your gambling addiction has you at: $${value.total}`);
  // }

  // if (command === 'history') {
  //   const user = message.author.id;
  //   message.channel.send(`<@!${user}>, here are your last 10 bets:
  //   this is a test of the formatting
  //   (<timestamp here>) Win 12343
  //   (<timestamp here>) Lose 12343
  //   (<timestamp here>) Win 12343`);
  // }

  // if (command === "ping") {
  //   const m = await message.channel.send("Ping?");
  //   m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  // }

  // if (command === 'swamp') {
  //   const richEmbed = new Discord.RichEmbed({ description: 'What are you doing in my swamp?' });
  //   message.channel.send(richEmbed.setImage('https://i.imgur.com/Av9gTzB.gif'));
  // }
});

client.login(config.token);
