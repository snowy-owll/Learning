const express = require('express')
const router = express.Router({ mergeParams: true })
const store = require('../store')
const { check, validationResult } = require('express-validator/check')

const checkComment = [
    check('text').exists({ checkNull: true, checkFalsy:true })
]

router.use((req, res, next) => {
    if (!store.posts[req.params.postId]) {
        return res.status(404).send({ errors: [`Post with number ${req.params.postId} not found`] })
    }
    next()
})

router.get('/', (req, res) => {
    return res.status(200).send(store.posts[req.params.postId].comments)
})

router.post('/', checkComment, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(422).send({ errors: errors.array() })
    }
    const post = store.posts[req.params.postId]
    const id = post.comments.length
    post.comments.push(new store.Comment(req.body.text))
    res.status(201).send({id: id})
})

router.put('/:commentId', checkComment, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(422).send({ errors: errors.array() })
    }
    const post = store.posts[req.params.postId]
    let comment = post.comments[req.params.commentId]
    if (comment) {
        comment.text = req.body.text
    }
    else {
        comment = post.comments[req.params.commentId] = new store.Comment(req.body.text)
    }
    res.status(200).send(comment)
})

router.delete('/:commentId', (req, res) => {
    store.posts[req.params.postId].comments.splice(req.params.commentId, 1)
    res.status(204).send()
})

module.exports = router
