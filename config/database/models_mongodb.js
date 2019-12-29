'use strict'
const mongoose = require('./connection').db_mongodb,
  schemas = require('./schemas_mongodb');

const models = {
    Message: mongoose.model('message', schemas.messages, 'messages'),
    User: mongoose.model('user', schemas.users, 'users'),
    Blacklist: mongoose.model('blacklist', schemas.list, 'list')
};

module.exports = models;