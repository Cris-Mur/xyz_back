const {ObjectId} = require('mongodb');
const mongo = require('../../../db/mongo');

async function sell(client, id, quantity) {
    try {
        await client.connect();
        const product = await client
            .db('xyz')
            .collection('products')
            .findOne({_id: ObjectId(id)});
        console.log('[ Product response ]', product);

        if (product.stock < 1 || (product.stock - quantity) < 0)
            throw {
                message: 'we not have this quantity in stock or not have stock',
                status: 400
            };
        else {
            let sold = await client
                .db('xyz')
                .collection('products')
                .findOneAndUpdate(
                    {_id: ObjectId(id)},
                    {
                        $inc: {
                            stock: (-1)*quantity,
                            sold: quantity,
                        },
                        $set: {
                            last_sale: Date.now()
                        }
                    },
                    {
                        returnOriginal: false
                    }
                );
            // not updated object
            sold = sold.value;
            console.log('[ SOLD ]', sold);
            return sold;
        }    
    } finally {
        await client.close();
    }
};

async function invoice(client, buy, product) {
    try {
        await client.connect();

        buy.shop_history = [product];
        console.log('[ BUY ]', buy);
        let purchase = await client
            .db('xyz')
            .collection('purchases')
            .insertOne(buy);
        await client
            .db('xyz')
            .collection('purchases')
            .createIndex({user: 1}, {unique: true});
        await client
            .db('xyz')
            .collection('purchases')
            .createIndex({email: 1}, {unique: true});
        return purchase.insertedId;
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            await client.close();
            await client.connect();
            purchase = await client
                .db('xyz')
                .collection('purchases')
                .findOneAndUpdate(
                    {user: buy.user},
                    { $push: { shop_history: product } }
                );
            return purchase.value._id;
        }
    } finally {
        await client.close();
    }
};

module.exports.sellProduct = async (req, res) => {
    console.log('POST - SOLD', req.originalUrl);
    let id = req.params.id;

    let user = req.body.user;
    if (user === undefined)
        return res.status(400).json({message: 'Whats is your name?'});

    let email = req.body.email;
    const email_rex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (user === undefined || !email_rex.test(email))
        return res.status(400).json({message: 'your email is wrong'});

    let quantity = parseInt(req.body.quantity);
    if (quantity < 1 || isNaN(quantity))
        return res.status(400).json({message: 'we cant sell you this quantity'});

    let city = req.body.city;
    if (city === undefined)
        return res.status(400).json({message: 'the city is wrong'});
    /*
    let score = parseInt(req.body.score);
    console.log(score);
    if (score < 0 || score > 5 || isNaN(score)) {
        return res.status(400).json({
            message: 'the score needs be bigger than 0 and less than 5'
        });
    }*/
    let buy = {
        user: user,
        email: email,
    };
    try {
        let product = await sell(mongo.client, id, quantity);
        try {
            const time_range = product.delivery_time;
            let min = new Date((Date.now()) + (86400000 * time_range[0]));
            let max = new Date((Date.now()) + (86400000 * time_range[1]));

            product = {
                _id: ObjectId(),
                sold_at: Date.now(),
                productId: String(product._id),
                name: product.name,
                description: product.description,
                sold: quantity,
                delivery_city: city
            }
            //console.log('[ BUY ]', buy);
            let purchase = await invoice(mongo.client, buy, product);
            console.log('[ purchase ]', purchase);
            
            return res.status(200).json({
                buyerID: String(purchase),
                purchaseID: String(product._id),
                message: `you product will be delivered within ${min} to ${max}`
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: 'something went wrong'});
        }
    } catch (err) {
        console.log(err);
        if (err.status !== undefined)
            return res.status(err.status).json(err.message);
        return res.status(400).json({message: 'something went wrong'});
    }
};
