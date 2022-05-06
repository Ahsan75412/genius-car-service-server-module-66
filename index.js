const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//use middleware 

app.use(cors());
app.use(express.json());

//verify access token function

function verifyJWT(req , res , next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Access denied'});
        }
        console.log(decoded);
        req.decoded = decoded;
        next();
    })
  
    
}


// connect server to database from "click database and connect to it"

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bewwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// order collection database create on mongoDB
const orderCollection = client.db('geniusCar').collection('order');

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');

        //Authentication or access token

        app.post('/login' , async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET , {
                expiresIn: '1d'
            });
            res.send({accessToken});
        });



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


        // order collection API

        app.get('/order', verifyJWT, async(req,res)=>{ 
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if(email === decodedEmail ){
                const query = {email : email};
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);

            }
            else{
                res.status(403).send({message: 'Access'});
            }
           
        });

        app.post('/order', async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
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

app.get('/hero' , (req, res) => {
    res.send('Hero Meets Hero Ku');
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});