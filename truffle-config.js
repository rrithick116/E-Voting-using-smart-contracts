const express = require("express");
const Datastore = require("nedb");
const {Auth} = require("two-step-auth");
// const check = require("./src/app");
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

async function login(emailid){
  try{
    const data = await Auth(emailid, "Evoting");
    return data.OTP;
  }
  catch(error){
    console.log(error);
  }
}

var generated_otp;
var publicKey;
const publicKey_regex = new RegExp('0x[a-z0-9]{40}');

app.post("/signup", async (req, res)=>{
  const email = req.body.email;
  publicKey = req.body.publicKey.toLowerCase();
  console.log(publicKey);
  if (publicKey_regex.test(publicKey)){
    generated_otp = await login(email);
    res.redirect("/otp.html");
  }
  else{
    res.redirect("/usersignup.html");
  }
});

app.post("/otp", async (req, res)=>{
  const input_otp = parseInt(req.body.OTP);
  if(input_otp===generated_otp){
    await db.insert({publicKey: publicKey}, ()=>{
      console.log("success");
    });
    res.redirect("/userlogin.html");
  }
});

app.post("/verify", (req, res)=>{
  const current_account = req.body.current_account;
  db.find({publicKey: current_account}, (err, docs)=>{
    if(docs.length){
      res.json({
        status:'success'
      });
    }
    else{
      res.json({
        status:'fail'
      });
    }
  })
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