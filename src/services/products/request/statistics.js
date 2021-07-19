const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

async function statisticsByProduct(client) {
    try {
        await client.connect();

        const pipeline = [
            {
                '$unwind': {
                    'path': "$reviews"
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'reviews': {
                        '$sum': 1
                    },
                    'score': {
                        '$avg': '$reviews.score'
                    }
                }
            }, {
                '$sort': {
                    'score': -1
                }
            }
        ];

        const buyers = await client
            .db('xyz')
            .collection('products')
            .aggregate(pipeline).toArray();

        if (!buyers)
            throw {
                message: 'the top buyers arent exist',
                status: 404
            }
        return buyers;
    } finally {
        client.close();
    }
}

module.exports.revStats = async (req, res) => {
    console.log('[ GET ]', req.originalUrl);

    try {
        let stats = await statisticsByProduct(mongo.client);
        console.log('[statistics]', stats);
        res.status(200).json(stats);
    } catch (err) {
        console.log(err);
        if (err.status !== undefined) {
            return res.status(err.status).json(err.message);
        }
        return res.status(400).json({message: 'something went wrong'});
    }
};

async function statisticsByClient(client) {
    try {
        await client.connect();

        const pipeline = [
            {
                '$unwind': {
                    'path': "$reviews"
                }
            }, {
                '$group': {
                    '_id': '$reviews.user',
                    'reviews': {
                        '$sum': 1
                    },
                    'score': {
                        '$avg': '$reviews.score'
                    }
                }
            }, {
                '$sort': {
                    'score': -1
                }
            }
        ];

        const buyers = await client
            .db('xyz')
            .collection('products')
            .aggregate(pipeline).toArray();

        if (!buyers)
            throw {
                message: 'the top buyers arent exist',
                status: 404
            }
        return buyers;
    } finally {
        client.close();
    }
};
module.exports.revClients = async (req, res) => {
    console.log('[ GET ]', req.originalUrl);

    try {
        let stats = await statisticsByClient(mongo.client);
        console.log('[statistics]', stats);
        res.status(200).json(stats);
    } catch (err) {
        console.log(err);
        if (err.status !== undefined) {
            return res.status(err.status).json(err.message);
        }
        return res.status(400).json({message: 'something went wrong'});
    }
};

