'use strict';

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/testDB', { useNewUrlParser: true })

let Book = mongoose.model('Book', { name: String })
let practicalNodeBook = new Book({ name: 'Practical Node.js' })
practicalNodeBook.save((error, results) => {
    if (error) {
        console.error(error)
        process.exit(1)
    } else {
        console.log('Saved: ', results)
        process.exit(0)
    }
})
