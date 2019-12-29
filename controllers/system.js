'use strict'
const params_config = require('../config/parameters/params'),
    fetch = require('node-fetch')
   
/**
 * Permite mantener viva la aplicación sin que se duerma y pierda la persistencia de los archivos
 * @return format_request Respuesta
 */
function keepApp()
{
    fetch(params_config.url_heroku)
    .then(function(response) {
        return response.text()
    })
    .catch(function(err) {
        return err
    })
}
module.exports.keepApp = keepApp