# Consequence of Sound Web Scraper

A web application that scrapes news articles from [Consequence of Sound](https://consequenceofsound.net/), allows you to save articles, and lets you add or delete a note to a saved article.

## Description

The Consequence of Sound (CoS) Web Scraper is a full stack web application that is powered by Node and Express. The application scrapes news articles using the [Cheerio](https://github.com/cheeriojs/cheerio) scraping module, saves them to a MongoDB database, and displays scraped articles using [Handlebars](https://handlebarsjs.com/) as a templating engine. You can also save or delete articles and add or delete notes to saved articles.

## Getting Started

### Live Example

[https://cos-mongo-scraper.herokuapp.com](https://cos-mongo-scraper.herokuapp.com)

> Since the app is hosted on a free [Heroku](https://www.heroku.com/) instance, it may need some time to boot up.

### Installing

After downloading the distribution, you will need to download the app dependencies:

```
$ cd MongoWebScraper
$ npm install
```

Once installed, run Mongo in a seperate terminal, start the server and navigate to localhost:3000

```
$ mongod
```
```
$ node server.js
```

## Using CoS Web Scraper

1. To start using the CoS Scraper, navigate to [http://localhost:3000/](http://localhost:3000/)

	![Home Page](./img/cosScraper01.png)
	
2. If this is your first time using the app, you will not have any articles in your database. Click ```Scrape New Articles!``` to scrape the latest news articles.

	![Scrape New Articles](./img/cosScraper02.png)
	
3. If you see an article that you would like to save, click ```Save Article```

	![Save Article](./img/cosScraper03.gif)
	
4. To view saved articles, head to the Saved Articles Page via the Navigation Bar.
 
	![Saved Articles](./img/cosScraper04.png)

5. On the Saved Articles page, you can add notes to saved articles and save them.

	![Save Note](./img/cosScraper05.gif)
	
6. Notes can be deleted by clicking the ```X``` next to a note. 

	![Delete Note](./img/cosScraper06.png)
	
7. Articles can be removed from the Saved Page with ```Remove from Saved``` and placed back on the Home Page. Articles can also be completely deleted from the application with ```Delete Article```.

	![Saved Article Options](./img/cosScraper07.png)
	
8. Whenever you wish to scrape the newest articles posted on CoS, just click ```Scrape New Articles!``` on the Home Page.

## Deployment
You can easily deploy this application to a platform such as Heroku. You will need to have MongoDB installed via an add-on such as mLab.

## Built With

* [Handlebars](https://handlebarsjs.com/) - JavaScript templating engine
* [Cheerio](https://github.com/cheeriojs/cheerio) - JavaScript web scraping module
* [Node.js](https://nodejs.org/) - JavaScript run-time environment
* [Express](https://expressjs.com/) - Node.js web application framework
* [MongoDB](https://www.mongodb.com/) - NoSQL database program
* [Mongoose](http://mongoosejs.com/) - MongoDB object modeling tool 
* 

## Author

* **Juliette Rapala**
	* [GitHub](https://github.com/jrapala)
	* [LinkedIn](https://www.linkedin.com/in/julietterapala/)


