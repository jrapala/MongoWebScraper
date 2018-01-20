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
      var newArticles = false;

      // Find article (divs with class "content")
      $(".content").each(function(i, element) {
        
        // Check to see if div is not empty
        var contentDivLength = $(this).children("h1").length;

        // If div is not empty, scrape.
        if (contentDivLength > 0) {

          // Save an empty result object
          var result = {};

          // Find article title
          result.title = $(this).children("h1").children("a").text();

          // Find link to article
          result.link = $(this).children("h1").children("a").attr("href");

          // Find article subtitle
          result.subtitle = $(this).children("div.excerpt").children("a").children("p").text();
        
          // Check if article has already been scraped
          db.Article
            .find({'title': result.title })
            .then(function(dbArticle) {
              // Add article if it does not already exist.
              if (dbArticle.length === 0) {
                newArticles = true;
                count++;
                db.Article
                  // Create a new Article using the `result` object built from scraping
                  .create(result) 
                  .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client
                      res.send(`Scrape Complete. ${count} articles added.`);
                  })
              }
            })
            .then(function() {
              if (newArticles === false) {
                res.send("No new articles. Check back again later!");
              }
            })


          //   .catch(function(err) {
          //     // If an error occurred, send it to the client
          //     res.send("An error has occurred.");
          //     res.json(err);
          // });
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
  app.get("/", function(req, res) {
    //var status = req.params.status;
    db.Article
      .find({'saved': false })
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        //res.json(dbArticle);
        // console.log(dbArticle);
        res.render("index", { article: dbArticle });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // A GET route for getting all articles from the database by status
  app.get("/saved", function(req, res) {
    //var status = req.params.status;
    db.Article
      .find({'saved': true })
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        //res.json(dbArticle);
        // console.log(dbArticle);
        res.render("saved", { article: dbArticle });
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
    console.log(req.body);

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
        //res.redirect("/");
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
  app.post("/api/articles/:id", function(req, res) {
    var articleId = req.params.id;
    // Create new Note
    db.Note
      .create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: articleId }, { note: dbNote._id }, { new: true });
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

  // A DELETE route for deleting article notes
  app.delete("/api/notes/:noteid", function(req, res) {
    db.Note
      .findById({
          "_id" : req.params.noteid
      })
      .then(function(dbNote) {
        dbNote.remove(); 
      })
      .then(function(dbArticle) {
        // If article is succesfully deleted, send response of "true"
        res.json(true);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

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
        // If article is succesfully deleted, send response of "true"
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




