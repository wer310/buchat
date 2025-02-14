var fs = require('fs');
var express = require("express");
var bodyParser = require("body-parser");
var data = fs.readFileSync('db/data.json');
var chatObject = JSON.parse(data);
const PORT = process.env.PORT || 3000;
var app = express();

const crypto = require('crypto');

function generateRandomString(ipAddress) {
  // Создаём хеш из IP-адреса
  const hash = crypto.createHash('sha256');
  hash.update(ipAddress);

  // Получаем хеш в виде строки
  const hashString = hash.digest('hex');

  // Генерируем строку из случайных символов длинной в 10 символов
  const randomString = Array(10).fill(0).map(() => {
    const charCode = hashString.charCodeAt(Math.floor(Math.random() * hashString.length));
    return String.fromCharCode(charCode);
  }).join('');

  return hashString.slice(10);
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

//middleware: request handling
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var server = app.listen(PORT, listening);

function listening() {
    console.log(`Server is listening on port ${PORT}!`);
}

app.use(express.static('public'));

//get chat data
app.get('/api/v1/chat/data', getChatData);

//add a chat element to data
app.post('/api/v1/chat/data', addChatDataElement);

//clear chat data
app.delete('/api/v1/chat/data', clearChatData);

//get the number of visitors
app.get('/api/v1/chat/numvisitors', getChatNumVisitors);

//update the number of visitors
app.put('/api/v1/chat/numvisitors/:num', updateChatNumVisitors);

function getChatData(request, response) {
    // console.log('Getting Complete');
    response.json(chatObject.data);
}

function addChatDataElement(request, response) {
    var ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress
    chatObject.data.push({name: request.body.name + "(" + generateRandomString(ip) + ")", message: request.body.message});
    var data = JSON.stringify(chatObject, null, 2);
    fs.writeFile('db/data.json', data, finished);

    function finished(err) {
        // console.log('Writing Complete');
        response.json(chatObject.data);
    }
}

function clearChatData(request, response) {
    chatObject.data = [];
    var data = JSON.stringify(chatObject, null, 2);
    fs.writeFile('db/data.json', data, finished);

    function finished(err) {
        // console.log('Writing Complete');
        response.json(chatObject.data);
    }
}

function getChatNumVisitors(request, response) {
    // console.log('Getting Complete');
    response.json(chatObject.numVisitors);
}

function updateChatNumVisitors(request, response) {
    chatObject.numVisitors = Number(request.params.num);
    var data = JSON.stringify(chatObject, null, 2);
    fs.writeFile('db/data.json', data, finished);

    function finished(err) {
        // console.log('Writing Complete');
        response.json(chatObject.numVisitors);
    }
}
