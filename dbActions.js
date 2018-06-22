const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

const createUser = userId => db.get('users').push({
  id: userId, history: [],
}).write();

const getUser = (userId) => {
  const value = db.get('users').find({ id: userId }).value();
  if (!value) {
    createUser(userId);
    return getUser(userId);
  }
  return value;
};

const addHistory = (userId, change, total, timestamp) => {
  if (!userId || !change || !total || !timestamp) return;
  getUser(userId);
  db.get('users').find({ id: userId }).get('history').push({ timestamp, change, total })
    .write();
};

const getHistory = userId => getUser(userId).history;

const getLosses = userId =>
  getHistory(userId).reduce((total, i) => {
    if (i.change < 0) {
      return total + Math.abs(i.change);
    }
    return total;
  }, 0);

const getGains = userId =>
  getHistory(userId).reduce((total, i) => {
    if (i.change > 0) {
      return total + i.change;
    }
    return total;
  }, 0);

exports.getUser = getUser;
exports.addHistory = addHistory;
exports.getHistory = getHistory;
exports.getLosses = getLosses;
exports.getGains = getGains;
