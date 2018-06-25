const Discord = require('discord.js');
const {
  history, swamp, ping, gains, losses, earnings, help, adminAddHistory,
} = require('./commands');
const { processGamblingResult } = require('./utilities');

const client = new Discord.Client();
const config = require('./config.json');

client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setUsername('Your Gambling Addiction'); // Reset Name
  client.user.setActivity('with your savings');
});

client.on('guildCreate', (guild) => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('guildDelete', (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('message', (origMessage) => {
  const message = Object.freeze(Object.assign({}, origMessage));
  // console.log(message);
  // Admins only (debug)
  // if (config.admins.includes(message.author.id)) {
  //   processGamblingResult(message);
  // } else {
  //   console.log('[debug] Ignoring because from non-white-listed person', message.author.id);
  // }

  // Listen to BoxBot
  if (message.author.id === '413728456942288896' && message.author.bot) {
    processGamblingResult(message);
  }

  if (message.author.bot) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.content.indexOf(config.prefix) !== 0) return;
  // const currentUser = message.author.id;
  // const username = message.author.username;

  // Command Switchboard!
  switch (command) {
    case 'hist':
    case 'history':
      history(message);
      break;
    case 'ping':
      ping(message, client);
      break;
    case 'swamp':
      swamp(message);
      break;
    case 'won':
    case 'win':
    case 'wins':
    case 'winnings:
    case 'gains':
      gains(message);
      break;
    case 'lost':
    case 'loss':
    case 'losses':
      losses(message);
      break;
    case 'earn':
    case 'earned':
    case 'earnings':
      earnings(message);
      break;
    case 'h':
    case 'help':
      help(message);
      break;
    case 'add':
      if (config.admins.includes(message.author.id)) {
        adminAddHistory(message, args);
      }
      break;
    default:
      console.log('Unknown command:', command);
      break;
  }
});

client.login(config.token);
