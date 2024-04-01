const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const test = require('./testData.json');
const port = process.env.PORT || 3000;

require('dotenv').config();
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuweya4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization.split(' ')[1];
    if (!authorization) {
      return res.status(401).send({error: true, message: 'unauthorized request'})
    }
    jwt.verify(authorization, process.env.ACCESS_TOKEN, (error, decoded) => {
      if (error) {return res.status(401).send({error: true, message: 'unauthorized request'})}
      req.decoded = decoded;
      next();
    })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("scsDB");
    const usersDB = database.collection("usersDB");
    const instructors = database.collection("instructors");
    const students = database.collection("students");
    const payments = database.collection("payments");

    app.get('/classes', async(req, res) => {
      const result = await instructors.find().toArray();
      res.send(result);
    })

    app.get('/classes/:id', verifyJWT, async(req, res) => {
      const id = req.params.id;
      const query = {insID: id};
      const result = await instructors.find(query).toArray();
      res.send(result);
    })

    app.get('/enrolled/:id', verifyJWT, async(req, res) => {
      const id = req.params.id;
      const query = {student: id};
      const result = await payments.find(query).toArray();
      res.send(result);
    })

    app.get('/selections/:id', verifyJWT, async(req, res) => {
      const id = req.params.id;
      const query = {student: id};
      const result = await students.find(query).toArray();
      res.send(result);
    })

    app.get('/user/:id', async(req, res) => {
      const id = req.params.id; 
      const query = { firebaseUserID: id };
      const result = await usersDB.findOne(query);
      res.send(result);
    })

    app.get('/allusers', verifyJWT, async(req, res) => {
      const result = await usersDB.find().toArray();
      res.send(result);
    })

    app.post('/selections', async(req, res) => {
      const courseData = req.body;
      const result = await students.insertOne(courseData);
      res.send(result);
    })

    app.post('/classes', verifyJWT, async(req, res) => {
      const classData = req.body;
      const result = await instructors.insertOne(classData);
      res.send(result);
    })

    app.post('/user/:id', async(req, res) => {
      const id = req.params.id;
      const userObj = req.body;
      const query = { firebaseUserID: id };
      const result = await usersDB.findOne(query);
      let resultIns;
      if (!result?._id) {
        const doc = {
          firebaseUserID: id, name: userObj.name, email: userObj.email, userStatus: 'student'
        };
        resultIns = await usersDB.insertOne(doc);
      }
      const token = jwt.sign(userObj, process.env.ACCESS_TOKEN, {
        expiresIn: '1h'
      });
      res.send({token});
    })

    app.put('/payments/:id', async(req, res) => {
      const paymentData = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentEn = await instructors.findOne(query);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          enrolled: (currentEn.enrolled === undefined) ? 1 : (currentEn.enrolled + 1)
        },
      };
      const result = await payments.insertOne(paymentData);
      const result1 = await instructors.updateOne(filter, updateDoc);
      res.send({result, result1});
    })


    app.put('/userstatus/:id', async(req, res) =>{
      const id = req.params.id;
      const receivedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          userStatus : receivedData.userStatus
        },
      };
      const result = await usersDB.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.put('/adcourseupdate/:id', async(req, res) =>{
      const id = req.params.id;
      const receivedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = receivedData?.cStatus ? 
                        {
                          $set: {
                            cStatus : receivedData.cStatus
                                },
                        }
                        : {
                          $set: {
                            adminFB : receivedData.adminFB
                          },
                        };
      const result = await instructors.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.put('/updatethecourse/:id', async(req, res) => {
      const id = req.params.id;
      const updateCourse = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          seats: updateCourse.seats, price: updateCourse.price 
        },
      };
      const result = await instructors.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/selections/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await students.deleteOne(query);
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
  res.send('Hello World!')
})


app.get('/test', (req, res) => {
  res.send(test)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


