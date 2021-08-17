const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');
const pdfreader = require("pdfreader");
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'uploads')
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}`)
  }
})
var upload = multer({
  storage: storage
})

let arr = [];

app.post('/file', upload.single('file'), async (req, res, next) => {

  const file = req.file
  console.log(file.path);
  filesUploaded = file.filename;

  if (!file) {
    const error = new Error('Please upload  a file');
    error.httpStatusCode = 400
    return next(error)
  }

  await filesPrint(filesUploaded);
  console.log("ARRAY", arr);
  res.json({
    response: arr
  });
  arr = [];
});

function printRows() {

  //  arr.push(rows);
  //  console.log("array",arr);
}
var rows = {}; // indexed by y-position

function filesPrint(filesUploaded) {
  return new Promise((resolve, reject) => {
    new pdfreader.PdfReader().parseFileItems(
      `uploads/${filesUploaded}`,
      function (err, item) {
        if (!item || item.page) {
          // end of file, or page
          Object.keys(rows) // => array of y-positions (type: float)
            .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
            .forEach((y) =>
              resolve(arr.push(rows[y]))
            );

          //   console.log("PAGE:", item.page);
          rows = {}; // clear rows for next page
        } else if (item.text) {
          // accumulate text items into rows object, per line
          (rows[item.y] = rows[item.y] || []).push(item.text);
          // console.log("PUSH", item.text);
          // resolve(arr.push(item.text))

        }
      }

    ), err => {
      reject(err)
    }
  })
}



app.get("/", (req, res) => {
  res.send(`<h1 style='text-align:center'>
  welcome</h1>`);
});

app.listen(3000, () => {
  console.log("the server started on port 3000");
});