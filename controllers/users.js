'use strict'
const users_model = require('../models/users'),
    roles_model = require('../models/roles')

var format_request = {}

/**
 * Permite verificar que el token jwt sea válido
 * @param {*} token Token
 */
async function checkToken(token)
{
    let check_user = await (users_model.checkToken(token))
    return check_user
}

/**
 * Permite crear un usuario
 * @param {*} data Datos para crear el usuario
 * @return format_request Respuesta
 */
async function createUser(data)
{
    let result_insert = await (users_model.createUser(data))
    if (result_insert == true) {
        format_request.code = 201
        format_request.status = 'success'
        format_request.message = 'Usuario creado correctamente'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'Hubo un error en base de datos'
    }
    return format_request
}

/**
 * Permite actualizar un usuario
 * @param {*} data Datos para actualizar
 * @param {*} id Id del usuario
 * @return format_request Respuesta
 */
async function updateUserAccount(data, id)
{
    let result_update = await (users_model.updateUserAccount(data, id))
    if (result_update == 'success') {
        format_request.code = 201
        format_request.status = 'success'
        format_request.message = 'Usuario actualizado correctamente'
    } else if (result_update == 'error_db') {
        format_request.code = 500
        format_request.status = 'error'
        format_request.message = 'Hubo un error en base de datos'
    } else if (result_update == 'account_already_in_use') {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'El identificador ya está siendo usado por otro usuario'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'El usuario no fue encontrado'
    }
    return format_request
}

/**
 * Permite cambiar el tipo de usuario
 * @param {*} id Id del usuario
 * @return format_request Respuesta
 */
async function changeTypeUser(id)
{
    let result_update = await (users_model.changeTypeUser(id))
    if (result_update == 'success') {
        format_request.code = 201
        format_request.status = 'success'
        format_request.message = 'Usuario actualizado correctamente'
    } else if (result_update == 'error_db') {
        format_request.code = 500
        format_request.status = 'error'
        format_request.message = 'Hubo un error en base de datos'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'El usuario no fue encontrado'
    }
    return format_request
}

/**
 * Permite borrar un usuario
 * @param {*} id Id del usuario
 * @return format_request Respuesta
 */
async function deleteUser(id)
{
    let result_update = await (users_model.deleteUser(id))
    if (result_update == 'success') {
        format_request.code = 204
        format_request.status = 'success'
        format_request.message = 'Usuario eliminado correctamente'
    } else if (result_update == 'error_db') {
        format_request.code = 500
        format_request.status = 'error'
        format_request.message = 'Hubo un error en base de datos'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'El usuario no fue encontrado'
    }
    return format_request
}

/**
 * Permite obtener un usuario por su id
 * @param {*} id Id del usuario
 * @return format_request Respuesta
 */
async function getUserById(id)
{
    let result_get = await (users_model.getUserById(id))
    if (result_get != false) {
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = result_get
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'El usuario no existe'
    }
    return format_request
}

/**
 * Permite obtener todos los usuarios
 * @return format_request Respuesta
 */
async function getUsers()
{
    let result_get = await (users_model.getUsers())
    if (result_get != false) {
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = result_get
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No hay usuarios registrados en la base de datos'
    }
    return format_request
}

/**
 * Permite obtener los usuarios por tipo
 * @param {*} type Tipo de usuario
 * @return format_request Respuesta
 */
async function getUsersByTypeUser(type)
{
    let result_get = await (users_model.getUsersByTypeUser(type))
    if (result_get != false) {
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = result_get
    } else {
        format_request.code = 400
        format_request.status = 'error'
        var type_message = ''
        if (type == 'admin') {
            type_message = 'administradores'
        } else if (type == 'client') {
            type_message = 'clientes'
        }
        format_request.message = 'No hay usuarios ' + type_message + ' registrados en la base de datos'
    }
    return format_request
}

