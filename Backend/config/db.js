const mongoose = require('mongoose')


const connectDB = async () =>{
    const local_DB_string= 'mongodb://localhost:27017/Webchat-LOCAL'
    try{
        const conn = await mongoose.connect(local_DB_string,{
            useNewUrlParser : true,
            useUnifiedTopology :true,
            
        })
    // console.log(`MongoDb connected : ${conn.connection.host}`)  //local 
    console.log(`Database name: ${conn.connection.name}`);

    }
    catch(err){
        console.log('Here is some error messsage: ',err.message)
        process.exit()
    }
}
module.exports = connectDB
