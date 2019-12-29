'use strict'
const database = require('../config/database/connection').db,
    admin = require('../config/database/connection').admin,
    jwt = require('jsonwebtoken'),
    encryption = require('../config/encryption/params'),
    roles_model = require('./roles'),
    blacklist = require('../files_controllers/blacklist'),
    reg_tokens = require('../files_controllers/login_messaging_tokens')

var users = {}

/**
 * Permite crear un nuevo usuario
 * @param {*} data Datos para crear el usuario
 * @return boolean Respuesta
 */
async function createUser(data)
{
    var id = encryption.generateCodeUser()
    return new Promise((resolve) => {
        admin.auth().createUser({
            email: data.account+'@secretchat.com',
            password: data.account
          })
        .then(function(result) {
            console.log("Created in authentication")
            var docRef = database.collection('users').doc(id);
            var avatar = '',
                name = '',
                phone = '',
                creator = ''
            if (typeof data.avatar != 'undefined') {
                avatar = data.avatar
            }
            if (typeof data.name !== 'undefined') {
                name = data.name
            }
            if (typeof data.phone !== 'undefined') {
                phone = data.phone
            }
            if (typeof data.creator !== 'undefined') {
                creator = data.creator
            }
            var data_insert = {
                account : data.account,
                avatar : avatar,
                email : data.email,
                name : name,
                lastname : data.lastname,
                phone : phone,
                status : data.status,
                userId: result.uid,
                creator : creator,
            }
            docRef
                .set(data_insert)
                .then((snapshot) => {
                    console.log("Created in users")
                    resolve(true)
                })
                .catch((err) => {
                    console.log('Error in database: ', err);
                    resolve(false)
                })
        });
        
    })
}

/**
 * Permite actualizar el id de acceso de un usuario
 * @param {*} data Identificador de la cuenta
 * @param {*} id Id del usuario
 * @return string Respuesta
 */
async function updateUserAccount(data, id)
{
    var currentUser = await(this.getUserByUid(id))
    if (currentUser != false) {
        var user = database.collection('users').doc(currentUser.id),
            userId = id,
            checkAccountId = await(this.checkAccountId(data.account, userId)),
            data = {
                account : data.account,
            },
            dataAuthentication = {
                email: data.account + '@secretchat.com',
                password: data.account
            }
    }
    return new Promise((resolve) => {
        if (user != undefined) {
            if (checkAccountId == true) {
                resolve('account_already_in_use')
            }
            admin.auth().updateUser(userId, dataAuthentication)
            .then(function(result) {
                console.log("Updated in authentication")
                user
                    .update(data)
                    .then((snapshot) => {
                        console.log("Updated in users")
                        resolve('success')
                    })
                    .catch(function(error) {
                        console.log('Error in database: ', error);
                        resolve('error_db')
                    });
            });
        } else {
            resolve('no_user')
        }
    })
}

/**
 * Permite cambiar el tipo de un usuario (De admin a user y viceversa)
 * @param {*} id Id del usuario
 * @return string Respuesta
 */
async function changeTypeUser(id)
{
    var currentUser = await(this.getUserByUid(id))
    if (currentUser != false) {
        var user = database.collection('users').doc(currentUser.id),
        data = {
            status: (currentUser.status == 'user')?'admin':'user'
        }
    }
    return new Promise((resolve) => {
        if (user != undefined) {
            user
                .update(data)
                .then((snapshot) => {
                    resolve('success')
                })
                .catch(function(error) {
                    console.log('Error in database: ', error);
                    resolve('error_db')
                });
        } else {
            resolve('no_user')
        }
    })
}

/**
 * Permite borrar un usuario
 * @param {*} id Id del usuario
 * @return string Respuesta
 */
async function deleteUser(id)
{
    var currentUser = await(this.getUserByUid(id))
    if (currentUser != false) {
        var user = database.collection('users').doc(currentUser.id),
        userId = id
    }
    return new Promise((resolve) => {
        if (user != undefined) {
            user
                .delete()
                .then((snapshot) => {
                    console.log("Deleted in users")
                    admin.auth().deleteUser(userId)
                        .then(function() {
                            console.log("Deleted in authentication")
                            resolve('success')
                        })
                        .catch(function(error) {
                            console.log('Error in database: ', error);
                            resolve('error_db')
                        });
                })
        } else {
            resolve('no_user')
        }
    })
}

