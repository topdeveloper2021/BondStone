require('dotenv').config();
let env = process.env.NODE_ENV || 'development';

const mongoURI = process.env.MONGODB_URI;
// const mongoURI = process.env.MONGODB_URI || 'MONGODB_URI=mongodb://localhost:27017/crio';
// const mongoURI = 'MONGODB_URI=mongodb://crio_mongo:27017/crio';
module.exports = {mongoURI};
