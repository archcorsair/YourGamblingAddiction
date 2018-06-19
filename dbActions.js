const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter);
db.defaults({ users: [] }).write();

const createUser = (userId, user) => db.get('users').push({ id: userId, user, gains: 0, losses: 0,  history: [] }).write();

const getUser = (userId, user) => {
  const value = db.get('users').find({ id: userId }).value();
  if (!value) {
    createUser(userId, user);
    return getUser(userId, user);
  }
  return value;
}

const updateWinnings = (userId, change) => {
  const user = db.get('users').find({ id: userId });
  const userValues = user.value();
  if (change < 0) user.assign({ losses: userValues.losses + Math.abs(change) }).write();
  if (change > 0) user.assign({ gains: userValues.gains + change }).write();
}

const addHistory = (userId, user, change, total, timestamp) => {
  if (!userId || !change || !total || !timestamp) return;
  getUser(userId, user);
  db.get('users').find({ id: userId }).get('history').push({ timestamp, change, total }).write();
  updateWinnings(userId, change);
};

const getHistory = (userId) => getUser(userId).history;
const getLosses = (userId) => getUser(userId).losses;
const getGains = (userId) => getUser(userId).gains;

exports.getUser = getUser;
exports.addHistory = addHistory;
exports.getHistory = getHistory;
exports.getLosses = getLosses;
exports.getGains = getGains;
