const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db');

// Connect to DB
db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());

//HTTP logger
//app.use(morgan('combined'))

//template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
  }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
