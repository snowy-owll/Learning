'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/edx-course-db',
    { useNewUrlParser: true})

const Post = mongoose.model('Post',
    {
        name: String,
        url: String,
        text: String,
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Comment' }]
    })
const Comment = mongoose.model('Comment',
    {
        text: String
    })

const ca = [{ text: 'Cruel…..var { house, mouse} = No type optimization at all' },
{ text: 'I think you’re undervaluing the benefit of ‘let’ and ‘const’.' },
{ text: '(p1,p2)=>{ … } ,i understand this ,thank you !' }
].map((comment) => {
    const c = new Comment(comment)
    c.save()
    return c._id
    })
console.log(ca)

const post = new Post({
    name: 'Top 10 ES6 Features every Web Developer must know',
    url: 'https://webapplog.com/es6',
    text: 'This essay will give you a quick introduction to ES6. If you don’t know what is ES6, it’s a new JavaScript implementation.',
    comments: ca
})

post.save((err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log('The post is saved: ', post.toJSON())
    }
    Post
        .findOne({ name: /Top 10 ES6/i })
        .populate('comments')
        .exec((err, post) => {
            if (err) return console.error(err)
            console.log(`The post is ${post}`)
            mongoose.disconnect()
        })
})