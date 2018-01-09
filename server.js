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
  app.get("/scrape", function(req, res) {
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
              res.send("Scrape Complete");
            })
            .catch(function(err) {
              // If an error occurred, send it to the client
              res.json(err);
          });
        }
      });
    })



      // // Find each div with the "content" class
      // $("div.content").each(function(i, element) {
      //   // Save an empty result object
      //   var result = {};

      //   // Add the text and href of every link, and save them as properties of the result object
      //   result.title = $(this)
      //     .children("a")
      //     .text();
      //   result.link = $(this)
      //     .children("a")
      //     .attr("href");
      //   result.subtitle = $(this)
      //     .children("a")
      //     .text();

      //   // Create a new Article using the `result` object built from scraping
      //   db.Article
      //     .create(result)
      //     .then(function(dbArticle) {
      //       // If we were able to successfully scrape and save an Article, send a message to the client
      //       res.send("Scrape Complete");
      //     })
      //     .catch(function(err) {
      //       // If an error occurred, send it to the client
      //       res.json(err);
      //     });
      // });
  });

  // // Route for getting all Articles from the db
  // app.get("/articles", function(req, res) {
  //   // Grab every document in the Articles collection
  //   db.Article
  //     .find({})
  //     .then(function(dbArticle) {
  //       // If we were able to successfully find Articles, send them back to the client
  //       res.json(dbArticle);
  //     })
  //     .catch(function(err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // });

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


