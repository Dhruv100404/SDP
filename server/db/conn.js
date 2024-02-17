const mongoose = require("mongoose");

const DB = "mongodb+srv://dhruv:1234@dhruv.32n5nzq.mongodb.net/mernml";

mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=>console.log("database connected")).catch((err)=>console.log("errr",err))