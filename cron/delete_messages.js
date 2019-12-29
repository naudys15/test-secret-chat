'use strict'
const database = require('../config/database/connection').db,
    admin = require('../config/database/connection').admin,
    encryption = require('../config/encryption/params'),
    cronjob = require('node-cron'),
    config_model = require('../models/configuration'),
    chatrooms_model = require('../models/chatrooms'),
    messages_controller = require('../files_controllers/messages_info')

var config_time = 5000,
    first_time_config = false

//Cada 5 min se solicita el valor de la configuración
var task_config = cronjob.schedule('*/5 * * * *', async () =>  {
        console.log('run get config time every 5 minutes');
        config_time = parseInt(await(config_model.getConfiguration()))
    }, {
    scheduled: false
})
task_config.start();

//Cron que permite realizar el borrado de los mensajes de la aplicación cada 30 segundos
var task = cronjob.schedule('*/30 * * * * *', () =>  {
        console.log('run delete messages every thirty seconds');
        return new Promise(async (resolve) => {
            if (!first_time_config) {
                config_time = parseInt(await(config_model.getConfiguration()))
                first_time_config = true
            }
            var messages = await(messages_controller.getMessagesToBeDeleted(config_time))
            if (messages != 'no_messages') {
                database
                .collection('chatrooms')
                .get()
                .then(async (snapshot) => {
                    snapshot.forEach(async function(doc){
                        var data = doc._fieldsProto,
                            new_data = {},
                            definitive_messages = [],
                            date_seconds = (data.date.timestampValue.seconds * 1000),
                            chat_to_update = false,
                            id_chat = '',
                            id_message = '',
                            j = 0
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
                                var date_message = (messages[fields].date.timestampValue.seconds * 1000),
                                    readed = messages[fields].readed.booleanValue,
                                    sender = messages[fields].sender.stringValue,
                                    now = new Date().getTime()
                                if ((now > (date_message + config_time)) && readed && sender != "sin emisor") {
                                    chat_to_update = true
                                    id_chat = doc.id
                                    id_message = messages[fields].id.integerValue
                                } else {
                                    definitive_messages[j] = {}
                                    definitive_messages[j].date = new admin.firestore.Timestamp((date_message / 1000), 0)
                                    definitive_messages[j].content = messages[fields].content.stringValue
                                    definitive_messages[j].id = parseInt(messages[fields].id.integerValue)
                                    definitive_messages[j].name_receiver = messages[fields].name_receiver.stringValue
                                    definitive_messages[j].name_sender = messages[fields].name_sender.stringValue
                                    definitive_messages[j].sender = messages[fields].sender.stringValue
                                    definitive_messages[j].type = messages[fields].type.stringValue
                                    definitive_messages[j].readed = readed
                                    definitive_messages[j].notificated = messages[fields].notificated.booleanValue
                                    if (typeof messages[fields].notificated_attempts != 'undefined') {
                                        definitive_messages[j].notificated_attempts = parseInt(messages[fields].notificated_attempts.integerValue)
                                    }
                                    j++
                                }
                            }
                        }
                        new_data.messages = definitive_messages
                        if (chat_to_update == true) {
                            var save_chat = await(chatrooms_model.setChat(new_data))
                            var message = []
                            message.id_chat = id_chat
                            message.id_message = id_message
                            message.deleted = true
                            console.log("Message ", message.id_message, " deleted, because it's expired")
                            var update_internally_list_messages = await(messages_controller.updateMessage(message))
                            if (update_internally_list_messages == 'message_updated') {
                                console.log("Changed the status of the message: ", message.id_message, ", internally successfully")
                                resolve(true)
                            }
                        }
                    });
                    resolve(true)
                })
                .catch((err) => {
                    console.log('Error in database: ', err);
                    resolve(false)
                })
            }
        })
    }, {
    scheduled: false
})

module.exports = task