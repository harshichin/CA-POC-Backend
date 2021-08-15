const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');
const pdfreader = require("pdfreader");

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

// let upload=multer({dest:'uploads/'})
app.post('/file', upload.single('file'), (req, res, next) => {
  const file = req.file
  console.log(file.path);
  filesUploaded = file.filename;

  if (!file) {
    const error = new Error('Please upload  a file');
    error.httpStatusCode = 400
    return next(error)
  }
  filesPrint(filesUploaded);
  res.send(file);
});

var rows = {}; // indexed by y-position

function printRows() {
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) =>
      console.log((rows[y]))
      //  dat = ((rows[y] || []).join("  ")),
      //  console.log(dat)
      // fs.writeFileSync( './uploads/data.txt', (rows[y] || []).join("  "))
    );
  // fs.writeFileSync("./dummy.pdf"), pdfParser.getRawTextContent();
}

function filesPrint(filesUploaded) {
  console.log(filesUploaded);
  new pdfreader.PdfReader().parseFileItems(
    `uploads/${filesUploaded}`,
    function (err, item) {
      if (!item || item.page) {
        // end of file, or page
        printRows();
        //   console.log("PAGE:", item.page);
        rows = {}; // clear rows for next page
      } else if (item.text) {
        // accumulate text items into rows object, per line
        (rows[item.y] = rows[item.y] || []).push(item.text);
        // const dataaa = item.text
        // dataObj = {dataaa}
        // console.log("obj",dataObj);
        // fs.appendFileSync("./files/dummy.json", dataaa+' ', function (err) {
        //     if (err) throw err;
        //     console.log('Saved!');
        //   });

      }
    }
  );
}


app.get("/", (req, res) => {
  res.send(`<h1 style='text-align:center'>
  welcome</h1>`);
});

app.listen(3000, () => {
  console.log("the server started on port 3000");
});