const mongo = require('../../../db/mongo');

async function read(client) {
    try {
        await client.connect();
        const result = await client
            .db('xyz')
            .collection('products')
            .find({}).toArray();

        if (result)
            return result;
        else
            throw {
                message: "Not found",
                status: 404
            };
    } finally {
        await client.close();
    }
};

module.exports.getProducts = async (req, res) => {
        console.log('GET', req.originalUrl);
        try {
            let result = await read(mongo.client);
            console.log('[ Result ]',result);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(err.status).json(err);
        }
}
