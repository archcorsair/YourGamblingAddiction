const Discord = require("discord.js");
const { history, swamp, ping, writeHistory, gains, losses, earnings, help } = require ('./commands');
const client = new Discord.Client();
const config = require("./config.json");

const messageRegex = /<@!(\d+)> -> .+?(LOST|WON).+?\$(.+?) .+ \$(.+?)\.$/;
const normalizeAmount = amount => parseFloat(amount.replace(/\,/g, ''), 10);

const processGamblingResult = (message) => {
  const parsed = messageRegex.exec(message.content)
  if (!parsed) {
    // It's not a gambling message
    console.log('[debug] Ignoring because not a gambling message', parsed, message);
    return;
  }
  let [, userId, status, amountBet, totalAmount] = parsed;
  const mentionedUsers = message.mentions.users;
  const mentionedUser = mentionedUsers.get(userId);

  status = status.toLowerCase();
  amountBet = normalizeAmount(amountBet);
  totalAmount = normalizeAmount(totalAmount);
  if (mentionedUser) {
    const change = status === 'lost' ? -amountBet : amountBet
    writeHistory(userId, mentionedUser.username, change, totalAmount, message.createdTimestamp);
  }
  const icon = status === 'won' ? ':moneybag:' : ':small_red_triangle_down:';
  message.channel.send(`Looks like <@!${userId}> just gambled and ${status} ${icon} $${amountBet}!`);
}

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setUsername('Your Gambling Addiction'); // Reset Name
  client.user.setActivity('with your savings');
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
  const message = Object.freeze(Object.assign({}, origMessage));
  console.log(message);
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
  const currentUser = message.author.id;
  const username = message.author.username;

  // Command Switchboard!
  switch (command) {
    case 'history':
      history(message);
      break;
    case 'ping':
      ping(message, client);
      break;
    case 'swamp':
      swamp(message);
      break;
    case 'gains':
      gains(message);
      break;
    case 'losses':
      losses(message);
      break;
    case 'earnings':
      earnings(message);
      break;
    case 'help':
      help(message);
      break;
    default:
      console.log('Unknown command:', command);
      break;
  }
});

client.login(config.token);
