'use strict';

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = express.Router();

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send({ msg: 'hello world' });
});

router.use(bodyParser.json());

router.use((req, res, next) => {
    if (req.query.api_key) {
        next();
    }
    else {
        res.status(401).send({ msg: 'Not authorized' });
    }
});

router.get('/', (req, res) => {
    res.status(404).send({ msg: 'Not found' });
});

router.get('/accounts', (req, res) => {
      res.send({ msg: 'some account' });
});

router.post('/accounts', (req, res) => {
    console.log(req.body);
    res.send({ msg: 'account is added' });
});

app.use('/api', router);

app.listen(3000);