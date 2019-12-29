'use strict'
const database = require('../config/database/connection').db,
    admin = require('../config/database/connection').admin,
    encryption = require('../config/encryption/params')

/**
 * Permite obtener los roles de la aplicación
 * @return mixed Respuesta
 */
async function getRoles()
{
    var roles = []
    return new Promise((resolve) => {
        database
            .collection('type_users')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var data = doc._fieldsProto
                    roles.push(data.description.stringValue)
                });
                resolve(roles)
            })
            .catch((err) => {
                console.log('Error in database', err);
                resolve('error_db')
            })
    })
}

/**
 * Permite crear un nuevo rol
 * @param {*} description Descripción del rol
 * @return mixed Respuesta
 */
async function createRole(description)
{
    var id = encryption.generateCodeUser()
    return new Promise((resolve) => {
        var docRef = database.collection('type_users').doc(id);
        docRef
            .set({
                description: description,
            })
            .then((snapshot) => {
                resolve('success')
            })
            .catch((err) => {
                console.log('Error in database', err);
                resolve('error_db')
            })
        
    })
}

module.exports.getRoles = getRoles
module.exports.createRole = createRole