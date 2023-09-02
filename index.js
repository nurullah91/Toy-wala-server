const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gspcn8d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const toyCollection = client.db("toy-wala").collection("toys");

        // gallery images
        const galleryCollection = client.db("toy-wala").collection("gallery");
        const brandCollection = client.db("toy-wala").collection("brands");


        // review collection
        const reviewCollection = client.db("toy-wala").collection("review");



        // // create a index on name field;
        // const indexKeys = {toyName: 1, subCategory: 1};
        // const indexOptions = {name: 'nameCategory'};
        // const index = await toyCollection.createIndex(indexKeys, indexOptions);





        // add a toy 
        app.post('/addtoy', async (req, res) => {
            const toy = req.body;
            toy.createdAt = new Date();

            const result = await toyCollection.insertOne(toy);
            res.send(result);
        });

        // add a photo to photo gallery 
        app.post('/add-gallery-photo', async (req, res) => {
            const photoInfo = req.body;
            
            const result = await galleryCollection.insertOne(photoInfo);
            res.send(result);
        });

        // add a Review
        app.post('/add-review', async (req, res) => {
            const review = req.body;
            
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });


        // getting cars by category
        app.get('/cars-by-category/:category', async (req, res) => {
            const carCategory = req.params.category;
           
            if(carCategory == "all"){
                const cars = await toyCollection.find().toArray();

                return res.send(cars)

            }
            const cars = await toyCollection.find({ subCategory: carCategory }).toArray();

            res.send(cars);
        })

        // gallery image get 
        app.get('/gallery', async(req, res) => {

            const cursor = galleryCollection.find();

            const result = await cursor.toArray();
          
            res.send(result);
        })

        // brands data get
        app.get('/brands', async(req, res)=>{
            const result = await brandCollection.find().toArray();
            res.send(result);
        })


        // review data load
        app.get('/reviews', async(req, res)=>{
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            
            res.send(result);
        })


        // getting all toy using limit or all;
        app.get('/all-toys/:limit', async(req, res)=>{
            // get limit from params
            const limit = parseInt(req.params.limit);

            if(limit == 'all'){
                const toys = await toyCollection.find().toArray();
                return res.send(toys);
            }

            const toys = await toyCollection.find().limit(limit).toArray();
            res.send(toys)
        })



        // get multiple toy using email;
        app.get('/my-toys', async(req, res)=>{
            // get email from query
            const email = req.query?.email;

            // get sort info 
            const sorting = req.query?.sort;
          

            // create a object 
            const query = {email}


            if(sorting == 'low'){
                const result = await toyCollection.find(query).sort({price: 1}).toArray();
             return res.send(result);
            }

            if(sorting == 'high'){
                const result = await toyCollection.find(query).sort({price: -1}).toArray();
             return res.send(result);
            }

            const result = await toyCollection.find(query).toArray();
            res.send(result);
        })


        // get a toy using id 
        app.get('/toy-car/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const toy = await toyCollection.findOne(query);
            res.send(toy);
        })

        // update a toy car info
        app.put('/toy-car/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const toy = req.body;

            // getting updated info 
            const updateToy = {
                $set: {
                    details: toy.details, 
                    price: toy.price, 
                    quantity: toy.quantity, 
                    ratings: toy.ratings, 
                   
                }
            }

            const result = await toyCollection.updateOne(filter, updateToy, options)
            
            res.send(result);
        })


        // get toy car using search
        app.get('/cars-by-name/:text', async(req, res)=>{
            const searchedText = req.params.text;
            const result = await toyCollection.find({
                $or: [
                    {toyName: {$regex: searchedText, $options: "i"}},
                    {subCategory: {$regex: searchedText, $options: "i"}}
                ],
            }).toArray();

            res.send(result);
        })


        app.delete('/my-toys/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};

            const result = await toyCollection.deleteOne(query);

            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy wala server is running')
})

app.listen(port, (req, res) => {
    console.log(`Toy wala server is running on the port ${port}`);
})