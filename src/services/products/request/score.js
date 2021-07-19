const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

async function review(client, user, productId, purchaseId, score) {
    try {
        await client.connect();
        
        const purchase = await client
            .db('xyz')
            .collection('products')
            .findOneAndUpdate(
                { _id: ObjectId(productId) },
                { $push: {reviews: {score, user, purchaseId}} }
            );

        console.log('[PURCHASE]', purchase);
        return purchase;
    } finally {
        await client.close();
    }
};

module.exports.makeReview = async (req, res) => {
    console.log('[ POST ]', req.originalUrl);
    
    let score = parseInt(req.body.score);
    if (score > 5 || score < 0 || isNaN(score))
        return res.status(400).json('the score needs be a biggest than 0 and less than 5');
    let user = req.body.user;
    if (user === undefined)
        return res.status(400).json('the user name is required');

    let purchaseId = req.body.purchaseId;
    if (purchaseId === undefined)
        return res.status(400).json('the purchaseId is required');
    
    let productId = req.body.productId;
    if (productId === undefined)
        return res.status(400).json('the productId is required');

    try {
        const result = await review(mongo.client, user, productId, purchaseId, score);
        console.log('[result]', result);
        res.status(200).json(result);
    } catch (err) {
        console.log('[ review ERROR ]', err);
        return res.status(400).json('something went wrong');
    }
};
