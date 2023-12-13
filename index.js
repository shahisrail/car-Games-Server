const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gaxw2ro.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://carGalxy:Vyf8SbaayAJsCD8t@cluster0.bkdyuro.mongodb.net/?retryWrites=true&w=majority`;


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
    // await client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    // creating index
    // const indexKeys = { toyName: 1, sellerName: 1 };
    // const indexOptions = { name: "toySeller" };
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/searchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } },
            { sellerName: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.post("/addToy", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });
    app.get("/allToys", async (req, res) => {
      const result = await toysCollection.find({}).limit(20).toArray();
      res.send(result);
    });
    app.get("/myToys/:email", async (req, res) => {
      const query = { sellerEmail: req.params.email };
      const sort = req.query.sort;
      console.log(sort);
      const result = await toysCollection
        .find(query)
        .sort({ price: sort === "asc" ? 1 : -1 })
        .limit(20)
        .toArray();
      res.send(result);
    });
    app.get("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(filter);
      res.send(result);
    });
    app.put("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const options = { upsert: true };
      const updated = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updated, options);
      res.send(result);
    });
    app.delete("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car galaxy server is running");
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});
