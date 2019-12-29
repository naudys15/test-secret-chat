'use strict'
const database = require('../config/database/connection').db,
    admin = require('../config/database/connection').admin,
    cronjob = require('node-cron'),
    registration_tokens = require('../files_controllers/login_messaging_tokens'),
    messages_controller = require('../files_controllers/messages_info'),
    chatrooms_model = require('../models/chatrooms'),
    files = require('fs'),
    params_application = require('../config/parameters/params')

//Cron que permite enviar las notificaciones de los mensajes que aun no han sido leidos
var task = cronjob.schedule('*/30 * * * * *', async () =>  {
        console.log('run send notification every thirty seconds');
        var tokens = await(registration_tokens.getRegistrationTokens()),
            messages = await(messages_controller.getMessagesNotNotificated()),
            notification_message = await(params_application.getAleatoryMessageToSend()),
            message = {
                "notification": 
                {
                    "title": "Alerta",
                    "body": notification_message
                },
                "token": '',
            },
            users_sended = [],
            l = 0,
            band_sended = false,
            send_message = '',
            update_status_message,
            band_message = false
        if (messages != 'no_messages') {
            for (var i in messages) {
                band_sended = false
                for (var k = 0; k < users_sended.length; k++) {
                    if (users_sended[k] == messages[i].id_destination) {
                        band_sended = true
                        update_status_message = await(updateMessage(messages[i], false))
                    }
                }
                if (!band_sended) {
                    band_message = false
                    if (tokens != 'no_token_users') {
                        for (var j in tokens) {
                            if (messages[i].id_destination == tokens[j].user && !band_message && tokens[j].token != '') {
                                band_message = true
                                message.token = tokens[j].token
                                console.log("Notification 30seg is going to be sent to ", messages[i].id_destination, ' with the token: ', message.token)
                                if (message.token != '') {
                                    send_message = await(sendMessage(message))
                                    if (send_message == "sent successfully") {
                                        users_sended[l] = ''
                                        users_sended[l] = tokens[j].user
                                        l++
                                        band_message = true
                                        update_status_message = await(updateMessage(messages[i], false))
                                    } else {
                                        update_status_message = await(updateMessage(messages[i], true))
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
    scheduled: false
})

//Enviar el mensaje
async function sendMessage(message)
{
    return new Promise((resolve) => {
        // Send a message to the device corresponding to the provided
        // registration token.
        admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            resolve("sent successfully")
            
        })
        .catch((error) => {
            console.log('Error sending message:'/*, error*/);
            resolve("was not send successfully")
        })
    })
}
//Actualizar el mensaje una vez fue notificado
async function updateMessage(message, confirm)
{
    return new Promise((resolve) => {
        database
            .collection('chatrooms')
            .get()
            .then((snapshot) => {
                snapshot.forEach(async function(doc){
                    var data = doc._fieldsProto,
                        new_data = {},
                        definitive_messages = [],
                        date_seconds = (data.date.timestampValue.seconds * 1000),
                        j = 0,
                        band_notification = false,
                        band_chat = false,
                        band_message = false,
                        attempts_notificated_message
                    if (message.id_chat == doc.id) {
                        band_chat = true
                        new_data.date = new admin.firestore.Timestamp((date_seconds / 1000), 0)
                        new_data.description = data.description.stringValue
                        new_data.id = parseInt(data.id.integerValue)
                        new_data.id_chat = doc.id
                        new_data.id_sender = data.id_sender.stringValue
                        new_data.id_receiver = data.id_receiver.stringValue
                        new_data.name_sender = data.name_sender.stringValue
                        new_data.name_receiver = data.name_receiver.stringValue
                        new_data.name = data.name.stringValue
                        new_data.img = data.img.stringValue
                        new_data.messages = data.messages.arrayValue.values
                        for (var index in new_data.messages) {
                            var messages = new_data.messages[index].mapValue
                            for (var fields in messages) {
                                attempts_notificated_message = 0
                                var notificated = messages[fields].notificated.booleanValue,
                                    date_message = (messages[fields].date.timestampValue.seconds * 1000)
                                definitive_messages[j] = {}
                                definitive_messages[j].date = new admin.firestore.Timestamp((date_message / 1000), 0)
                                definitive_messages[j].content = messages[fields].content.stringValue
                                definitive_messages[j].id = parseInt(messages[fields].id.integerValue)
                                definitive_messages[j].name_receiver = messages[fields].name_receiver.stringValue
                                definitive_messages[j].name_sender = messages[fields].name_sender.stringValue
                                definitive_messages[j].sender = messages[fields].sender.stringValue
                                definitive_messages[j].type = messages[fields].type.stringValue
                                definitive_messages[j].readed = messages[fields].readed.booleanValue
                                definitive_messages[j].notificated = messages[fields].notificated.booleanValue
                                if (typeof messages[fields].notificated_attempts != 'undefined') {
                                    definitive_messages[j].notificated_attempts = parseInt(messages[fields].notificated_attempts.integerValue)
                                }
                                if (!notificated && messages[fields].id.integerValue == message.id_message) {
                                    band_message = true
                                    if (confirm == false) {
                                        definitive_messages[j].notificated = true
                                        band_notification = true
                                    } else {
                                        if (typeof messages[fields].notificated_attempts == 'undefined') {
                                            definitive_messages[j].notificated_attempts = parseInt(1)
                                        } else {
                                            if (messages[fields].notificated_attempts.integerValue > 2) {
                                                definitive_messages[j].notificated = true
                                                band_notification = true
                                            }
                                            definitive_messages[j].notificated_attempts++
                                        }
                                        attempts_notificated_message = definitive_messages[j].notificated_attempts
                                    }
                                }
                                j++
                            }
                            
                        }
                        new_data.messages = definitive_messages
                        if (band_notification != false) {
                            var save_chat = await(chatrooms_model.setChat(new_data))
                            message.notificated = true
                            console.log("Changed the status of the message: ", message.id_message, ", because it has been notificated")
                            var update_internally_list_messages = await(messages_controller.updateMessage(message))
                            if (update_internally_list_messages == 'message_updated') {
                                console.log("Changed the status of the message: ", message.id_message, ", internally successfully")
                                resolve(true)
                            }
                        } else if (band_chat == true && band_message == false) {
                            message.deleted = true
                            console.log("Changed the status of the message: ", message.id_message, ", because it is not longer available")
                            var update_internally_list_messages = await(messages_controller.updateMessage(message))
                            if (update_internally_list_messages == 'message_updated') {
                                console.log("Changed the status of the message: ", message.id_message, ", internally successfully")
                                resolve(true)
                            }
                        }
                    }
                });
                resolve(false)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve(false)
            })
    })
}

module.exports = task