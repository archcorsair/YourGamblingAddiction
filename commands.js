const Discord = require("discord.js");
const { getUser, addHistory, getHistory } = require('./dbActions');

const history = (user, message) => {
  const userHistory = getHistory(user);
  if (!userHistory.length) {
    message.channel.send('Sorry this user has no history, try gambling first!');
    return;
  }
  const history = [];
  let wins = 0;
  let losses = 0;
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
  const richEmbed = new Discord.RichEmbed({ description: `Bet history for <@!${user}>` });
  const fieldValue = history.join('\n');
  const footer = `Wins: ${wins} | Losses: ${losses}`;
  const response = richEmbed.addField(`Win Percent: ${winPercent}%`, fieldValue).setFooter(footer);
  message.channel.send(response);
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

exports.ping = ping;
exports.swamp = swamp;
exports.history = history;
exports.writeHistory = writeHistory;
