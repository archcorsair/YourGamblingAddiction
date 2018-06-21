const { addHistory, getGains, getLosses } = require('./dbActions');

const messageRegex = /<@!(\d+)> -> .+?(LOST|WON).+?\$(.+?) .+ \$(.+?)\.$/;

const normalizeAmount = amount => parseFloat(amount.replace(/,/g, ''), 10);

const getEarnings = (message) => {
  // console.log('message', message);
  const totalGains = getGains(message.author.id);
  const totalLosses = getLosses(message.author.id);
  return totalGains - totalLosses;
};

const moneyString = dollars => `$${dollars.toLocaleString()}`;
const getEarningsString = message => moneyString(getEarnings(message));

const rebuildHistory = (message) => {

};

const processGamblingResult = (message) => {
  const parsed = messageRegex.exec(message.content);
  if (!parsed) {
    // It's not a gambling message
    // console.log('[debug] Ignoring because not a gambling message', parsed, message);
    return;
  }
  const [, userId] = parsed;
  let [,, status, amountBet, totalAmount] = parsed;
  const mentionedUsers = message.mentions.users;
  const mentionedUser = mentionedUsers.get(userId);

  status = status.toLowerCase();
  amountBet = normalizeAmount(amountBet);
  totalAmount = normalizeAmount(totalAmount);
  if (mentionedUser) {
    const change = status === 'lost' ? -amountBet : amountBet;
    addHistory(userId, mentionedUser.username, change, totalAmount, message.createdTimestamp);
  }
  const icon = status === 'won' ? ':moneybag:' : ':small_red_triangle_down:';
  message.channel.send(`Looks like <@!${userId}> just gambled and ${status} ${icon} $${amountBet}!`);
};

exports.processGamblingResult = processGamblingResult;
exports.getEarningsString = getEarningsString;
exports.rebuildHistory = rebuildHistory;
exports.moneyString = moneyString;
