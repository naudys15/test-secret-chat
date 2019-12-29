'use strict';
const mongoose = require('./connection').db_mongodb,
      Schema = mongoose.Schema;

const schemas = {
    messages: new Schema({
        id_chat: {type: String},
        id_message: {type: String},
        id_sender: {type: String},
        id_destination: {type: String},
        content: {type: String},
        notificated: {type: Boolean},
        deleted: {type: Boolean},
        readed: {type: Boolean},
        date: {type: Date}
    }),
    users: new Schema({
        user: {type: String, unique: true, dropDups: true},
        token: {type: String}
    }),
    list: new Schema({
        user: {type: String},
        token: {type: String},
        time_expiration: {type: Date}
    }),
};

module.exports = schemas;