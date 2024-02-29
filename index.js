const express = require('express')
const app = express()
const cors = require('cors')
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const test = require('./testData.json');
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


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


// summer - camp - school
// OaEclFbTpRE34cj4