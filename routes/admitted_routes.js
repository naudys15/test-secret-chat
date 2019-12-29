'use strict'
//Variable que almacena las rutas admitidas en el sistema, con sus permisos y parámetros específicos
const admitted_routes = [
    {route: '/initializeApplication', output: 'initializeApplication', login: false, admin: false}, 
    //Usuarios
    {route: '/createUser', output: 'createUser', login: true, admin: true, sadmin: false}, 
    {route: '/updateUser', output: 'updateUser', login: true, admin: false, sadmin: false}, 
    {route: '/deleteUser', output: 'deleteUser', login: true, admin: true, sadmin: false}, 
    {route: '/changeTypeUser', output: 'changeTypeUser', login: true, admin: true, sadmin: false}, 
    {route: '/getUserById', output: 'getUserById', login: true, admin: true , sadmin: false}, 
    {route: '/getUsersClient', output: 'getUsersClient', login: true, admin: true, sadmin: false}, 
    {route: '/getUsersAdmin', output: 'getUsersAdmin', login: true, admin: true, sadmin: false}, 
    {route: '/getUsers', output: 'getUsers', login: true, admin: true, sadmin: false}, 
    //Login
    {route: '/login', output: 'login', login: false, admin: false, sadmin: false}, 
    {route: '/logout', output: 'logout', login: true, admin: false, sadmin: false}, 
    {route: '/getUserAuthenticated', output: 'getUserAuthenticated', login: true, admin: false, sadmin: false}, 
    //Archivos
    {route: '/saveFile', output: 'saveFile', login: true, admin: false, sadmin: false},  
    {route: '/deleteFile', output: 'deleteFile', login: true, admin: false, sadmin: false},  
    //Grupos de chat
    {route: '/eraseChatsUserDeleted', output: 'eraseChatsUserDeleted', login: true, admin: false},
    //Mensajes
    {route: '/eraseAllMessages', output: 'eraseAllMessages', login: true, admin: false, sadmin: false}, 
    {route: '/storeMessage', output: 'storeMessage', login: true, admin: false, sadmin: false}, 
    {route: '/notifyReadedMessage', output: 'notifyReadedMessage', login: true, admin: false, sadmin: false}, 
    {route: '/loadMessages', output: 'loadMessages', login: true, admin: true, sadmin: false}, 
    
]
module.exports = admitted_routes