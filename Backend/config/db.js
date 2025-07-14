const mongoose = require('mongoose')
// const mongoAtlas = 'mongodb+srv://savs2728:savita123@cluster0.ejjrn9f.mongodb.net/'

const connectDB = async () =>{
    const local_DB_string= 'mongodb://localhost:27017/'
    try{
        const conn = await mongoose.connect(local_DB_string,{
            useNewUrlParser : true,
            useUnifiedTopology :true,
            
        })
    console.log(`MongoDb connected : ${conn.connection.host}`)
    }
    catch(err){
        console.log('Here is some error messsage: ',err.message)
        process.exit()
    }
}
module.exports = connectDB