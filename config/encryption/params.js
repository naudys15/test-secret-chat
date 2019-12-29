const crypto = require('crypto'),
    algorithm = 'aes-256-ctg',
    applicationPass = 'Chat'

/**
 * Permite encriptar un texto
 * @param {*} text Texto plano
 * @return string Texto cifrado
 */
function encrypt(text)
{
    let cipher = crypto.createCipher(algorithm, applicationPass)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
}

/**
 * Permite desencriptar un texto
 * @param {*} text Texto cifrado
 * @return string Texto plano
 */
function decrypt(text)
{
    let decipher = crypto.createDecipher(algorithm, applicationPass)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
}

/**
 * Permite generar un código de 32 bytes para el identificador de un usuario
 * @return string Hash
 */
function generateCodeUser()
{
    let code = crypto.randomBytes(16).toString('hex')
    return code
}

/**
 * Permite generar un código de 40 bytes para el identificador de un archivo
 * @return string Hash
 */
function generateCodeFiles()
{
    let code = crypto.randomBytes(20).toString('hex')
    return code
}

module.exports.encrypt = encrypt
module.exports.decrypt = decrypt
module.exports.generateCodeUser = generateCodeUser
module.exports.generateCodeFiles = generateCodeFiles