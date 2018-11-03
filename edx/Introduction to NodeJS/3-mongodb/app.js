'use strict';

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const url = 'mongodb://localhost:27017/testDB'
const collectionName = 'testobjects'

const insertDocuments = (db, callback) => {
    const collection = db.collection(collectionName)
    collection.insertMany([
        { name: 'Bob' }, { name: 'John' }, {name: 'Peter'}
    ], (error, result) => {
        if (error) {
            console.log(error)
            return process.exit(1)
        }
        console.log(result.result.n)
        console.log(result.ops.length)
        console.log('Inserted 3 documents into the edx-course-students collection')
        callback(result)
    })
}

const updateDocument = (db, callback) => {
    const collection = db.collection(collectionName)
    const name = 'Peter'
    collection.updateOne({ name: name }, { $set: { grade: 'A' } }, (error, result) => {
        if (error) return process.exit(1)
        console.log(result.result.n)
        console.log(`Updated the student document where name = ${name}`)
        callback(result)
    })
}

const removeDocument = (db, callback) => {
    const collection = db.collection(collectionName)
    const name = 'Bob'
    collection.removeOne({ name: name }, (error, result) => {
        if (error) return process.exit(1)
        console.log(result.result.n)
        console.log(`Removed the document where name = ${name}`)
        callback(result)
    })
}

const findDocument = (db, callback) => {
    const collection = db.collection(collectionName)
    collection.find({}).toArray((error, docs) => {
        if (error) return process.exit(1)
        console.log(docs.length)
        console.log('Found the following documents:')
        console.dir(docs)
        callback(docs)
    })
}

MongoClient.connect(url, { useNewUrlParser: true}, (err, client) => {
    if (err) return process.exit(1)
    console.log('Connection is okay')
    const db = client.db()
    insertDocuments(db, () => {
        updateDocument(db, () => {
            removeDocument(db, () => {
                findDocument(db, () => {
                    client.close()
                })
            })
        })
    })
})
