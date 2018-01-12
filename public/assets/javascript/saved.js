$(document).ready(function() {
  // Getting a reference to the article container div we will be rendering all articles inside of
  var articleContainer = $(".article-container");
  // Adding event listeners for dynamically generated buttons for deleting articles,
  // pulling up article notes, saving article notes, and deleting article notes
  $(document).on("click", ".btn.unsave", handleArticleSave);
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  // initPage kicks everything off when the page is loaded
  initPage();

  function initPage() {
    // Empty the article container, run an AJAX request for any saved headlines
    articleContainer.empty();
    $.get("/api/articles/saved/true").then(function(data) {
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // Otherwise render a message explaing we have no articles
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // This function handles appending HTML containing our article data to the page
    // We are passed an array of JSON containing all available articles in our database
    var articlePanels = [];
    // We pass each article JSON object to the createPanel function which returns a bootstrap
    // panel with our article data inside
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    // Once we have all of the HTML for the articles stored in our articlePanels array,
    // append them to the articlePanels container
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    // This functiont takes in a single JSON object for an article/headline
    // It constructs a jQuery element containing all of the formatted HTML for the
    // article panel
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading panel-heading-saved'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.title,
        "</a>",
        "<a class='btn btn-default unsave'>",
        "Remove from Saved",
        "</a>",
        "<a class='btn btn-info notes'>Article Notes</a>",
        "<a class='btn btn-danger delete'>",
        "Delete Article",
        "</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.subtitle,
        "</div>",
        "</div>"
      ].join("")
    );
    // We attach the article's id to the jQuery element
    // We will use this when trying to figure out which article the user wants to remove or open notes for
    panel.data("_id", article._id);
    panel.data("title", article.title);
    // We return the constructed panel jQuery element
    return panel;
  }

  function renderEmpty() {
    // This function renders some HTML to the page explaining we don't have any articles to view
    // Using a joined array of HTML string data because it's easier to read/change than a concatenated string
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // Appending this data to the page
    articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {
    // This function handles rendering note list items to our notes modal
    // Setting up an array of notes to render after finished
    // Also setting up a currentNote variable to temporarily store each note
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      // If we have no notes, just display a message explaing this
      currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
      notesToRender.push(currentNote);
    }
    else {
      // If we do have notes, go through each one
      for (var i = 0; i < data.notes.length; i++) {
        // Constructs an li element to contain our noteText and a delete button
        currentNote = $(
          [
            "<li class='list-group-item note'>",
            data.notes[i].noteText,
            "<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // Store the note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // Adding our currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    // Now append the notesToRender to the note-container inside the note modal
    $(".note-container").append(notesToRender);
  }

  function handleArticleSave() {
    // This function is triggered when the user wants to save an article
    // When we rendered the article initially, we attatched a javascript object containing the headline id
    // to the element using the .data method. Here we retrieve that.
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = false;
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

  function handleArticleDelete() {
    // This function handles deleting articles/headlines
    // We grab the id of the article to delete from the panel element the delete button sits inside
    var articleToDelete = $(this).parents(".panel").data();
    // Using a delete method here just to be semantic since we are deleting an article/headline
    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {
      // If this works out, run initPage again which will rerender our list of saved articles
      if (data.ok) {
        initPage();
      }
    });
  }

  function handleArticleNotes() {
    // This function handles opending the notes modal and displaying our notes
    // We grab the id of the article to get notes for from the panel element the delete button sits inside
    var currentArticle = $(this).parents(".panel").data();
    // Grab any notes with this headline/article id
    $.get("/api/articles/" + currentArticle._id).then(function(data) {
      // Constructing our initial HTML to add to the notes modal
      var modalText = [
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        currentArticle.title,
        "</h4>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
        "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("");
      // Adding the formatted HTML to the note modal
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      // Adding some information about the article and article notes to the save button for easy access
      // When trying to add a new note
      $(".btn.save").data("article", noteData);
      // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    var noteData;
    // Data from form
    var newNote = $(".bootbox-body textarea").val().trim();
    // If data was inputted, create a note data object and post it to the API
    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/articles", noteData).then(function() {
        // Close the modal
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    // This function handles the deletion of notes
    // First we grab the id of the note we want to delete
    // We stored this data on the delete button when we created it
    var noteToDelete = $(this).data("_id");
    // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
    $.ajax({
      url: "/api/articles/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      // When done, hide the modal
      bootbox.hideAll();
    });
  }
});
