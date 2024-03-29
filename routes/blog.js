const express = require("express");

// import mongodb
const mongodb = require("mongodb");

// import db handler file
const db = require("../data/database");

// call objectId from mongoDb
const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

// handle displaying posts list
router.get("/posts", async function (req, res) {
  // use projection on find - author.name is nested, so in quotes
  const posts = await db
    .getDb()
    .collection("posts")
    .find(
      {},
      { title: 1, summary: 1, "author.name": 1 }
    )
    .toArray();
  res.render("posts-list", { posts: posts });
});

router.get(
  "/new-post",
  async function (req, res) {
    // get db with collection method - returns a promise
    const authors = await db
      .getDb()
      .collection("authors")
      .find()
      .toArray();
    // pass authors as a key
    res.render("create-post", {
      authors: authors,
    });
  }
);

// add route to incoming blog posts
router.post("/posts", async function (req, res) {
  /// fetch author name
  // create authorId via ObjectId
  const authorId = new ObjectId(req.body.author);
  // find relevant author via authorId
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  // post a new post
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  // insert data to db
  const result = await db
    .getDb()
    .collection("posts")
    .insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});

// handle route for post detail
router.get(
  "/posts/:id",
  async function (req, res) {
    const postId = req.params.id;
    // query - use projection
    const post = await db
      .getDb()
      .collection("posts")
      .findOne(
        { _id: new ObjectId(postId) },
        { summary: 0 }
      );
  //handle invalid address
  if (!post) {
    return res.status(404).render("404");
  }
  // convert time to human readable object
  post.humanReadable = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  // convert date to ISO
  post.date = post.date.toISOString();

  res.render("post-detail", { post: post });
});

// get route for updating post
router.get("/posts/:id/edit", async function(req,res) {
  // get post id
  const postId = req.params.id;
  // query - use projection
  const post = await db
    .getDb()
    .collection("posts")
    .findOne(
      { _id: new ObjectId(postId) },
      { title: 1, summary: 1, body: 1 }
    );
      //handle invalid address
  if (!post) {
    return res.status(404).render("404");
  }
  // render post update template
  res.render("update-post", { post: post });
});

// post route for updating post
router.post("/posts/:id/edit", async function(req, res) {
  // get post id
  const postId = new ObjectId (req.params.id);
  // access db with update - filter with postId
  const result = await db.getDb().
  collection("posts").
  updateOne(
    {_id: postId}, 
    {
      $set: { 
      title: req.body.title,
      summary: req.body.summary,
      body: req.body.content
      }
    }
  );
  res.redirect("/posts");
});

// handle delete post route
router.post("/posts/:id/delete", async function(req,res){
  // get post id
  const postId = new ObjectId (req.params.id);
  // access db with delete - filter with postId
  const result = await db.getDb().collection("posts").deleteOne({_id: postId});
  res.redirect("/posts");
});

module.exports = router;
