const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto')
const app = express();
const pORT = 5000;

//----------------------------------------------------------------------------------------
app.use(express.urlencoded({ extends: false }))
const algorithm = 'aes-256-cbc';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);
//----------------------------------------------------------------------------------------
// Function to encrypt data
function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
//---------------------------------------------------------------------------------------
// Function to decrypt data
function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
function emailCheeck(text){

}
//----------------------------------------------------------------------------------------
//Connecting mongooes
mongoose.connect('mongodb://localhost:27017/signupDataAPI')
    .then(() => console.log('Process of Signup is Started'))
    .catch((err) => console.log('Mongo Error', err))

//schema mongooes

const userschema = new mongoose.Schema({
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,

  },
  email: {
    type: String,
    unique:true,
    set: encrypt, // Encrypt the password before saving
    get: decrypt  // Decrypt the password when retrieving
   
  },
  password: {

    type: String,
    set: encrypt, // Encrypt the password before saving
    get: decrypt  // Decrypt the password when retrieving

  },
  token:{
       type: String,
        
  }


});




//-----------------------------------------------------------------------------------
const User = mongoose.model("user", userschema )
userschema.set('toObject',{getters:true})
userschema.set('toJSON',{getters:true})

//------------------------------------------------------------------------------------
app.post('/signup', async (req, res) =>{

    const body = req.body;

    if (!body || !body.firstname || !body.lastname || !body.email || !body.password) {
        return res.status(401).json({ meg: " all fields ae required" });

    }
    femail = body.email
    const user = await User.findOne({email:femail})
    console.log(user)
    if(user){
      return res.status(401).json({ meg: "Emailis alreay present" });
      
    }
    
    console.log(body)
    // with use of mongoose data base 
    const reult = await User.create({
        firstname: body.firstname,
        lastname: body.lastname,
        email: femail,
        password:body.password,
     
        
    });
    console.log(reult)
    return res.status(201).json({
        status: "success"
    })

});
app.post('/login', async (req, res) =>{

  const body = req.body;

  if (!body.email ||!body.password) {
      return res.status(401).json({ meg: " incomplite data" });

  }
  femail = body.email
  fpassword =body.password
  const user = await User.findOne({email:femail,password:fpassword})
  console.log(user)
  if(!user){
    return res.status(401).json({ meg: " user not found" });
  }
  const reult = await User.create({
    
  })
  res.send(user)
})
app.get('/signup/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    } catch (err) {
      res.status(500).send(err);
    }

});
//----------------------------------------------------------------------------------------
app.listen(pORT, () => console.log("server started"));
//----------------------------------------------------------------------------------------