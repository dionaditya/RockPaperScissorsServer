require('dotenv').config({path: 'variables.env'})
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const leaderboard = require('./leaderboard.json');
const compare = require('./compare');
const logger = require('morgan')
const faunadb = require('faunadb')

const app = express();

const q = faunadb.query

var client = new faunadb.Client({ secret: process.env.FAUNADB_KEY })

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.set('port', process.env.PORT || 7777);

app.get('/leaderboard', async (req, res) => {
  const leaderboard = await client.query(
      q.Paginate(
           q.Match(q.Index("leaderboards"))
      )
  )
  return res.json(leaderboard)
  console.log(leaderboard)
});


app.post('/start', async (req, res) => {
  try {
    const { id } = req.query;
    const {name} = req.body
    console.log(id, name)

    const checkDocuments = await client.query(
        q.Paginate(
            q.Match(q.Index("uuid_search"), id)
          )
      )
    console.log(checkDocuments.data)
    if(checkDocuments.data.length <= 0) {
       const checkDocuments = await client.query(
        q.Create(
            q.Collection("players"),
            {data: {
              name: name,
              uid: id,
              score: 0
            }}
          )
      )
      return res.json({
            success: true,
            status: 200
          }) 
    } else {
       return res.json({
            success: false,
            status: 400
          })
    }
   
  } catch(error) {
    console.log(error)
  }
});

app.get('/play', async (req, res) => {
  try {
    const { userPick, id} = req.query;
    const arr = ['rock', 'paper', 'scissors'];
    const computerPick = arr[Math.floor(Math.random() * 3)];
  
    const points = compare(userPick, computerPick);
    const getDoc = await client.query(
       q.Get(
          q.Match(q.Index("uuid_search"), id)
        )
    )
    const currentUserInfo = {
      score: getDoc.data.score,
      id: getDoc.ref.id
    }

    const updateUserInfo = await client.query(
        q.Update(
            q.Ref(q.Collection('players'), currentUserInfo.id),
            {data: {
              score: currentUserInfo.score + points,
            }}
          )
      )
    return res.json({
      points: points,
      computerPick: computerPick
    })
  } catch(error) {
    console.log(error)
  }
 
});

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});