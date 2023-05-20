const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/',(req,res) =>{
    res.send('toy shop server is running')
})

console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjvdbic.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("toyShop");
    const toysCollection = database.collection("toys");
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const indexKeys = { toyName: 1, category: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "toyNamecategory" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions);  
    

    app.post("/addAToy", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });


app.get("/allToys", async (req, res) =>{
  const allToys = await toysCollection.find({}).toArray();
  res.send(allToys)
})

app.get("/myAllToys/:email", async(req,res) =>{
   console.log(req.params.email)
  const result = await toysCollection
  .find({
    postedBy:req.params.email
  })
  .toArray();
  res.send(result)
})

  app.get("/toySearch/:text", async (req, res) => {
    const searchText = req.params.text;
    const result = await toysCollection
      .find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } },
          { category: { $regex: searchText, $options: "i" } },
        ],
      })
      .toArray();
    res.send(result);
  });




  app.get("/allToys/:category", async (req, res) => {
      // console.log(req.params.category);
      if (
        req.params.category == "Sports Car" ||
        req.params.category == "Mini Police Car" ||
        req.params.category == "Regular Car"
      );
      const toys = await toysCollection
        .find({ category: req.params.category })
        //  .sort({ createdAt: -1 })
        .toArray();
         return res.send(toys);
    })

      app.put("/updateToy/:id", async (req, res) => {
        const id = req.params.id;
        const body = req.body;
        console.log(body);
        const filter = { _id: new ObjectId(id) };
        const updateToy = {
          $set: {
            price: body.price,
            quantity: body.quantity,
            description: body.description,
          },
        };
        const result = await toysCollection.updateOne(filter, updateToy);
        res.send(result);
      });





 }finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(5000, () => {
  console.log(`toy-shop-server is running on port, ${port}`);
});

