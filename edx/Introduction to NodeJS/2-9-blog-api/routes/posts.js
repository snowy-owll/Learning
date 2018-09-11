const express = require('express')
const router = express.Router()
const store = require('../store')
const { check, validationResult } = require('express-validator/check')
const comments = require('./comments')

const postCheck = [
    check('name').exists({ checkNull: true, checkFalsy: true }),
    check('url').exists({ checkNull: true, checkFalsy: true }).isURL(),
    check('text').exists({ checkNull: true, checkFalsy: false })
]

router.use('/:postId/comments', comments)

router.get('/', (req, res) => {
    res.status(200).send(store.posts)
})

router.post('/', postCheck, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(422).send({ errors: errors.array() })
    }
    const id = store.posts.length
    store.posts.push(new store.Post(req.body.name, req.body.url, req.body.text))
    res.status(201).send({id: id})
})

router.put('/:postId', postCheck, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send({ errors: errors.array() })
    }
    let post = store.posts[req.params.postId]
    if (post) {
        post.name = req.body.name
        post.url = req.body.url
        post.text = req.body.text
    } else {
        post = store.posts[req.params.postId] = new store.Post(req.body.name, req.body.url, req.body.text)
    }
    res.status(200).send(post)
})

router.delete('/:postId', (req, res) => {
    store.posts.splice(req.params.postId, 1)
    res.status(204).send()
})

module.exports = router
