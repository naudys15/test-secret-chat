'use strict'
const service_account = require("./chat.json"),
    admin = require("firebase-admin"),
    mongoose = require('mongoose'),
    local_host = 'mongodb://localhost:27017/secret_chat'

//Conexión a Firebase

//Permite inicializar la conexión con firebase
admin.initializeApp({
    credential: admin.credential.cert(service_account),
    databaseURL: "https://chat.firebaseio.com",
    messagingSenderId: '1234567890'
})

const db_firebase = admin.firestore(),
    messaging = admin.messaging()

//Conexión a MongoDB

mongoose.connect(local_host, {useNewUrlParser: true, useUnifiedTopology: true})

const db_mongodb = mongoose.connection
db_mongodb.once('open', function() {
    console.log("Connected to MongoDB database")
});

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

module.exports.db = db_firebase
module.exports.db_mongodb = mongoose
module.exports.admin = admin
module.exports.messaging = messaging