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
  var databaseUri = "mongodb://localhost/CoSWebScraper";

  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    mongoose.connect(databaseUri, {
    useMongoClient: true
  })};

  // Routes  
  // =====================================================================================

  // A GET route for scraping the COS website
  app.get("/api/scrape", function(req, res) {
    // Grab the body of the HTML using axios 
    axios.get("https://consequenceofsound.net/category/news/").then(function(response) {
      // Load response into cheerio
      var $ = cheerio.load(response.data);
      var count = 0;

      // Find article (divs with class "content")
      $(".content").each(function(i, element) {
        
        // Check to see if div is not empty
        var element = $(this).children("h1").length;

        // If div is not empty, scrape.
        if (element > 0) {

          count++;

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
                res.send(`Scrape Complete. ${count} articles added.`);
              }
            })
            .catch(function(err) {
              // If an error occurred, send it to the client
              res.send("An error has occurred.");
              res.json(err);
          });
        // If no new articles, send different message back to the client.
        } else {
          res.send("No new articles. Check back again later!");
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

  // A GET route for getting article notes
  app.get("/api/articles/:id", function(req, res) {
    var id = req.params.id;
    // Grab every document in the Articles collection
    db.Article
      .findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // console.log(dbArticle);
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // A POST route for saving article notes
  app.post("/api/articles", function(req, res) {
    console.log(req.body);
    // Grab every document in the Articles collection
    db.Note
      .create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: dbNote._id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbNote) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbNote);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // // A DELETE route for deleting article notes
  // app.delete("/api/articles/:id", function(req, res) {
  //   console.log(req.body);
  //   db.Note
  //     .create(req.body)
  //     .then(function(dbNote) {
  //       return db.Article.findOneAndUpdate({ _id: dbNote._id }, { note: dbNote._id }, { new: true });
  //     })
  //     .then(function(dbNote) {
  //       // If we were able to successfully find Articles, send them back to the client
  //       res.json(dbNote);
  //     })
  //     .catch(function(err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // });

  // A DELETE route for deleting articles
  app.delete("/api/articles/:id/remove", function(req, res, next) {
    // Find article using parameter
    db.Article
      .findById({
          "_id" : req.params.id
      })
      .then(function(dbArticle) {
        dbArticle.remove();
      })
      .then(function(dbArticle) {
        // If article is succesfully deleted, send response
        res.json(true);
      })
      .catch(function(err) {
        res.json(err);
      });
});

  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });




