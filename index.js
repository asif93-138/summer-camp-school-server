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

    app.get('/selections/:id', async(req, res) => {
      const id = req.params.id;
      const query = {student: id};
      const result = await students.find(query).toArray();
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

    app.put('/payments', async(req, res) => {
      const paymentData = req.body;
      const id = paymentData.course.cN;
      console.log(id);
      console.log(paymentData);
      const result = await payments.insertOne(paymentData);
      const filter = { cN: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          enrolled: 1
        },
      };
      const result1 = await instructors.updateOne(filter, updateDoc, options);
      res.send({result, result1});
    })

    app.put('updateTesting', async(req, res) => {
      const receivedData = req.body;
      console.log(receivedData);
      res.send({"status": "working"})
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