const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npsqi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("lawers"));
app.use(fileUpload());

const port = 5000;
app.get("/", (req, res) => {
  res.send("hello Hello database how are you?");
});

const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,});
client.connect((err) => {
  const appointmentCollection = client.db("legalLitigation").collection("appointments");
  const lawerCollection = client.db("legalLitigation").collection("lawers");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
    .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;

    lawerCollection.find({ email: email })
    .toArray((err, lawers) => {
      const filter = { date: date.date };
      if (lawers.length === 0) {
        filter.email = email;
      }

      appointmentCollection.find({ filter }).toArray((err, documents) => {
        console.log(email, date.date, doctors, documents);
        res.send(documents);
      });
    });
  });
  app.post("/addALawer", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    // const filePath = `${__dirname}/lawers/${file.name}`
    // file.mv(filePath,err => {
    //   if(err){
    //     console.log(err);
    //      res.status(500).send({msg:'Failed to upload the image'})

    //   }
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: file.mimetype,
      size:file.size,
      img: Buffer.from(encImg, "base64"),
    };
    lawerCollection.insertOne({ name, email, image }).then((result) => {
      // fs.remove(filePath,error =>{
      //   if(error) {
      //     console.log(error);
      //     res.status(500).send({msg:'Failed to upload'})

      //   }
      res.send(result.insertedCount > 0);
      //})
    });

    // })
  });
  app.get("/lawers", (req, res) => {
    lawerCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/isLawer", (req, res) => {
    const email = req.body.email;

    lawerCollection.find({ email: email }).toArray((err, lawers) => {
      res.send(lawers.length > 0);
    });
  });
});

app.listen(process.env.PORT || port)
