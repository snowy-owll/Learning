'use strict';

const fs = require('fs')
const path = require('path')
const async = require('async')
const mongodb = require('mongodb')

const url = 'mongodb://localhost:27017/edx-course-db'
const customerData = [];
const objectsPerQuery = parseInt(process.argv[2])

if (isNaN(objectsPerQuery)) {
    console.error(`Argument "${process.argv[2]}" is not a number`)
    process.exit(1)
}

mongodb.MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        console.error(`Can not connect to db (${error})`)
        return process.exit(1)
    }
    const db = client.db()
    const collection = db.collection('customer-data')

    async.eachSeries(
        [path.join(__dirname, 'm3-customer-data.json'), path.join(__dirname, 'm3-customer-address-data.json')],
        (filename, callback) => {
            fs.readFile(filename, 'utf8', (error, data) => {
                if (!error) {
                    customerData.push(JSON.parse(data))
                }
                callback(error)
            })
        },
        (error) => {
            if (error) {
                console.error(`Can not read files (${error})`)
                return process.exit(1)
            }
            const tasks = []
            let dataLeft = customerData[0].length
            while (dataLeft > 0) {
                const offset = tasks.length
                tasks.push((callback) => {
                    const merged = []
                    const start = offset * objectsPerQuery
                    const end = ((offset + 1) * objectsPerQuery < customerData[0].length)
                        ? (offset + 1) * objectsPerQuery : customerData[0].length;
                    for (let i = start; i < end; i++) {
                        merged.push(Object.assign(customerData[0][i], customerData[1][i]))
                    }
                    collection.insertMany(merged, (error, results) => {
                        if (error) {
                            console.error(`Can not insert many objects to db (${error})`)
                            callback(error, `Objects from ${start} to ${end} not restored`)
                        }
                        callback(null, `Objects from ${start} to ${end} successfully restored`)
                    })
                })
                dataLeft -= objectsPerQuery
            }
            async.parallel(tasks, (error, results) => {
                if (error) {
                    return console.error(error)
                }
                console.log(`Resore ended\n${results.join('\n')}`)
                client.close()
            })
        }
    )
})