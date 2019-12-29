'use strict'
const fs = require('fs'),
    Blacklist = require('../config/database/models_mongodb').Blacklist

/**
 * Obtener los tokens que se encuentran en la lista negra (NO PUEDEN SER USADOS PARA REALIZAR PETICIONES EN LA API)
 * @return mixed Respuesta
 */
async function getBlacklistTokens()
{
    return new Promise((resolve) => { 
        var now = new Date()
        Blacklist.find({time_expiration: { $lt: now }}).exec(function(err, list) {
            if (err) resolve('error_db')
            if (list.length > 0) {
                var new_list = []
                for (var i = 0; i < list.length; i++) {
                    var item = {}
                    item.id = list[i]['_id']
                    item.user = list[i]['user']
                    item.token = list[i]['token']
                    item.time_expiration = list[i]['time_expiration']
                    new_list.push(item)
                }
                resolve(new_list)
            } else {
                resolve('no_tokens_in_blacklist')
            }
        })
    })
}

/**
 * Verificar si el token se encuentra en la lista negra
 * @param {*} token Token que se va a buscar
 * @param {*} tokens Lista de tokens
 * @return mixed Respuesta
 */
async function checkTokenInBlacklist(token)
{
    return new Promise((resolve) => { 
        Blacklist.find({token: token}).exec(function(err, new_token) {
            if (err) resolve('error_db')
            if (new_token.length > 0) {
                resolve(new_token)
            } else {
                resolve('no_token_in_blacklist')
            }
        })
    })
}

/**
 * Agregar token a la lista
 * @param {*} tokens Token
 * @param {*} user Id del usuario
 * @return mixed Respuesta
 */
async function addToken(token, user)
{
    return new Promise(async (resolve) => {
        var data = {},
            now = new Date()
        data = {
            'token' : token,
            'user'  : user,
            'time_expiration' : now.getTime()
        }
        var tokens = await(getBlacklistTokens()),
            result = ''
        if (typeof tokens === "object") {
            result = await(checkTokenInBlacklist(token))
        } else {
            result = 'no_token_in_blacklist'
        }
        if (result == 'no_token_in_blacklist') {
            var insert = new Blacklist(data)
            insert.save(function (err, result) {
                if (err) {
                    resolve('error_db')
                } else {
                    resolve('token_saved')
                }
            })
        } else {
            var id = result[0]['_id']
            Messages.findByIdAndUpdate(id, data, function(err, result) {
                if (err) {
                    resolve('error_db')
                }
                resolve('token_saved')
            })
        }
    })
}

module.exports.addToken = addToken
module.exports.getBlacklistTokens = getBlacklistTokens
module.exports.checkTokenInBlacklist = checkTokenInBlacklist
