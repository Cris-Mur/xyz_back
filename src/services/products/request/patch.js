const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

async function update(client, id, updateData) {
    console.log("[ id ]", id);
    try {
        await client.connect();
        const result = await client
            .db('xyz')
            .collection('products')
            .updateOne(
                {_id: ObjectId(id)},
                {
                    $set: updateData
                },
            );

        return result;
    }finally {
        await client.close();
    }
};

module.exports.updateProduct = async (req, res) => {
    console.log('PATCH', req.originalUrl);
    console.log("Product ID", req.params.id);
    let id = req.params.id;
    const min_time = parseInt(req.body.min_time);
    if (min_time < 1)
        return res.status(400).json('we need a valid delivery time');

    const max_time = parseInt(req.body.max_time);
    if (max_time < 2 || max_time < min_time)
        return res.status(400).json('we need a valid delivery time');
    const delivery_time = [];
    if (!isNaN(min_time) && !isNaN(max_time)) {
        delivery_time.push(min_time);
        delivery_time.push(max_time);
    }

    let updateData = {
        name: req.body.name,
        description: req.body.description,
        stock: parseInt(req.body.stock),
        update_at: Date.now(),
        delivery_time: (delivery_time.length === 2)? delivery_time : undefined
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    console.log('[ I ]', updateData);
    try {
        console.log('id ', id);
        let result = await update(mongo.client, id, updateData);
        console.log('[result]', result);
        if (result.acknowledged)
            res.status(200).json({id: id});
    } catch (err) {
        console.log(err);
        return res.status(400).json({message: "something went wrong"});
    }
};
