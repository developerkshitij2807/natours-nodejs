const dotenv = require('dotenv');
const mongoose = require('mongoose');

// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message);
//   console.log('Unhandled rejection');
//   process.exit();
// });

// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION Shutting DOWN', err.message);
//   console.log('Unhandled rejection');
//   process.exit();
// });

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(console.log('DB Connection Successful'));

const app = require('./app');

//console.log(process.env);

//SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
