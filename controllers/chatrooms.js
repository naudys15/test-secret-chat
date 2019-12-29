'use strict'
const chatrooms_model = require('../models/chatrooms')

var format_request = {}

/**
 * Permite guardar un archivo correspondiente a un salon de chat
 * @param {*} file Datos del archivo
 * @param {*} type Tipo de archivo
 * @param {*} location Ubicación del archivo
 * @return format_request Respuesta
 */
async function saveFile(file, type, location)
{
    var check_file = await (chatrooms_model.saveFile(file, type, location))
    if (check_file.includes("file_saved") == true) {
        var split_response = check_file.split(' ');
        format_request.code = 201
        format_request.status = 'success'
        if (type == 'image') {
            console.log('Image stored successfully')
            format_request.message = split_response[1] + '.jpeg'
        }
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = check_file
    }
    return format_request
}

/**
 * Permite borrar un archivo correspondiente a un salon de chat
 * @param {*} file Datos del archivo
 * @param {*} type Tipo de archivo
 * @param {*} location Ubicación del archivo
 * @return format_request Respuesta
 */
async function deleteFile(file, type, location)
{
    var check_file = await (chatrooms_model.deleteFile(file, type, location))
    if (check_file == 'file_deleted') {
        format_request.code = 204
        format_request.status = 'success'
        if (type == 'image') {
            console.log('Image deleted successfully')
            format_request.message = 'Archivo ' + file + '.jpeg borrado con éxito'
        }
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = check_file
    }
    return format_request
}

/**
 * Permite guardar un mensaje, que sirve para las verificaciones de las notificaciones y demás
 * @param {*} data Datos del mensaje
 * @return format_request Respuesta
 */
async function storeMessage(data)
{
    var check_file = await (chatrooms_model.storeMessage(data))
    if (check_file == 'message_stored') {
        format_request.code = 201
        format_request.status = 'success'
        console.log('Message stored successfully')
        format_request.message = 'Mensaje guardado con éxito'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'Hubo errores en el guardado del archivo'
    }
    return format_request
}

/**
 * Permite borrar todos los mensajes de un chat
 * @param {*} data Datos del mensaje
 * @return format_request Respuesta
 */
async function eraseAllMessages(data)
{
    var erase_messages = await (chatrooms_model.eraseAllMessages(data))
    if (erase_messages == 'message_updated') {
        format_request.code = 204
        format_request.status = 'success'
        console.log('Messages erased successfully')
        format_request.message = 'Mensajes eliminados con éxito'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No había mensajes por eliminar o hubo un error en el borrado'
    }
    return format_request
}

/**
 * Permite borrar todos los chats de un usuario que fue borrado
 * @param {*} data Datos del mensaje
 * @return format_request Respuesta
 */
async function eraseChatsUserDeleted(data)
{
    var erase_messages = await (chatrooms_model.eraseChatsUserDeleted(data))
    if (erase_messages == 'chats_deleted') {
        format_request.code = 204
        format_request.status = 'success'
        console.log('Chatrooms user erased successfully')
        format_request.message = 'Chats eliminados con éxito'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No había chats por borrar'
    }
    return format_request
}

/**
 * Permite notificar la lectura de un mensaje
 * @param {*} data Datos del mensaje
 * @return format_request Respuesta
 */
async function notifyReadedMessage(data)
{
    var readed_message = await (chatrooms_model.notifyReadedMessage(data))
    if (readed_message == 'message_updated') {
        format_request.code = 201
        format_request.status = 'success'
        console.log('Message notified as readed successfully')
        format_request.message = 'Mensaje notificado con éxito'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No había mensaje por actualizar'
    }
    return format_request
}

/**
 * Permite cargar los mensajes del archivo a la bd
 * @return format_request Respuesta
 */
async function loadMessages()
{
    var readed_message = await (chatrooms_model.loadMessages())
    if (readed_message == 'messages_loaded') {
        format_request.code = 201
        format_request.status = 'success'
        console.log('Messages loaded successfully')
        format_request.message = 'Mensajes cargados al sistema satisfactoriamente'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No había mensaje por actualizar'
    }
    return format_request
}

module.exports.saveFile = saveFile
module.exports.deleteFile = deleteFile
module.exports.storeMessage = storeMessage
module.exports.eraseAllMessages = eraseAllMessages
module.exports.eraseChatsUserDeleted = eraseChatsUserDeleted
module.exports.notifyReadedMessage = notifyReadedMessage
module.exports.loadMessages = loadMessages