'use strict'
const database = require('../config/database/connection').db,
    encryption = require('../config/encryption/params'),
    files = require('fs'),
    route_files = __dirname + '/../public/files/',
    route_files_public = '/files/',
    reg_messages = require('../files_controllers/messages_info')

/**
 * Actualizar chat con los mensajes (ESTE MÉTODO ES USADO POR LOS CRONES CUANDO SE ACTUALIZAN LOS ESTATUS DE NOTIFICADO)
 * @param {*} account Nuevo identificador
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function setChat(data)
{
    var user = database.collection('chatrooms').doc(data.id_chat),
        data = {
            date: data.date,
            description: data.description,
            id: data.id,
            id_sender: data.id_sender,
            id_receiver: data.id_receiver,
            name_sender: data.name_sender,
            name_receiver: data.name_receiver,
            name: data.name,
            img: data.img,
            messages: data.messages
        }
    return new Promise((resolve) => {
        user
            .update(data)
            .then((snapshot) => {
                resolve(true)
            })
    })
}

/**
 * Permite borrar un chat
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function deleteChat(id)
{
    var chat = database.collection('chatrooms').doc(id)
    return new Promise((resolve) => {
        chat
            .delete()
            .then((snapshot) => {
                console.log("Deleted chat with id: ", id, " successfully")
                resolve(true)
            })
    })
}

/**
 * Permite guardar los archivos que se encuentran en un chat o para el perfil
 * @param {*} file Datos del archivo
 * @param {*} type Tipo del archivo
 * @param {*} location Ubicación del archivo
 * @return mixed Respuesta
 */
async function saveFile(file, type, location)
{
    return new Promise ((resolve) => {
        if (type == 'image') {
            if (location == 'profile') {
                var ba64 = require('ba64'),
                    base64Data = file.replace(/^data:image\/\*/gi, "data:image/jpeg"),
                    name_file = encryption.generateCodeFiles(),
                    route_store = route_files + 'images/profile/',
                    fullname_file = route_store + '' + name_file,
                    fullname_public = route_files_public + 'images/profile/' + name_file
                ba64.writeImageSync(fullname_file, base64Data)
                resolve("file_saved " + fullname_public)
            } else if (location == 'chat') {
                var ba64 = require('ba64'),
                    base64Data = file.replace(/^data:image\/\*/gi, "data:image/jpeg"),
                    name_file = encryption.generateCodeFiles(),
                    route_store = route_files + 'images/chat/',
                    fullname_file = route_store + '' + name_file,
                    fullname_public = route_files_public + 'images/chat/' + name_file
                ba64.writeImageSync(fullname_file, base64Data)
                resolve("file_saved " + fullname_public)
            }
        } else {
            resolve("file_invalid")
        }
        resolve("error_file")
    })
}

/**
 * Permite eliminar de disco un archivo que se encuentra en un chat
 * @param {*} file Datos del archivo
 * @param {*} type Tipo del archivo
 * @param {*} location Ubicación del archivo
 * @return mixed Respuesta
 */
async function deleteFile(file, type, location)
{
    return new Promise ((resolve) => {

        if (type == 'image') {
            if (location == 'profile') {
                var route_store = route_files + 'images/profile/',
                    fullname_file = route_store + '' + file + '.jpeg'
            } else if (location == 'chat') {
                var route_store = route_files + 'images/chat/',
                    fullname_file = route_store + '' + file + '.jpeg'
            }
            try {
                files.unlinkSync(fullname_file)
                resolve('file_deleted')
            } catch(e) {
                resolve('file_not_found')
            }
        } else {
            resolve('file_invalid')
        }
    })
}

/**
 * Guardar mensaje en lista alterna de mensajes, para evitar lecturas excesivas a bd Firebase
 * @param {*} data Datos del mensaje
 * @return mixed Respuesta
 */
async function storeMessage(data)
{
    return new Promise (async (resolve) => {
        //Guardar el nuevo mensaje añadido a un chat en un archivo paralelo, donde se van a realizar las lecturas para notificación y borrado automático
        var result = await(reg_messages.addMessage(data.id_chat, data.id_message, data.id_sender, data.id_destination, data.content))
        resolve(result)
    })
}

/**
 * Actualizar lista interna de mensajes de un chat, a que fueron eliminados
 * @param {*} data Datos del mensaje
 * @return mixed Respuesta
 */
async function eraseAllMessages(data)
{
    return new Promise (async (resolve) => {
        //Actualizar el estatus de borrado de los mensajes de un chat especifico, ya que estos fueron borrados 
        var result = await(reg_messages.updateChatEraseMessages(data.id_chat))
        resolve(result)
    })
}

/**
 * Borrar los chats de un usuario que fue borrado
 * @param {*} data Datos del mensaje
 * @return mixed Respuesta
 */
async function eraseChatsUserDeleted(data)
{
    return new Promise (async (resolve) => {
        //Borrar los chats en los cuales un usuario, que ya está eliminado, estaba presente
        var result = await(reg_messages.eraseChatsWithUserDeleted(data.id_user))
        resolve(result)
    })
}

/**
 * Notificar un mensaje que fue leido en la lista interna
 * @param {*} data Datos del mensaje
 * @return mixed Respuesta
 */
async function notifyReadedMessage(data)
{
    return new Promise (async (resolve) => {
        //Actualizar mensaje
        var result = await(reg_messages.notifyReadedMessage(data))
        resolve(result)
    })
}

/**
 * Cargar mensajes en la bd
 * @return mixed Respuesta
 */
async function loadMessages()
{
    return new Promise (async (resolve) => {
        //Cargar mensajes
        var result = await(reg_messages.loadMessages())
        resolve(result)
    })
}

module.exports.setChat = setChat
module.exports.deleteChat = deleteChat
module.exports.saveFile = saveFile
module.exports.deleteFile = deleteFile
module.exports.storeMessage = storeMessage
module.exports.eraseAllMessages = eraseAllMessages
module.exports.eraseChatsUserDeleted = eraseChatsUserDeleted
module.exports.notifyReadedMessage = notifyReadedMessage
module.exports.loadMessages = loadMessages