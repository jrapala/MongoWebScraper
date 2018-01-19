$(document).ready(function() {
  
  // Container where articles go
  var articleContainer = $(".article-container");
  // Event listener for saving an article
  $(document).on("click", ".btn.save", handleArticleSave);
  // Event listener for scraping new articles
  $(document).on("click", ".scrape-new", handleArticleScrape);

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
      // Rerender articles and display modal displaying how many articles were scraped, then reload page.
      bootbox.alert("<h3 class='text-center m-top-80 scrape-message'>" + res + "<h3>", function(){location.reload();});
    })
  };

});
