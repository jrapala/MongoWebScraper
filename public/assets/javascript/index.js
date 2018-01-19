$(document).ready(function() {
  
  // Container where articles go
  var articleContainer = $(".article-container");
  // Event listener for saving an article
  $(document).on("click", ".btn.save", handleArticleSave);
  // Event listener for scraping new articles
  $(document).on("click", ".scrape-new", handleArticleScrape);

  // MAKE THIS WORK WITH HANDLEBARS

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
    console.log(articleToSave);
    $.ajax({
      method: "PUT",
      url: "/api/update",
      data: articleToSave
    }).then(function(data) {
      if (data.ok) {
        // Reload page
        location.reload()
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
      bootbox.alert("<h3 class='text-center m-top-80'>" + res + "<h3>");
    })
    // Reload page
    .then(function() {
      $.ajax({
        method: "GET",
        url: "/"
      })
    });
  }

});
