const Discord = require("discord.js");
const { addHistory, getHistory, getGains, getLosses } = require('./dbActions');

const history = (message) => {
  const userHistory = getHistory(message.author.id);
  if (!userHistory.length) {
    message.channel.send('Sorry this user has no history, try gambling first!');
    return;
  }
  const history = [];
  let wins = 0;
  let losses = 0;
  const totalEarnings = getEarningsString(message);
  userHistory.forEach((item) => {
    if (item.change > 0) wins += 1;
    if (item.change < 0) losses += 1;
    const date = new Date(item.timestamp)
    dateString = date.toDateString();
    timeString = date.toLocaleTimeString();
    const winString = item.change < 0 ? `(L: -$${Math.abs(item.change)})` : `(W: +$${item.change})`;
    history.push(`<${dateString} ${timeString}> $${item.total} ${winString}`);
  });
  const winPercent = Math.floor((wins / userHistory.length) * 100);
  const fieldValue = history.join('\n');
  const footer = `Wins: ${wins} | Losses: ${losses} | Lifetime Earnings: ${totalEarnings}`;
  const richEmbed = new Discord.RichEmbed({ description: `Bet history for <@!${message.author.id}>` });
  const response = richEmbed.addField(`Win Percent: ${winPercent}%`, fieldValue).setFooter(footer);
  message.channel.send(response);
};

const gains = (message) => {
  const user = message.author.id;
  const gains = moneyString(getGains(user));
  message.channel.send(`<@!${user}>, you have gained **${gains}** from gambling`);
};

const losses = (message) => {
  const user = message.author.id;
  const losses = moneyString(getLosses(user));
  message.channel.send(`<@!${user}>, you have lost **${losses}** from gambling`);
};

const swamp = (message) => {
  const richEmbed = new Discord.RichEmbed({ description: 'What are you doing in my swamp?' });
  message.channel.send(richEmbed.setImage('https://i.imgur.com/Av9gTzB.gif'));
};

const ping = async (message, client) => {
  const m = await message.channel.send("Ping?");
  m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
};

const writeHistory = (userId, user, change, total, timestamp) => {
  addHistory(userId, user, change, total, timestamp);
};

const getEarnings = (message) => {
  console.log('message', message);
  const totalGains = getGains(message.author.id);
  const totalLosses = getLosses(message.author.id);
  return totalGains - totalLosses;
};

const getEarningsString = (message) => {
  return moneyString(getEarnings(message));
};

const moneyString = (dollars) => {
  return `$${dollars.toLocaleString()}`;
}

const earnings = (message) => {
  message.channel.send(`<@!${message.author.id}>, your lifetime earnings: **${getEarningsString(message)}**`);
}

const help = (message) => {
  const richEmbed = new Discord.RichEmbed();
  const fieldValue = `**History** - Displays a breakdown of your most recent bets
**Earnings** - Tells you your lifetime earnings
**Gains** - Let's you know how much you've gained
**Losses** - Lets's you know how much you've lost`;
  const response = richEmbed.addField('List of commands', fieldValue);
  message.channel.send(response);
};

exports.ping = ping;
exports.swamp = swamp;
exports.history = history;
exports.writeHistory = writeHistory;
exports.gains = gains;
exports.losses = losses;
exports.earnings = earnings;
exports.help = help;
