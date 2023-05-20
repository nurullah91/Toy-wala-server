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



        // create a index on name field;
        const indexKeys = {toyName: 1, subCategory: 1};
        const indexOptions = {name: 'nameCategory'};
        const index = await toyCollection.createIndex(indexKeys, indexOptions);





        // add a toy 
        app.post('/addtoy', async (req, res) => {
            const toy = req.body;
            toy.createdAt = new Date();

            const result = await toyCollection.insertOne(toy);
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

            // create a object 
            const query = {email}
            const result = await toyCollection.find(query).toArray();
            // console.log(result);
            res.send(result);
        })


        // get a toy using id 
        app.get('/toy-car/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const toy = await toyCollection.findOne(query);
            res.send(toy);
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


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy wala is running')
})

app.listen(port, (req, res) => {
    console.log(`Toy wala is running on the port ${port}`);
})