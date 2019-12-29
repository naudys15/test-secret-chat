'use strict'
const express = require('express'),
    bodyParser = require('body-parser'),
    admitted_routes = require('./admitted_routes'),
    users = require('../controllers/users'),
    chatrooms = require('../controllers/chatrooms'),
    { check, validationResult } = require('express-validator'),
    router = express.Router(),
    prefix = '/api/v1'

var url_request = '',
    format_request = {
        message: '', 
        status:'', 
        code:''
    },
    format_response = {
        message: '', 
        status:''
    },
    info = [],
    errors = [],
    other_errors = [],
    result_errors = [],
    data = []

router.use(
        bodyParser.urlencoded({
        extended: true
    }))
    
router.use(bodyParser.json())

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' })
})

//-------------------------------------  USUARIOS  -------------------------------------
//                                      

/**
 * Crear usuario
 */
router.post(prefix + '/createUser', [
    check('account')
        .isLength({ min: 1 })
            .withMessage('El id de la cuenta es requerido'),
    check('name')
        .isLength({ min: 1 })
            .withMessage('El nombre es requerido'),
    check('lastname')
        .isLength({ min: 1 })
            .withMessage('El apellido es requerido'),
    check('email')
        .isEmail()
            .withMessage('El correo debe tener un formato válido'), 
  ], async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        info = req.body
        errors = await(validationResult(req))
        other_errors = await(users.validationUsers(info))
        result_errors = formatErrors(errors, other_errors)
        if (typeof result_errors == 'boolean') {
            data = {
                "account"     : req.body.account,
                "name"        : req.body.firstname,
                "lastname"    : req.body.lastname,
                "email"       : req.body.email,
                "status"      : req.body.status,
                "avatar"      : req.body.avatar,
                "phone"       : req.body.phone,
                "creator"     : req.body.creator,
            }
            var result_insert = await (users.createUser(data))
            formatResponse(result_insert)
            res
                .status(format_response.code)
                .json(format_response)
            
        } else {
            res
                .status(400)
                .json({ errors: result_errors })
        }
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Editar usuario
 */
router.put(prefix + '/updateUser/:id', [
  ], async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var id = req.params.id
            info = req.body,
            data = {
                "account": info.account
            }
        var result_update = await (users.updateUserAccount(data, id))
            formatResponse(result_update)
            res
                .status(format_response.code)
                .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Cambiar tipo de usuario
 */
router.put(prefix + '/changeTypeUser/:id', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var id = req.params.id
        var result_update = await (users.changeTypeUser(id))
        formatResponse(result_update)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Borrar usuario
 */
router.delete(prefix + '/deleteUser/:id', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var id = req.params.id
        var result_delete = await (users.deleteUser(id))
        formatResponse(result_delete)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Obtener usuario por id
 */
router.get(prefix + '/getUserById/:id', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var id = req.params.id
        var result_get = await (users.getUserById(id))
        formatResponse(result_get)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Obtener todos los usuarios
 */
router.get(prefix + '/getUsers', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var result_get = await (users.getUsers())
        formatResponse(result_get)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Obtener los usuarios administradores
 */
router.get(prefix + '/getUsersAdmin', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var result_get = await (users.getUsersByTypeUser('admin'))
        formatResponse(result_get)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Obtener los usuarios clientes
 */
router.get(prefix + '/getUsersClient', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var result_get = await (users.getUsersByTypeUser('user'))
        formatResponse(result_get)
        res
            .status(format_response.code)
            .json(format_response)
        
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Inicio de sesión
 */
router.post(prefix + '/login', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        info = req.body
        if (typeof req.body.id !== undefined) {
            var id = req.body.id,
                token = req.body.token
            var login = await (users.login(id, token))
            formatResponse(login)
            res
                .status(format_response.code)
                .json(format_response)
        }
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Obtener el usuario autenticado, dado un token específico
 */
router.get(prefix + '/getUserAuthenticated', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var user = await (users.getUserById(format_request.id))
        formatResponse(user)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Cerrar sesión
 */
router.post(prefix + '/logout', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        info = req.body
        if (typeof info.id !== undefined && typeof info.reg_token !== undefined) {
            var logout = await (users.logout(info.id, info.reg_token))
            formatResponse(logout)
            res
                .status(format_response.code)
                .json(format_response)
        } else {

        }
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})
//--------------------------------------------------------------------------------------------

//-------------------------------------  INICIALIZACIÓN  -------------------------------------

/**
 * Inicializar aplicación con dos usuarios, uno admin y el otro cliente
 */
router.post(prefix + '/initializeApplication', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var initialize = await (users.initializeUsers())
        formatResponse(initialize)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

//--------------------------------------------------------------------------------------------

//-----------------------------------  MENSAJES Y ARCHIVOS  ----------------------------------

/**
 * Guardar un archivo de la aplicación
 */
router.post(prefix + '/saveFile', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var file_content = req.body.doc,
            file_type = req.body.type,
            file_location = req.body.location
        var save_file = await (chatrooms.saveFile(file_content, file_type, file_location))
        formatResponse(save_file)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Borra un archivo del almacenamiento de la aplicación
 */
router.delete(prefix + '/deleteFile/:name/:type/:location', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var file_content = req.params.name,
            file_type = req.params.type,
            file_location = req.params.location
        var save_file = await (chatrooms.deleteFile(file_content, file_type, file_location))
        formatResponse(save_file)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Guarda un mensaje de un chat en la lista interna de mensajes
 */
router.post(prefix + '/storeMessage', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var data = {
            id_chat: req.body.id_chat, 
            id_message: req.body.id_message, 
            id_sender: req.body.id_sender, 
            id_destination: req.body.id_destination,
            content: ((typeof req.body.content != undefined)? req.body.content : '')
        }
        var save_file = await (chatrooms.storeMessage(data))
        formatResponse(save_file)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Borrar todos los mensajes de un chat, actualizar en el listado interno el estatus de los mismos a borrados
 */
router.delete(prefix + '/eraseAllMessages/:id_chat', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var data = {
            id_chat: req.params.id_chat
        }
        var erase_messages = await (chatrooms.eraseAllMessages(data))
        formatResponse(erase_messages)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Borrar los chats asociados a un usuario que fue eliminado, actualizar el listado interno de los mensajes borrados
 */
router.delete(prefix + '/eraseChatsUserDeleted/:id_user', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var data = {
            id_user: req.params.id_user
        }
        var erase_chats = await (chatrooms.eraseChatsUserDeleted(data))
        formatResponse(erase_chats)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Notificar que un mensaje fue leido
 */
router.post(prefix + '/notifyReadedMessage', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var data = {
            id_chat: req.body.id_chat,
            id_message: req.body.id_message,
            content: req.body.content,
            type: req.body.type
        }
        var readed_message = await (chatrooms.notifyReadedMessage(data))
        formatResponse(readed_message)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

/**
 * Cargar mensajes del archivo a bd en MongoDB
 */
router.get(prefix + '/loadMessages', async function(req, res, next) {
    url_request = req.originalUrl
    url_request = url_request.replace(/\/api\/v1/g, "")
    format_request = await(verifyPermissionsRoute(url_request, req))
    if (format_request.code == 200) {
        var load_message = await (chatrooms.loadMessages())
        formatResponse(load_message)
        res
            .status(format_response.code)
            .json(format_response)
    } else {
        formatResponse(format_request)
        res
            .status(format_response.code)
            .json(format_response)
    }
})

//--------------------------------------------------------------------------------------------

//Dar formato a la respuesta
function formatResponse(format)
{
    format_response.message = format.message
    format_response.status = format.status
    format_response.code = format.code
}
//Dar formato a los errores
function formatErrors(err, other_err)
{
    var new_errors = []
    if (!err.isEmpty() || typeof other_err == 'object') {
        var errors_result = err.errors
        for (var index in errors_result) {
            var item = {}
            item[errors_result[index].param] = errors_result[index].msg
            new_errors.push(item)
        }
        for (var index in other_err) {
            var item = {}
            item[index] = other_err[index]
            new_errors.push(item)
        }
    }
    if (Object.keys(new_errors).length == 0) {
        return false
    } else {
        return new_errors
    }
}
//Obtener la información de la ruta admitida
function obtainInfoRoute(url_request) {
    var routeObject = ''
    admitted_routes.forEach(function(index) {
        if (url_request.includes(index.route)) {
            routeObject = index
        }
    })
    if (routeObject != '') {
        return routeObject
    } else {
        return ''
    }
}
//Verificar los permisos de una ruta específica
async function verifyPermissionsRoute(route, req)
{
    var format_response = {status:'', message: '', code:''}
    
    var info_route = obtainInfoRoute(route)
    if (typeof info_route == "object") {
        if (info_route.login == true) {
            var user_code = req.header('user')
            if (user_code == undefined) {
                format_response.message = "Error de autenticación"
                format_response.status = "error"
                format_response.code = 401
            } else {
                var check_user = await (users.checkToken(user_code))
                if (check_user != false) {
                    if (info_route.admin == false) {
                        format_response.message = "Exito"
                        format_response.status = "success"
                        format_response.code = 200
                        format_response.id = check_user.id
                        format_response.token = user_code
                    } else {
                        if (info_route.sadmin == true && check_user.status == "Sadmin") {
                            format_response.message = "Exito"
                            format_response.status = "success"
                            format_response.code = 200
                            format_response.id = check_user.id
                            format_response.token = user_code
                        } else if (info_route.sadmin == false && (check_user.status == "admin" || check_user.status == "Sadmin")) {
                            format_response.message = "Exito"
                            format_response.status = "success"
                            format_response.code = 200
                            format_response.id = check_user.id
                            format_response.token = user_code
                        } else {
                            format_response.message = "No tienes permisos para realizar la acción"
                            format_response.status = "error"
                            format_response.code = 403
                        } 
                    } 
                } else if(typeof check_user == "boolean" && check_user == false){
                    format_response.message = "Error de autenticación"
                    format_response.status = "error"
                    format_response.code = 401
                }
                
            }
        } else {
            format_response.message = "Exito"
            format_response.status = "success"
            format_response.code = 200
        }
    } else {
        format_response.message = "Página no encontrada"
        format_response.status = "error"
        format_response.code = 500
    }
    return new Promise((resolve) => {resolve(format_response)});
}
module.exports = router
