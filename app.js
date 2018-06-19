const Discord = require("discord.js");
const { history, swamp, habits, ping, writeHistory } = require ('./commands');

const client = new Discord.Client();
const config = require("./config.json");

const messageRegex = /<@!(\d+)> -> .+?(LOST|WON).+?\$(.+?) .+ \$(.+?)\.$/g;

function normalizeAmount(amount) {
  return parseFloat(amount.replace(/\,/g, ''), 10)
}

function processGamblingResult(message) {
  const parsed = messageRegex.exec(message.content)
  console.log('parsed', parsed);
  if (!parsed) {
    // It's not a gambling message
    console.log('[debug] Ignoring because not a gambling message')
    return;
  }
  let [, userId, status, amountBet, totalAmount] = parsed;
  const mentionedUsers = message.mentions.users;
  const mentionedUser = mentionedUsers.get(userId);

  status = status.toLowerCase();
  amountBet = normalizeAmount(amountBet);
  totalAmount = normalizeAmount(totalAmount);
  if (mentionedUser) {
    writeHistory(userId, mentionedUser.username, amountBet, totalAmount, message.createdTimestamp);
  }
  message.channel.send(`Looks like <@!${userId}> just gambled and ${status} $${amountBet}!`);
}

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

client.on("message", origMessage => {
  const message = Object.freeze(Object.assign({}, origMessage)); // spread does not work here, i tried already :(
  console.log(message);
  // Admins only (debug)
  // if (message.author.id === '151226694588432384' || message.author.id === '203243677731127297') {
  //   processGamblingResult(message);
  // } else {
  //   console.log('[debug] Ignoring because from non-white-listed person', message.author.id);
  // }
  if (message.author.id === '413728456942288896' && message.author.bot) {
    processGamblingResult(message);
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
