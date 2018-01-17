$(document).ready(function() {

  // Container where articles go
  var articleContainer = $(".article-container");
  // Event listener for unsaving an article
  $(document).on("click", ".btn.unsave", handleArticleSave);
  // Event listener for deleting an article
  $(document).on("click", ".btn.delete", handleArticleDelete);
  // Event listener for displaying article notes
  $(document).on("click", ".btn.notes", handleArticleNotes);
  // Event listener for saving a new article note
  $(document).on("click", ".btn.save", handleNoteSave);
  // Event listener for deleting an article note
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  initPage();

  function initPage() {
    // Empty the article container, run an AJAX request for any saved headlines
    articleContainer.empty();
    $.get("/api/articles/saved/true").then(function(data) {
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
    articleContainer.append(articleArray);
  }

  function createPanel(article) {
    // Create a panel for each saved article/headline
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

  // Create an array of notes for notes modal
  function renderNotesList(data) {
    var notesObject = data.notes;
    console.log(notesObject);

    var notesArray = [];
    var currentNote;
    if (notesObject.length <= 0) {
      // If we have no notes, just display a message explaing this
      currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
      notesArray.push(currentNote);
    }
    else {
      // If we do have notes, go through each one
      // for (var i = 0; i < data.notes.note.length; i++) {
        // Constructs an li element to contain our noteText and a delete button
        currentNote = $(
          [
            "<li class='list-group-item note'>",
            notesObject.noteText,
            //"<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // Store the note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", notesObject._id);
        // Adding our currentNote to the notesToRender array
        notesArray.push(currentNote);
      // }
    }
    // Now append the notesToRender to the note-container inside the note modal
    $(".note-container").append(notesArray);
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

  // Delete an article from the database
  function handleArticleDelete() {
    // Take the article ID from the delete button
    var articleToDelete = $(this).parents(".panel").data();
    // Send a delete request
    $.ajax({
      method: "DELETE",
      url: "/api/articles/" + articleToDelete._id + "/remove"
    }).then(function(data) {
      // If article successfully deleted, reload page
      if (data === true) {
        initPage();
      }
    });
  }

  // Open notes modal and display notes using the ID of the article
  function handleArticleNotes() {
    // Grab data, which contains article id, from parent div
    var currentArticle = $(this).parents(".panel").data();
    // Search database for ID, get back article object
    $.get("/api/articles/" + currentArticle._id).then(function(data) {
      // Constructing our initial HTML to add to the notes modal
      var modalText = [
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        data.title,
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
      // Create object with article ID and note object if it exists
      var noteData = {
        _id: currentArticle._id,
        notes: data.note || []
      };
      // console.log("==============");
      // console.log(noteData);
      // console.log("==============");      
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
