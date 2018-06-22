const Discord = require('discord.js');
const {
  getGains, getLosses, addHistory, getSortedHistory,
} = require('./dbActions');
const { getEarningsString, moneyString } = require('./utilities');

const HISTORY_ENTRY_LIMIT = 10;

// Commands
const history = (message) => {
  const allUserHistory = getSortedHistory(message.author.id);
  const moreHistory = allUserHistory.length > HISTORY_ENTRY_LIMIT;
  const userHistory = allUserHistory.slice(-HISTORY_ENTRY_LIMIT);
  if (!userHistory.length) {
    message.channel.send('Sorry this user has no history, try gambling first!');
    return;
  }
  const dispHistory = [];
  let wins = 0;
  let losses = 0;
  const totalEarnings = getEarningsString(message);
  userHistory.forEach((item) => {
    if (item.change > 0) wins += 1;
    if (item.change < 0) losses += 1;
    const date = new Date(item.timestamp);
    const dateString = date.toDateString();
    const timeString = date.toLocaleTimeString();
    const totalStr = moneyString(item.total);
    const prefix = item.change < 0 ? 'L: -' : 'W: +';
    const amountStr = moneyString(Math.abs(item.change));
    const winString = `(${prefix}${amountStr})`;
    dispHistory.push(`<${dateString} ${timeString}> ${totalStr} ${winString}`);
  });
  const winPercent = Math.floor((wins / userHistory.length) * 100);
  const fieldValue = dispHistory.join('\n');
  const footerEntries = [
    `Wins: ${wins}`,
    `Losses: ${losses}`,
    `Lifetime Earnings: ${totalEarnings}`,
  ];
  if (moreHistory) {
    const hiddenEntryCount = allUserHistory.length - HISTORY_ENTRY_LIMIT;
    footerEntries.push(`${hiddenEntryCount} entries not shown`);
  }
  const footer = footerEntries.join(' | ');
  const richEmbed = new Discord.RichEmbed({ description: `Bet history for <@!${message.author.id}>` });
  const response = richEmbed.addField(`Win Percent: ${winPercent}%`, fieldValue).setFooter(footer);
  message.channel.send(response);
};

const gains = (message) => {
  const user = message.author.id;
  const gainsStr = moneyString(getGains(user));
  message.channel.send(`<@!${user}>, you have gained **${gainsStr}** from gambling`);
};

const losses = (message) => {
  const user = message.author.id;
  const lossesStr = moneyString(getLosses(user));
  message.channel.send(`<@!${user}>, you have lost **${lossesStr}** from gambling`);
};

const swamp = (message) => {
  const richEmbed = new Discord.RichEmbed({ description: 'What are you doing in my swamp?' });
  message.channel.send(richEmbed.setImage('https://i.imgur.com/Av9gTzB.gif'));
};

const ping = async (message, client) => {
  const m = await message.channel.send('Ping?');
  m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
};

const earnings = (message) => {
  message.channel.send(`<@!${message.author.id}>, your lifetime earnings: **${getEarningsString(message)}**`);
};

const help = (message) => {
  const richEmbed = new Discord.RichEmbed();
  const fieldValue = `**History** - Displays a breakdown of your most recent bets
**Earnings** - Tells you your lifetime earnings
**Gains** - Let's you know how much you've gained
**Losses** - Lets's you know how much you've lost`;
  const response = richEmbed.addField('List of commands', fieldValue);
  message.channel.send(response);
};

const adminAddHistory = (message, args) => {
  if (args.length !== 4) {
    message.channel.send(`Speak to me in a language I understand <@!${message.author.id}>!`);
    return;
  }
  const [userId, amountChange, totalAmount, snowflake] = args;
  if (!/\d{18}/.test(userId)) {
    message.channel.send(`Couldn't parse '${userId}' into a userId...`);
    return;
  }
  const changed = Number.parseFloat(amountChange);
  if (Number.isNaN(changed)) {
    message.channel.send(`Couldn't parse the change '${amountChange}' into a float...`);
    return;
  }
  const total = Number.parseFloat(totalAmount);
  if (Number.isNaN(total)) {
    message.channel.send(`Couldn't parse the total '${totalAmount}' into a float...`);
    return;
  }
  const { timestamp } = Discord.Snowflake.deconstruct(snowflake);
  addHistory(userId, changed, total, timestamp);
  message.channel.send('Added!');
};

exports.ping = ping;
exports.swamp = swamp;
exports.history = history;
exports.gains = gains;
exports.losses = losses;
exports.earnings = earnings;
exports.help = help;
exports.adminAddHistory = adminAddHistory;
