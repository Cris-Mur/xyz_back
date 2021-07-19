const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

const { sellProduct } = require('./sell');
module.exports.sellProduct = sellProduct;

async function create(client, newProduct) {
    try {
        await client.connect();

        newProduct.create_at = Date.now();
        newProduct.update_at = newProduct.create_at;

        const result = await client
            .db('xyz')
            .collection('products')
            .insertOne(newProduct);

        const index = await client
            .db('xyz')
            .collection('products')
            .createIndex({"name": 1}, { unique: true});

        return result.insertedId;
    } catch (err) {
        console.log('[ CREATE ERROR ]', err);
        if (err.code === 11000) {
            // ReStart DB
            await client.close();
            await client.connect();

            const result = await client
                .db('xyz')
                .collection('products').findOneAndUpdate(
                    {name: newProduct.name},
                    {
                        $inc: { stock: newProduct.stock },
                        $set: { update_at: Date.now() }
                    },
                    {
                        returnOriginal: false
                    }
                );
            return result.value._id;
        }
    } finally {
        await client.close();
    }
};

module.exports.createProduct = async (req, res) => {
    console.log('POST', req.originalUrl);

    const name = req.body.name;
    if (name === undefined)
        return res.status(400).json('the name of product is required');

    const description = req.body.description;
    if (description === undefined)
        return res.status(400).json('the description of product is required');

    const stock = parseInt(req.body.stock);
    if ( stock < 0 || isNaN(stock))
        return res.status(400).json('we need a valid stock value');

    const min_time = parseInt(req.body.min_time);
    if (min_time < 1 || isNaN(min_time))
        return res.status(400).json('we need a valid delivery time');

    const max_time = parseInt(req.body.max_time);
    if (max_time < 2 || max_time < min_time || isNaN(max_time))
        return res.status(400).json('we need a valid delivery time');

    let newProduct = {
        name: name,
        description: description,
        stock: stock,
        delivery_time: [min_time, max_time]
    }
    console.log("[ I ]", newProduct);
    try {
        let result = await create(mongo.client, newProduct)
        return res.status(201).json({ id: result});
    } catch (err) {
        return res.status(400).json({message: "something went wrong"});
    }
};