/**
 * Permite obtener el usuario por el id
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function getUserById(id)
{
    return new Promise((resolve) => {
        database
            .collection('users')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.id === id) {
                        var data = doc._fieldsProto,
                            new_data = {}
                        new_data.id = doc.id
                        new_data.account = data.account.stringValue
                        new_data.avatar = data.avatar.stringValue
                        new_data.email = data.email.stringValue
                        new_data.name = data.name.stringValue
                        new_data.lastname = data.lastname.stringValue
                        new_data.phone = data.phone.stringValue
                        new_data.status = data.status.stringValue
                        new_data.userId = data.userId.stringValue
                        resolve(new_data)
                    }
                })
                resolve(false)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve(false)
            })
    })
}

/**
 * Permite obtener el usuario por su uid (UID ES EL USADO POR FIREBASE PARA IDENTIFICAR UN USUARIO EN SU TABLA AUTHENTICATION)
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function getUserByUid(id)
{
    return new Promise((resolve) => {
        database
            .collection('users')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var data = doc._fieldsProto
                    if (data.userId.stringValue === id) {
                        var new_data = {}
                        new_data.id = doc.id
                        new_data.account = data.account.stringValue
                        new_data.avatar = data.avatar.stringValue
                        new_data.email = data.email.stringValue
                        new_data.name = data.name.stringValue
                        new_data.lastname = data.lastname.stringValue
                        new_data.phone = data.phone.stringValue
                        new_data.status = data.status.stringValue
                        new_data.userId = data.userId.stringValue
                        resolve(new_data)
                    }
                })
                resolve(false)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve(false)
            })
    })
}

/**
 * Permite obtener todos los usuarios
 * @return mixed Respuesta
 */
async function getUsers()
{
    let all_users = {},
        number_all_users = 0
    return new Promise((resolve) => {
        database
            .collection('users')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var data = doc._fieldsProto,
                        new_data = {}
                    new_data.id = doc.id
                    new_data.account = data.account.stringValue
                    new_data.avatar = data.avatar.stringValue
                    new_data.email = data.email.stringValue
                    new_data.name = data.name.stringValue
                    new_data.lastname = data.lastname.stringValue
                    new_data.phone = data.phone.stringValue
                    new_data.status = data.status.stringValue
                    new_data.userId = data.userId.stringValue
                    all_users[number_all_users] = new_data
                    number_all_users++
                });
                resolve(all_users)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve(false)
            })
    })
}

/**
 * Permite obtener los usuarios por tipo
 * @param {*} type_user Tipo de usuario
 * @return mixed Respuesta
 */
async function getUsersByTypeUser(type_user)
{
    let users_by_type = {},
        number_users_by_type = 0
    if (type_user != 'admin' && type_user != 'user') {
        return new Promise((resolve) => { resolve(false) })
    }
    return new Promise((resolve) => {
        database
            .collection('users')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var data = doc._fieldsProto
                    if (data.status.stringValue == type_user) {
                        var new_data = {}
                        new_data.id = doc.id
                        new_data.account = data.account.stringValue
                        new_data.avatar = data.avatar.stringValue
                        new_data.email = data.email.stringValue
                        new_data.name = data.name.stringValue
                        new_data.lastname = data.lastname.stringValue
                        new_data.phone = data.phone.stringValue
                        new_data.status = data.status.stringValue
                        new_data.userId = data.userId.stringValue
                        users_by_type[number_users_by_type] = new_data
                        number_users_by_type++
                    }
                });
                resolve(users_by_type)
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve(false)
            })
    })
}

/**
 * Permite comprobar si el token es válido
 * @param {*} token Token de autenticación
 * @return mixed Respuesta
 */
async function checkToken(token)
{
    var check = await(blacklist.checkTokenInBlacklist(token))
    if (check == true) {
        return new Promise ((resolve) => { resolve(false) })
    }

    jwt.verify(token, 'Secret Password', function(err, user) {
        if (err) {
            check = false
        } else if (user != undefined) {
            check = user.id
        }
    })
    if (check == false) {
        return new Promise ((resolve) => { resolve(false) })
    } else {
        var user = await(getUserById(check))
        user.id = check
        return new Promise ((resolve) => { resolve(user) })
    }
    
}

/**
 * Permite realizar el inicio de sesión
 * @param {*} code Id del usuario
 * @param {*} reg_token Token de registro de dispositivo (Para las notificaciones)
 * @return mixed Respuesta
 */
async function login(code, reg_token)
{
    var band = false
    return new Promise((resolve) => {
        database
            .collection('users')
            .get()
            .then((snapshot) => {
                var token = ''
                snapshot.forEach(async (doc) => {
                    var data = doc._fieldsProto
                    if (data.userId.stringValue == code) {
                        band = true
                        var result_login = await(reg_tokens.checkValidLogin(code, reg_token))
                        if (result_login == true) {
                            var uid = data.userId.stringValue,
                                tokenData = {id:doc.id}
                            token = jwt.sign(tokenData, 'Secret Password', {
                                expiresIn: 60 * 60 * 24 // expires in 24 hours
                            })
                            console.log("User has logged in with the user ", code, " and the token ", reg_token)
                            var result = await(reg_tokens.addToken(code, reg_token))
                            resolve(token)
                        } else {
                            resolve('login_from_two_different_devices')
                        }
                    }
                })
                if (!band) {
                    resolve('wrong_credentials')
                }
            })
            .catch((err) => {
                console.log('Error in database: ', err);
                resolve('error_db')
            })
    })
}

