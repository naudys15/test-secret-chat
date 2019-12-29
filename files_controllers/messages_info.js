'use strict'
const fs = require('fs'),
    Messages = require('../config/database/models_mongodb').Message,
    chatrooms_model = require('../models/chatrooms')

/**
 * Cargar mensajes en la bd
 * @return mixed Respuesta
 */
async function loadMessages()
{
    return new Promise(async (resolve) => { 
        let messages = fs.readFileSync('./tokens/messages.sc', 'utf-8')
        if (messages != '') {
            messages = JSON.parse(messages)
            var count_messages = 0
            for (var i = 0; i < messages.length; i++) {
                var data = {
                    'id_chat' : messages[i].id_chat,
                    'id_message' : messages[i].id_message,
                    'id_sender' : messages[i].id_sender,
                    'id_destination' : messages[i].id_destination,
                    "content" : messages[i].content,
                    'notificated': messages[i].notificated,
                    'deleted' : messages[i].deleted,
                    "readed" : messages[i].readed,
                    'date' : messages[i].date
                }
                var insert = new Messages(data)
                await(insert.save(function (err, message) {
                    if (err) {
                        resolve('error_db')
                        console.log('There was an error in the insertion of the message: ', data.content)
                    }
                    console.log('Message inserted successfully')
                }))
            }
            console.log('Script executed successfully')
            resolve('messages_loaded')
        }
    })
}

/**
 * Obtener los mensajes que se han de notificar o borrar,
 * @return mixed Respuesta
 */
async function getMessages()
{
    return new Promise((resolve) => { 
        Messages.find({}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var new_messages = []
                for (var i = 0; i < messages.length; i++) {
                    var message = {}
                    message.id = messages[i]['_id']
                    message.id_chat = messages[i]['id_chat']
                    message.id_message = messages[i]['id_message']
                    message.id_sender = messages[i]['id_sender']
                    message.id_destination = messages[i]['id_destination']
                    message.content = messages[i]['content']
                    message.notificated = messages[i]['notificated']
                    message.deleted = messages[i]['deleted']
                    message.readed = messages[i]['readed']
                    message.date = messages[i]['date']
                    new_messages.push(message)
                }
                resolve(new_messages)
            } else {
                resolve('no_messages')
            }
        })
    })
}

/**
 * Obtener los mensajes que no han sido notificados y no han sido eliminados
 * @return mixed Respuesta
 */
function getMessagesNotNotificated()
{
    return new Promise((resolve) => { 
        Messages.find({notificated: false, deleted: false}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var new_messages = []
                for (var i = 0; i < messages.length; i++) {
                    var message = {}
                    message.id = messages[i]['_id']
                    message.id_chat = messages[i]['id_chat']
                    message.id_message = messages[i]['id_message']
                    message.id_sender = messages[i]['id_sender']
                    message.id_destination = messages[i]['id_destination']
                    message.content = messages[i]['content']
                    message.notificated = messages[i]['notificated']
                    message.deleted = messages[i]['deleted']
                    message.readed = messages[i]['readed']
                    message.date = messages[i]['date']
                    new_messages.push(message)
                }
                resolve(new_messages)
            } else {
                resolve('no_messages')
            }
        })
    })
}

/**
 * Obtener los mensajes que no han sido eliminados y deben eliminarse porque ya expiraron
 * @param {*} config_time Tiempo de borrado
 * @return mixed Respuesta
 */
function getMessagesToBeDeleted(config_time)
{
    return new Promise((resolve) => { 
        var now = new Date().getTime()
        Messages.find({deleted: false, readed: true}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var new_messages = []
                for (var i = 0; i < messages.length; i++) {
                    if ((now > (messages[i]['date'] + config_time))) {
                        var message = {}
                        message.id = messages[i]['_id']
                        message.id_chat = messages[i]['id_chat']
                        message.id_message = messages[i]['id_message']
                        message.id_sender = messages[i]['id_sender']
                        message.id_destination = messages[i]['id_destination']
                        message.content = messages[i]['content']
                        message.notificated = messages[i]['notificated']
                        message.deleted = messages[i]['deleted']
                        message.readed = messages[i]['readed']
                        message.date = messages[i]['date']
                        new_messages.push(message)
                    }
                }
                if (new_messages.length > 0) {
                    resolve(new_messages)
                } else {
                    resolve('no_messages')
                }
            } else {
                resolve('no_messages')
            }
        })
    })
}

/**
 * Actualizar el mensaje
 * @param {*} message Datos del mensaje
 * @return mixed Respuesta
 */
