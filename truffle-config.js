const express = require("express");
const Datastore = require("nedb");
const app = express();
app.listen(3000, ()=>console.log("Listening at 3000..."));
app.use(express.static("src"));
app.use(express.static("migrations"));
app.use(express.static("contracts"));
app.use(express.static("./build/contracts"));
app.use("/vendor", express.static("./node_modules"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const db = new Datastore("database.db");
db.loadDatabase();

app.post("/signup", async (req, res)=>{
  const email = req.body.email;
  const publicKey = req.body.publicKey;
  await db.insert({email,publicKey}, ()=>{
    console.log("success");
  });
  res.redirect("/homepage.html");
});


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}