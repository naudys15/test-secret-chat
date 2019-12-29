'use strict'
//URL de la API desplegada en Heroku
const url = 'https://chat.com/'

const messages_notifications = [
    'Instagram tiene una actualización pendiente',
    'Prueba las nuevas funcionalidades de la aplicación',
    'Tienes un evento cerca de ti en un rango de 1km',
    'Nuevas políticas de privacidad de Snapchat'
]

/**
 * Permite obtener los mensajes aleatorios que van a ser enviados en las notificaciones
 * @return string Mensaje que se va a enviar en las notificaciones
 */
async function getAleatoryMessageToSend()
{
    var li = 0,
        ls = messages_notifications.length
    var number = Math.floor(Math.random() * (ls - li)) + li
    return messages_notifications[number]
}

module.exports.url = url
module.exports.path_external_files = path_external_files
module.exports.getAleatoryMessageToSend = getAleatoryMessageToSend