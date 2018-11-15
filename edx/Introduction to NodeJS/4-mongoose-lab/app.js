'use strict'

const express = require('express')
const logger = require('morgan')
const errorhandler = require('errorhandler')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator/check')

const url = 'mongodb://localhost/edx-course-db'

mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
mongoose.connect(url, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.error(err)
        return process.exit(1)
    }

    const Account = mongoose.model('Account',
        {
            name: String,
            balance: Number
        })

    const app = express()
    if (app.get('env') === 'production') {
        app.use(logger('combined'))
    } else {
        app.use(logger('dev'))
    }
    app.use(bodyParser.json())

    app.get('/accounts', (req, res, next) => {
        Account.find().lean().exec((err, accounts) => {
            if (err) return next(err)
            res.send(accounts)
        })
    })
    app.post('/accounts',
        [
            check('name').exists({ checkFalsy: true }).isString(),
            check('balance').exists({ checkNull: true }).isNumeric()
        ],
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).send({ errors: errors.array() })
            }
            const account = new Account({
                name: req.body.name,
                balance: req.body.balance
            })
            account.save((err, results) => {
                if (err) return next(err)
                res.send(results.toJSON())
            })
        })
    app.put('/accounts/:id',
        [
            check('name').optional().isString().not().isEmpty(),
            check('balance').optional({ nullable: false }).isNumeric()
        ],
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(422).send({ errors: errors.array() })
            }
            Account.findOneAndUpdate({ _id: req.params.id }, {
                $set: {
                    ...(req.body.name && { name: req.body.name }),
                    ...(req.body.balance && { balance: req.body.balance })
                }
            },
                { new: true },
                (err, results) => {
                    if (err) return next(err)
                    if (!results) return res.send({ errors: [`The document with id: ${req.params.id} not found`] })
                    res.send(results.toJSON())
                })
        })
    app.delete('/accounts/:id', (req, res, next) => {
        Account.findOneAndDelete({ _id: req.params.id }, (err, results) => {
            if (err) return next(err)
            if (!results) return res.send({ errors: [`The document with id: ${req.params.id} not found`] })
            res.send(results.toJSON())
        })
    })
    if (app.get('env') === 'development') {
        app.use(errorhandler())
    }
    app.listen(3000)
})
