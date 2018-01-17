$(document).ready(function() {
  
  // Container where articles go
  var articleContainer = $(".article-container");
  // Event listener for saving an article
  $(document).on("click", ".btn.save", handleArticleSave);
  // Event listener for scraping new articles
  $(document).on("click", ".scrape-new", handleArticleScrape);

  initPage();

  function initPage() {
    // Empty the article container, run an AJAX request for any unsaved articles
    articleContainer.empty();
    $.get("/api/articles/saved/false").then(function(data) {
      // If we have articles, render them to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // Otherwise render a message explaing we have no articles
        renderEmpty();
      }
    });
  }

  // Create a div for each article and add them to the article container
  function renderArticles(articles) {
    var articleArray = [];
    for (var i = 0; i < articles.length; i++) {
      articleArray.push(createPanel(articles[i]));
    }
    // Newest articles on top
    articleContainer.prepend(articleArray);
  }

  function createPanel(article) {
    // Create a panel for each article/headline
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.link + "'>",
        article.title,
        "</a>",
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.subtitle,
        "</div>",
        "</div>"
      ].join("")
    );
    // Add the article ID as an attribute.
    panel.data("_id", article._id);
    // Return the panel HTML so it can enter the articles array
    return panel;
  }

  // HTML message if there are no articles to view. 
  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // Appending this data to the page
    articleContainer.append(emptyAlert);
  }

  // When user wants to save an article, update the save state of the article by using the ID data attribute
  function handleArticleSave() {
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/api/update",
      data: articleToSave
    }).then(function(data) {
      if (data.ok) {
        // Reload page
        initPage();
      }
    });
  }

  // Scrape for new articles
  function handleArticleScrape() {
    $.ajax({
      method: "GET",
      url: "/api/scrape"
    })
    .then(function(res) {
      // Rerender articles and display modal displaying how many articles were scraped.
      initPage();
      bootbox.alert("<h3 class='text-center m-top-80'>" + res + "<h3>");
    });
  }
});
