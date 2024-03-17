const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const test = require('./testData.json');
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())




const uri = "mongodb+srv://summer-camp-school:OaEclFbTpRE34cj4@cluster0.iuweya4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

    app.get('/classes/:id', async(req, res) => {
      const id = req.params.id;
      const query = {insID: id};
      const result = await instructors.find(query).toArray();
      res.send(result);
    })

    app.get('/enrolled/:id', async(req, res) => {
      const id = req.params.id;
      const query = {student: id};
      const result = await payments.find(query).toArray();
      res.send(result);
    })

    app.get('/selections/:id', async(req, res) => {
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

    app.get('/allusers', async(req, res) => {
      const result = await usersDB.find().toArray();
      res.send(result);
    })

    app.post('/selections', async(req, res) => {
      const courseData = req.body;
      const result = await students.insertOne(courseData);
      res.send(result);
    })

    app.post('/classes', async(req, res) => {
      const classData = req.body;
      const result = await instructors.insertOne(classData);
      res.send(result);
    })

    app.post('/user/:id', async(req, res) => {
      const id = req.params.id;
      const query = { firebaseUserID: id };
      const result = await usersDB.findOne(query);
      let resultIns;
      if (!result?._id) {
        const doc = {
          firebaseUserID: id, userStatus: 'student'
        };
        resultIns = await usersDB.insertOne(doc);
      }
    })

    app.put('/payments/:id', async(req, res) => {
      const paymentData = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentEn = await instructors.findOne(query);
      console.log(currentEn.enrolled);
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

    app.put('/updateTesting', async(req, res) => {
      const receivedData = req.body;
      const id = '65f1762a05945cda344fea61';
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          enrolledStd : 0
        },
      };
      const result = await instructors.updateOne(filter, updateDoc);
      res.send(result)
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

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('received!')
})

app.get('/test', (req, res) => {
  res.send(test)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// summer-camp-school
// OaEclFbTpRE34cj4