function updateMessage(message)
{
    return new Promise(async (resolve) => {
        Messages.find({id_chat: message.id_chat, id_message: message.id_message, deleted: { $ne: true }}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var new_messages = []
                for (var i = 0; i < messages.length; i++) {
                    if (message.deleted == true && messages[i].deleted != true) {
                        message = messages[i]
                        message.deleted = true
                        new_messages.push(message)
                    } else if (message.notificated == true) {
                        new_messages.push(message)
                    }
                }
                if (new_messages.length > 0) {
                    var count_new_messages = 0
                    for (var i = 0; i < new_messages.length; i++) {
                        var data_update = new_messages[i],
                            id = new_messages[i]['_id']
                        Messages.findByIdAndUpdate(id, data_update, function(err, result) {
                            if (err) {
                                resolve('error_db')
                            }
                            count_new_messages++
                            if (count_new_messages == new_messages.length) {
                                resolve('message_updated')
                            }
                        })
                    }
                } else {
                    resolve('no_updated_messages')
                }
            } else {
                resolve('no_messages')
            }
        })
    })
}

/**
 * Actualizar los mensajes de un chat que ya fue eliminado
 * @param {*} id Id del chat
 * @return mixed Respuesta
 */
async function updateChatEraseMessages(id)
{
    return new Promise((resolve) => {
        Messages.find({id_chat: id}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var count_new_array_messages = 0
                for (var i = 0; i < messages.length; i++) {
                    var data_update = messages[i],
                        id = data_update['_id']
                    Messages.findByIdAndUpdate(id, data_update, function(err, result) {
                        if (err) {
                            resolve('error_db')
                        }
                        count_new_array_messages++
                        if (count_new_array_messages == new_array_messages.length) {
                            resolve('message_updated')
                        }
                    })
                }
            } else {
                resolve('no_messages')
            }
        })
    })
}

/**
 * Eliminar chats de un usuario que ya fue eliminado
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function eraseChatsWithUserDeleted(id)
{
    return new Promise((resolve) => {
        Messages.find({$or: [ {id_sender : id}, {id_destination : id} ]}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i]
                    var result = await(chatrooms_model.deleteChat(message))
                }
                resolve('chats_deleted')
            } else {
                resolve('no_chats')
            }
        })
    })
}

/**
 * Notificar que un mensaje fue leido por el usuario
 * @param {*} data Datos del mensaje
 * @return mixed Respuesta
 */
async function notifyReadedMessage(data)
{
    return new Promise((resolve) => {
        Messages.find({id_chat: data.id_chat, id_message: data.id_message/*, deleted: { $ne: true }*/}).exec(function(err, messages) {
            if (err) resolve('error_db')
            if (messages.length > 0) {
                var count_new_array_messages = 0
                for (var i = 0; i < messages.length; i++) {
                    var data_update = messages[i],
                        id = data_update['_id']
                    data_update['readed'] = true
                    Messages.findByIdAndUpdate(id, data_update, function(err, result) {
                        if (err) {
                            resolve('error_db')
                        }
                        count_new_array_messages++
                        if (count_new_array_messages == messages.length) {
                            resolve('message_updated')
                        }
                    })
                }
            } else {
                resolve('no_chats')
            }
        })
    })
}

/**
 * Agregar mensaje a la lista
 * @param {*} id_chat Id del chat
 * @param {*} id_message Id del mensaje
 * @param {*} sender Emisor del mensaje
 * @param {*} receiver Receptor del mensaje
 * @param {*} content Contenido del mensaje
 * @return mixed Respuesta
 */
async function addMessage(id_chat, id_message, sender, receiver, content)
{
    return new Promise((resolve) => {
        var data = {},
            now = new Date()
        data = {
            'id_chat' : id_chat,
            'id_message' : id_message,
            'id_sender' : sender,
            'id_destination' : receiver,
            "content" : content,
            'notificated': false,
            'deleted' : false,
            "readed" : false,
            'date' : now.getTime()
        }
        var insert = new Messages(data)
        insert.save(function (err, user) {
            if (err) {
                resolve('error_db')
            } else {
                resolve('message_stored')
            }
        })
    })
}

module.exports.addMessage = addMessage
module.exports.getMessages = getMessages
module.exports.getMessagesNotNotificated = getMessagesNotNotificated
module.exports.getMessagesToBeDeleted = getMessagesToBeDeleted
module.exports.updateMessage = updateMessage
module.exports.updateChatEraseMessages = updateChatEraseMessages
module.exports.eraseChatsWithUserDeleted = eraseChatsWithUserDeleted
module.exports.notifyReadedMessage = notifyReadedMessage
module.exports.loadMessages = loadMessages
