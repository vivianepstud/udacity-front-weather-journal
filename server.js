const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const projectData = [];
const port = 3000;

// Start up an instance of app
const app = express();
/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));
app.use(express.static('website/static'));

// Setup Server
const server = app.listen(port,
  () => console.log(`Server is running on port ${3000}`));

app.get('/getData', (req, res) => {
  res.send(projectData);
});

app.post('/addData', (req, res) => {
  console.log('Post request receive on /addData');
  const { body } = req;
  projectData.push({
    temperature: body.temperature,
    date: body.date,
    userResponse: body.userResponse,
  });
  res.send("ok");
});