/**
 * Permite realizar el inicio de sesión
 * @param {*} id Id del usuario
 * @param {*} reg_token Token de dispositivo para el envío de notificaciones 
 * @return format_request Respuesta
 */
async function login(id, reg_token)
{
    let login = await (users_model.login(id, reg_token))
    if (login == 'login_from_two_different_devices') {
        console.log('User can\'t logged from two different devices')
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'No puedes logearte desde dos distintos dispositivos'
    } else if (login == 'wrong_credentials') {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'Error en las credenciales'
    } else if (login == 'error_db') {
        format_request.code = 500
        format_request.status = 'error'
        format_request.message = 'Hubo un error en base de datos'
    } else {
        console.log('User has login with the id ', id, ' successfully')
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = login
    }
    return format_request
}

/**
 * Permite obtener el usuario autenticado
 * @param {*} id Id del usuario
 * @return format_request Respuesta
 */
async function getUserAuthenticated(id)
{
    let user = await (users_model.getUserById(id))
    if (user != false) {
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = user
    }
    return format_request
}

/**
 * Permite realizar el cierre de sesión
 * @param {*} id Id del usuario
 * @param {*} reg_token Token de dispositivo para el envío de notificaciones 
 * @return format_request Respuesta
 */
async function logout(id, reg_token)
{
    let response = await (users_model.logout(id, reg_token))
    if (response == 'logout_successfully') {
        console.log('The user has logout successfully')
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = 'Cierre de sesión exitoso'
    } else if (response == 'logout_not_necessary') {
        console.log('The user has logout successfully')
        format_request.code = 200
        format_request.status = 'success'
        format_request.message = 'El usuario no había iniciado sesión'
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = 'Error al cerrar sesión'
    }
    return format_request
}

/**
 * Permite inicializar los usuarios iniciales de la aplicación
 * @return format_request Respuesta
 */
async function initializeUsers()
{
    let response = await (users_model.createRolesAndUsers())
    if (response == true) {
        format_request.code = 200
        format_request.status = 'Exitoso'
        format_request.message = response
    } else {
        format_request.code = 400
        format_request.status = 'error'
        format_request.message = response
    }
    return format_request
}

/**
 * Permite validar los campos de los usuarios, que sean ingresados correctamente y no hayan duplicados
 * @param {*} req Petición
 * @param {*} id Id del usuario (Al momento de actualizar)
 */
async function validationUsers(req, id = null)
{
    let errors = [],
        type_roles = await(roles_model.getRoles()),
        validate_status_user = false,
        validate_email_user = false,
        validate_account_user = false

    for (var index in type_roles) {
        if (typeof req.status !== undefined && req.status == type_roles[index]) {
            validate_status_user = true
        }
    }
    if (validate_status_user != true) {
        errors['status'] = 'El tipo de usuario es inválido'
    }
    if (id == null) {
        validate_email_user = await(users_model.checkEmail(req.email))
    } else {
        validate_email_user = await(users_model.checkEmail(req.email, id))
    }
    if (validate_email_user == true) {
        errors['email'] = 'El correo ya existe'
    }
    if (id == null) {
        validate_account_user = await(users_model.checkAccountId(req.account))
    } else {
        validate_account_user = await(users_model.checkAccountId(req.account, id))
    }
    if (validate_account_user == true) {
        errors['account'] = 'El id de la cuenta ya existe'
    }
    if (Object.keys(errors).length === 0) {
        return false
    } else {
        return errors
    }
}

module.exports.createUser = createUser
module.exports.updateUserAccount = updateUserAccount
module.exports.changeTypeUser = changeTypeUser
module.exports.deleteUser = deleteUser
module.exports.getUserById = getUserById
module.exports.getUsersByTypeUser = getUsersByTypeUser
module.exports.getUserAuthenticated = getUserAuthenticated
module.exports.getUsers = getUsers
module.exports.checkToken = checkToken
module.exports.login = login
module.exports.logout = logout
module.exports.initializeUsers = initializeUsers
module.exports.validationUsers = validationUsers