/**
 * Permite realizar el cierre de sesión, se libera el dispositivo y el usuario para que puedan loguearse desde otro dispositivo
 * @param {*} code Id del usuario
 * @param {*} reg_token Token de registro de dispositivo (Para las notificaciones)
 * @return mixed Respuesta
 */
async function logout(id, reg_token)
{
    var result = await(reg_tokens.liberateDeviceAndUser(id, reg_token))
    return new Promise((resolve) => { resolve(result) })
}

/**
 * Permite chequear y comprobar si el formato del email es correcto
 * @param {*} email Correo electrónico
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function checkEmail(email, id = null)
{
    if (users == null || users == undefined) {
        users = await(this.getUsers())
    }
    for (var index in users) {
        if (id == null) {
            if (users[index].email == email) {
                return true
            }
        } else {
            if (users[index].email == email && users[index].id != id) {
                return true
            }
        }
        
    }
    return false
}

/**
 * Permite chequear y comprobar si el formato del identificador de cuenta es válido
 * @param {*} account Nuevo identificador
 * @param {*} id Id del usuario
 * @return mixed Respuesta
 */
async function checkAccountId(account, id = null)
{
    var users = await(this.getUsers())
    for (var index in users) {
        if (id == null) {
            if (users[index].account == account) {
                return true
            }
        } else {
            if (users[index].account == account && users[index].userId != id) {
                return true
            }
        }
    }
    return false
}

/**
 * Permite crear un usuario administrador inicial
 * @return mixed Respuesta
 */
async function createUserAdminDefault()
{
    return new Promise((resolve) => {
        admin.auth().createUser({
            email: '888888@secretchat.com',
            password: '888888'
        })
        .then(function(result) {
            var docRef = database.collection('users').doc('888888');
            docRef
                .set({
                    account : '888888',
                    avatar :'',
                    email :  'admin@secretchat.com',
                    name : 'Admin',
                    lastname : 'del Sistema',
                    phone : '34123456789',
                    status : 'admin',
                    userId : result.uid
                })
                .then((snapshot) => {
                    resolve(true)
                })
                .catch((err) => {
                    console.log('Error in database: ', err);
                    resolve(false)
                })
        });
    })
}

/**
 * Permite crear un usuario no administrador inicial
 * @return mixed Respuesta
 */
async function createUserNoAdminDefault()
{
    return new Promise((resolve) => {
        admin.auth().createUser({
            email: '444444@secretchat.com',
            password: '444444'
        })
        .then(function(result) {
            var docRef = database.collection('users').doc('444444');
            docRef
                .set({
                    account : '444444',
                    avatar :'',
                    email :  'client@secretchat.com',
                    name : 'Cliente',
                    lastname : 'del Sistema',
                    phone : '340012345678',
                    status : 'user',
                    userId : result.uid
                })
                .then((snapshot) => {
                    resolve(true)
                })
                .catch((err) => {
                    console.log('Error in database: ', err);
                    resolve(false)
                })
        });
    })
}

/**
 * Permite crear roles y usuarios en la inicialización de la aplicación
 * @return mixed Respuesta
 */
async function createRolesAndUsers()
{
    return new Promise(async (resolve) => {
        var result1 = await(roles_model.createRole('admin'))
        if (result1 == true) {
            console.log("Role created successfully")
        }
        var result2 = await(roles_model.createRole('user'))
        if (result2 == true) {
            console.log("Role created successfully")
        }
        var result3 = await(createUserAdminDefault())
        if (result3 == true) {
            console.log("Administrator created successfully")
        }
        var result4 = await(createUserNoAdminDefault())
        if (result4 == true) {
            console.log("Client created successfully")
        }
        if (result1 == true && result2 == true && result3 == true && result4 == true) {
            resolve(true);
        } else {
            resolve(false);
        }
    })
}

module.exports.createUser = createUser
module.exports.updateUserAccount = updateUserAccount
module.exports.changeTypeUser = changeTypeUser
module.exports.deleteUser = deleteUser
module.exports.getUserById = getUserById
module.exports.getUserByUid = getUserByUid
module.exports.getUsers = getUsers
module.exports.login = login
module.exports.logout = logout
module.exports.createRolesAndUsers = createRolesAndUsers
module.exports.getUsersByTypeUser = getUsersByTypeUser
module.exports.createUserAdminDefault = createUserAdminDefault
module.exports.createUserNoAdminDefault = createUserNoAdminDefault
module.exports.checkToken = checkToken
module.exports.checkEmail = checkEmail
module.exports.checkAccountId = checkAccountId