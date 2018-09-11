class Post {
    constructor(name, url, text) {
        this.name = name
        this.url = url
        this.text = text
        this.comments = []
    }
}

class Comment {
    constructor(text) {
        this.text = text
    }
}

module.exports = {
    posts: [],
    Post: Post,
    Comment: Comment
}
