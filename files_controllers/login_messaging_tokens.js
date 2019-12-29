'use strict'
const fs = require('fs'),
    Users = require('../config/database/models_mongodb').User

/**
 * Obtener el lista de tokens que han sido usados para iniciar sesión (ESTOS TOKENS CORRESPONDEN A LOS USADOS PARA ENVIAR NOTIFICACIONES)
 * @return mixed Respuesta
 */
async function getRegistrationTokens()
{
    return new Promise((resolve) => { 
        Users.find({}).exec(function(err, users) {
            if (err) resolve('error_db')
            if (users.length > 0) {
                var new_users = []
                for (var i = 0; i < users.length; i++) {
                    var user = {}
                    user.id = users[i]['_id']
                    user.user = users[i]['user']
                    user.token = users[i]['token']
                    new_users.push(user)
                }
                resolve(new_users)
            } else {
                resolve('no_token_users')
            }
        })
    })
}

/**
 * Verificar si el usuario se encuentra en la lista
 * @param {*} user Id del usuario
 * @return mixed Respuesta
 */
async function checkRegistrationTokenInList(user)
{
    return new Promise((resolve) => { 
        Users.find({user: user}).exec(function(err, new_user) {
            if (err) resolve('error_db')
            if (new_user.length > 0) {
                resolve(new_user)
            } else {
                resolve('no_token_user')
            }
        })
    })
}

/**
 * Agregar token a la lista
 * @param {*} user Id del usuario
 * @param {*} token Token
 * @return mixed Respuesta
 */
async function addToken(user, token)
{
    return new Promise(async (resolve) => { 
        if (typeof token != "undefined") {
            var data = {}
            data = {
                'token' : token,
                'user'  : user
            }
            var tokens = await(getRegistrationTokens()),
                result = ''
            if (typeof tokens === "object") {
                result = await(checkRegistrationTokenInList(user))
            } else {
                result = 'no_token_user'
            }
            if (result == 'no_token_user') {
                var insert = new Users(data)
                insert.save(function (err, user) {
                    if (err) {
                        resolve('error_db')
                    } else {
                        resolve('user_saved')
                    }
                })
            } else {
                var id = result[0]['_id']
                Users.findByIdAndUpdate(id, data, function(err, result) {
                    if (err) {
                        resolve('error_db')
                    }
                    resolve('user_saved')
                })
            } 
        } else {
            resolve("error_db")
        }
    })
}

/**
 * Permite comprobar si existe el usuario y el token en la tabla, para permitir el acceso a la aplicación
 * y prevenir que un mismo usuario pueda loguearse desde distintos dispositivos
 * @param {*} user Id del usuario
 * @param {*} token Token
 * @return mixed Respuesta
 */
async function checkValidLogin(user, token)
{
    if (tokens == null) {
        var tokens = await(getRegistrationTokens())
    }
    if (typeof tokens === "string") {
        return new Promise((resolve) => { resolve(true) }) 
    } else {
        return new Promise((resolve) => {
            var band_allow_login = false,
                band_same_user = false,
                band_user_already_logged = false,
                band_device_already_in_use_by_others = false,
                band_device_same_user = false
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].user != user && tokens[i].token == token) {
                    band_device_already_in_use_by_others = true
                }
            }  
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].user == user) {
                    band_same_user = true
                    if (tokens[i].token != '') {
                        band_user_already_logged = true
                        if (tokens[i].token == token) {
                            band_device_same_user = true
                        }
                    }
                }
            }
            if (band_same_user && !band_user_already_logged && !band_device_already_in_use_by_others && !band_device_same_user) {
                console.log("The user was in the list, wasn\'t logged, and this device wasn\'t use by anyone else")
                band_allow_login = true
                resolve(band_allow_login)
            } else if (band_same_user && band_user_already_logged && !band_device_already_in_use_by_others && band_device_same_user) {
                console.log("The user was in the list, was logged, and this device wasn\'t use by anyone else")
                band_allow_login = true
                resolve(band_allow_login)
            } else if (!band_same_user && !band_user_already_logged && !band_device_already_in_use_by_others && !band_device_same_user) {
                console.log("The user wasn\'t in the list, wasn\'t logged, and this device wasn\'t use by anyone else")
                band_allow_login = true
                resolve(band_allow_login)
            } else {
                band_allow_login = false
                resolve(band_allow_login)
            }
        })
    }
}

/**
 * Permite realizar el cierre de sesión, se libera el dispositivo y el usuario para que puedan loguearse desde otro dispositivo
 * @param {*} user Id del usuario
 * @param {*} token Token
 * @return mixed Respuesta
 */
async function liberateDeviceAndUser(user, token)
{
    return new Promise(async (resolve) => { 
        if (user != null) {
            user = user.replace(/\"/gi, '')
        }
        if (token != null) {
            token = token.replace(/\"/gi, '')
        }
        let new_user = await(checkRegistrationTokenInList(user)),
            band_user = false,
            band_token = false
        if (new_user != 'no_token_user') {
            if (new_user[0].token != '') {
                band_user = true
                new_user[0].token = ''
            } else if (new_user[0].token == '') {
                band_token = true
            }
            var id = new_user[0]['_id']
            await(Users.findByIdAndUpdate(id, new_user[0], function(err, result) {
                if (err) {
                    resolve('error_db')
                }
            }))
            if (band_user === true) {
                resolve('logout_successfully') 
            } else {
                if (band_token == true) {
                    resolve('logout_not_necessary')
                }
                resolve('logout_error')
            }
        } else {
            resolve('logout_not_necessary')
        }
    }) 
}

module.exports.addToken = addToken
module.exports.getRegistrationTokens = getRegistrationTokens
module.exports.checkRegistrationTokenInList = checkRegistrationTokenInList
module.exports.checkValidLogin = checkValidLogin
module.exports.liberateDeviceAndUser = liberateDeviceAndUser
