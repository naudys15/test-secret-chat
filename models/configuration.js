'use strict'
const database = require('../config/database/connection').db,
    admin = require('../config/database/connection').admin,
    encryption = require('../config/encryption/params')

/**
 * Permite obtener el valor de borrado de los mensajes de la aplicación
 * @return mixed Respuesta
 */
async function getConfiguration()
{
    var config = []
    return new Promise((resolve) => {
        database
            .collection('config')
            .get('delete_parameters')
            .then((snapshot) => {
                snapshot.forEach(async (doc) => {
                    var data = doc._fieldsProto
                    config.push(data.time.integerValue)
                });
                resolve(config)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve('error_db')
            })
    })
}

/**
 * Permite guardar el nuevo valor de borrado de la configuración
 * @param {*} value Nuevo valor
 * @return mixed Respuesta
 */
async function setConfiguration(value)
{
    var id = encryption.generateCodeUser()
    return new Promise((resolve) => {
        var docRef = database.collection('config').doc('delete_parameters');
        docRef
            .set({
                "time": value,
            })
            .then((snapshot) => {
                resolve(true)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve('error_db')
            })
        
    })
}

module.exports.getConfiguration = getConfiguration
module.exports.setConfiguration = setConfiguration