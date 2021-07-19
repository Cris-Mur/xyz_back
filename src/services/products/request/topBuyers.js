const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

async function top(client) {
    try {
        await client.connect();

        const pipeline = [
            {
                '$unwind': {
                    'path': "$shop_history"
                }
            }, {
                '$group': {
                    '_id': '$user',
                    'purchases': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    'purchases': -1
                }
            }
        ];

        const buyers = await client
            .db('xyz')
            .collection('purchases')
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

module.exports.topBuyers = async (req, res) => {
    console.log('[ GET ]', req.originalUrl);

    try {
        let buyers = await top(mongo.client);
        console.log('[BUYERS]', buyers);
        res.status(200).json(buyers);
    } catch (err) {
        console.log(err);
        if (err.status !== undefined) {
            return res.status(err.status).json(err.message);
        }
        return res.status(400).json({message: 'something went wrong'});
    }
};
