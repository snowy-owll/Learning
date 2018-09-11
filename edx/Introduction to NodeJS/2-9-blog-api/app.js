'use strict';

const express = require('express')
const logger = require('morgan')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')
const posts = require('./routes/posts')

const app = express()
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(errorhandler())

app.use('/posts', posts)

app.listen(3000)
