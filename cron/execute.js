'use strict'
const task_1 = require('./delete_messages'),
    task_2 = require('./send_notifications')

//Iniciar los cron correspondientes
task_1.start()
task_2.start()