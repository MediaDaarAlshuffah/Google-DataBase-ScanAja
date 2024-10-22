require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')

app.set('view engine', 'pug')
app.use(bodyParser())
app.use(cors())
// --- helper functions ---
// get auth token
function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  return auth;
}

// proccure googleSheet method
async function getGoogleSheet(auth) {
  const client = await auth.getClient();
  const googleSheet = google.sheets({ version: 'v4', auth: client });
  return googleSheet;
}
// --- helper functions ---

app.get('/', (req, res)=>{
    res.render('index', {title:'404 Request', heading:"Gunakan Params", paragraph:"Sebutkan Sheet yang ingin diambil seperti /credentials/dariRow/keRow"})
})

//fetches data from the spreadsheet
app.get('/:id/:from/:to', async (req, res) => {
    const fromRow=req.param('from')
    const toRow=req.param('to')
    const spreadsheetId = req.param('id')
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  // const getMetaData = await googleSheet.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // });
    //
  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `Sheet1!${fromRow}:${toRow}`,
  })
    let  body = []
  const data =getSheetData.data.values
    for(let i=0; i<data.length; i++){
        body.push({
            "nama":data[i][0],
            "kelas":data[i][1],
            "keterangan":data[i][2],
            "izin":data[i][3],
            "tiba":data[i][4],
            "status":data[i][5],
            "Charset":"A"+(i+2)
        })
    }
      res.send(body)
});

//posts data to cell``
app.post('/:id/post', async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);
    const spreadsheetId = req.param("id")
  await googleSheet.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: 'Sheet1!A2:F',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [req.body],
    },
  });
  res.send(req.body);
});

// deletes cell data
app.post('/delete/:id/:fromRow/:toRow', async (req, res) => {
  const auth = getAuth();
    const spreadsheetId = req.param('id')
  const googleSheet = await getGoogleSheet(auth);
    const fromRow = req.param('fromRow')
    const toRow = req.param('toRow')

  await googleSheet.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: `Sheet1!${fromRow}:${toRow}`,
  });

  res.send('Deleted Successfully');
});

app.post('/delete/:id/all', async(req, res)=>{
    const auth = getAuth()
    const spreadsheetId = req.parama('id')
    const googleSheet = await getGoogleSheet(auth)
    await googleSheet.spreadsheets.values.clear({
        auth,
        spreadsheetId,
        range:"Sheet1!A2:F"
    })
    res.send("Clear")
})

// update cell data
app.put('/update/:id/:fromRow/:toRow', async (req, res) => {
  const auth = getAuth();
    const spreadsheetId = req.param('id')
    const fromRow = req.param('fromRow')
    const toRow = req.param('toRow')
  const googleSheet = await getGoogleSheet(auth);

  await googleSheet.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `Sheet1!${fromRow}:${toRow}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [],
    },
  });

  res.send('Updated Successfully');
});

app.listen(3000 || process.env.PORT, () => {
  console.log('Up and running!!');
});
