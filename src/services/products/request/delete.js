const mongo = require('../../../db/mongo');
const {ObjectId} = require('mongodb');

async function delet(client, id) {
    console.log("[ id ]", id);
    try {
        await client.connect();
        const result = await client
            .db('xyz')
            .collection('products')
            .deleteOne({_id: ObjectId(id)});

        return result;
    }finally {
        await client.close();
    }
};

module.exports.deleteProduct = async (req, res) => {
    console.log('[ DELETE ]', req.originalUrl);
    let id = req.params.id;
    try {
        let result = await delet(mongo.client, id);
        console.log('[result]', result);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(400).json({message: "something went wrong"});
    }
};
