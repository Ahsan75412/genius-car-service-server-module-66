const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');
// const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//use middleware 

app.use(cors());
app.use(express.json());


// connect server to database from "click database and connect to it"

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bewwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');

        //get data from database all user API
      app.get('/service',async(req,res)=>{
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
      });

        //get single Load-data from database by API
      app.get('/service/:id', async(req,res)=>{
          const id = req.params.id;
          const query = {_id: new ObjectId(id)};
          const service = await serviceCollection.findOne(query);
          res.send(service);

      });

        //post data from UI add Service to database API

        app.post('/service', async(req,res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);

        });


        //Delete an service from backend API

        app.delete('/service/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);

        });


    }

    finally{
        // await client.close();
    }

}
//calling the async Run function
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Running Genius Server');
}); 

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});