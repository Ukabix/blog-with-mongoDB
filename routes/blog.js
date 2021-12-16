const express = require('express');

// import db handler file
const db = require("../data/database");

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', function(req, res) {
  res.render('posts-list');
});

router.get('/new-post', async function(req, res) {
  // get db with collection method - returns a promise
  const authors = await db.getDb().collection("authors").find().toArray();
  // pass authors as a key
  res.render('create-post', { authors: authors });
});

module.exports = router;