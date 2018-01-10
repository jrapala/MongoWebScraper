// Mongo Web Scraper | By Juliette Rapala
// =====================================================================================

  // Setup  
  // =====================================================================================

  // Dependencies
  var express = require("express");
  var bodyParser = require("body-parser");
  var exphbs = require('express-handlebars');
  var logger = require("morgan");
  var mongoose = require("mongoose");

  // Scraping tools
  var axios = require("axios");
  var cheerio = require("cheerio");

  // Require all models
  var db = require("./models");

  // Initialize Express
  var app = express();

  // Port Config
  var PORT = process.env.PORT || 3000;

  // Middleware Config
  // Use morgan logger for logging requests
  app.use(logger("dev"));
  // Use body-parser for handling form submissions
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // Use express.static to serve the public folder as a static directory
  app.use(express.static(process.cwd() + "/public"));

  // Handlebars Config
  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
  app.set("view engine", "handlebars");

  // Route Config
  // var routes = require("./controllers/burgers_controller.js");
  // app.use("/", routes);
  // app.listen(PORT);

  // Set mongoose to leverage built in JavaScript ES6 Promises
  // Connect to the Mongo DB
  mongoose.Promise = Promise;
  mongoose.connect("mongodb://localhost/CoSWebScraper", {
    useMongoClient: true
  });

  // Routes  
  // =====================================================================================

  // A GET route for scraping the COS website
  app.get("/api/scrape", function(req, res) {
    // Grab the body of the HTML using axios 
    axios.get("https://consequenceofsound.net/category/news/").then(function(response) {
      // Load response into cheerio
      var $ = cheerio.load(response.data);

      // Find article (divs with class "content")
      $(".content").each(function(i, element) {
        
        // Check to see if div is not empty
        var element = $(this).children("h1").length;

        // If div is not empty, scrape.
        if (element > 0) {

          // Save an empty result object
          var result = {};

          // Find article title
          result.title = $(this).children("h1").children("a").text();

          // Find link to article
          result.link = $(this).children("h1").children("a").attr("href");

          // Find article subtitle
          result.subtitle = $(this).children("div.excerpt").children("a").children("p").text();
        
          // Create a new Article using the `result` object built from scraping
          db.Article
            .create(result)
            .then(function(dbArticle) {
              // If we were able to successfully scrape and save an Article, send a message to the client
              if (dbArticle) {
              } else {
                "No new articles today. Check back tomorrow!"
              }


            })
            .catch(function(err) {
              // If an error occurred, send it to the client
              res.json(err);
          });
        }
      });
    })
  });

  // A GET route for getting all articles from the database
  app.get("/api/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article
      .find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // A GET route for getting all articles from the database by status
  app.get("/api/articles/saved/:status", function(req, res) {
    var status = req.params.status;
    db.Article
      .find({'saved': status })
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // A PUT route for saving/unsaving an article
  app.put("/api/update", function(req, res) {
    var articleId = req.body._id;
    var articleSaveStatus = req.body.saved;

    // Update the article that matches the article id
    db.Article
      .update({
          "_id" : articleId
      }, {
        $set: {
          "saved": articleSaveStatus
        }
      })
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });



  function handleArticleSave() {
    // This function is triggered when the user wants to save an article
    // When we rendered the article initially, we attatched a javascript object containing the headline id
    // to the element using the .data method. Here we retrieve that.
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    // Using a patch method to be semantic since this is an update to an existing record in our collection
    $.ajax({
      method: "PUT",
      url: "/api/articles",
      data: articleToSave
    }).then(function(data) {
      // If successful, mongoose will send back an object containing a key of "ok" with the value of 1
      // (which casts to 'true')
      if (data.ok) {
        // Run the initPage function again. This will reload the entire list of articles
        initPage();
      }
    });
  }  

  // // Route for grabbing a specific Article by id, populate it with it's note
  // app.get("/articles/:id", function(req, res) {
  //   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  //   db.Article
  //     .findOne({ _id: req.params.id })
  //     // ..and populate all of the notes associated with it
  //     .populate("note")
  //     .then(function(dbArticle) {
  //       // If we were able to successfully find an Article with the given id, send it back to the client
  //       res.json(dbArticle);
  //     })
  //     .catch(function(err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // });

  // // Route for saving/updating an Article's associated Note
  // app.post("/articles/:id", function(req, res) {
  //   // Create a new note and pass the req.body to the entry
  //   db.Note
  //     .create(req.body)
  //     .then(function(dbNote) {
  //       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
  //       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
  //       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
  //       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
  //     })
  //     .then(function(dbArticle) {
  //       // If we were able to successfully update an Article, send it back to the client
  //       res.json(dbArticle);
  //     })
  //     .catch(function(err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // });

  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });


