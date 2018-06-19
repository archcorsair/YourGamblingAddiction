const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter);
db.defaults({ users: [] }).write();

const createUser = (userId, user) => db.get('users').push({ id: userId, user,  history: [] }).write();

const getUser = (userId, user) => {
  const value = db.get('users').find({ id: userId }).value();
  if (!value) {
    createUser(userId, user);
    return getUser(userId);
  }
  return value;
}

const addHistory = (userId, user, change, total, timestamp) => {
  if (!userId || !change || !total || !timestamp) return;
  getUser(userId, user);
  db.get('users').find({ id: userId }).get('history').push({ timestamp, change, total }).write();
};

const getHistory = (userId) => getUser(userId).history;

// exports.createUser = createUser;
exports.getUser = getUser;
exports.addHistory = addHistory;
exports.getHistory = getHistory;
