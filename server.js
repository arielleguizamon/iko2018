const express = require('express')
const request = require('request')
const bodyParser = require("body-parser");
var multer = require('multer')
var upload = multer({dest: 'uploads/'})
const fs = require('fs')
const app = express()

app.use(bodyParser.urlencoded({extended: false}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json())

var flag = false

const uri = 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.1/Prediction/921c1f61-e818-4e8f-9fdd-507aacf34480/image'
const headers = {
  'Prediction-Key': '85e4485ebfd746ba98f1726401532eab',
  'Content-type': 'application/octet-stream'
}

var options = {
  uri: uri,
  port: 443,
  method: 'POST',
  headers: headers
};

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/flag', (req, res) => res.send(flag))

app.get('/changeflag', (req, res) => {
  flag = !flag;
  res.send(flag)
})

app.post('/analyze', upload.single('file'), (req, res) => {
  fs.rename(req.file.path, 'uploads/image.jpg', (err) => {
    if (err)
      console.log(err)

    fs.readFile('uploads/image.jpg', function(err, data) {

      options.body = data
      request(options, (err, res, body) => {
        if (err)
          console.log(err);
        body = JSON.parse(body);
        for (var prediction of body.Predictions) {
          console.log(prediction);
          if (prediction.Probability && prediction.Tag == 'iko' > 0.75) {
            flag = !flag;
            console.log('ALERTA ! Se encontraron posibles metástasis');
          }
        }
      })
    })
  })
  return res.send('Ok')

})

app.listen(3000, '0.0.0.0', () => console.log('Listening on port 3000!'))
