$(document).ready(function() {
  
  // Container where articles go
  var articleContainer = $(".article-container");
  // Event listener for saving an article
  $(document).on("click", ".btn.save", handleArticleSave);
  // Event listener for scraping new articles
  $(document).on("click", ".scrape-new", handleArticleScrape);
  // Event listener for unsaving an article
  $(document).on("click", ".btn.unsave", handleArticleUnsave);
  // Event listener for deleting an article
  $(document).on("click", ".btn.delete", handleArticleDelete);
  // Event listener for displaying article notes
  $(document).on("click", ".btn.notes", handleArticleNotes);
  // Event listener for saving a new article note
  $(document).on("click", ".btn.note-save", handleNoteSave);
  // Event listener for deleting an article note
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  // When user wants to save/unsave an article, update the save state of the article by using the ID data attribute
  function handleArticleSave() {
    var articleToSave = $(this).parents(".panel").data();
    // Change save state to inverse
    articleToSave.saved = !articleToSave.saved;
    $.ajax({
      method: "PUT",
      url: "/api/update",
      data: articleToSave
    }).then(function(data) {
      console.log(data);
      if (data.ok) {
        // Reload page
        bootbox.alert("<h3 class='text-center m-top-80 scrape-message'>" + "Article saved!" + "<h3>", function(){location.reload();});
      }
    });
  }

  // When user wants to save/unsave an article, update the save state of the article by using the ID data attribute
  function handleArticleUnsave() {
    var articleToSave = $(this).parents(".panel").data();
    // Change save state to inverse
    articleToSave.saved = !articleToSave.saved;
    $.ajax({
      method: "PUT",
      url: "/api/update",
      data: articleToSave
    }).then(function(data) {
      console.log(data);
      if (data.ok) {
        // Reload page
        bootbox.alert("<h3 class='text-center m-top-80 scrape-message'>" + "Article unsaved!" + "<h3>", function(){location.reload();});
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



  // Create an array of notes for notes modal
  function renderNotesList(data) {
    var notesObject = data.notes;
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
        bootbox.alert("<h3 class='text-center m-top-80 scrape-message'>" + "Article deleted!" + "<h3>", function(){location.reload();});
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
        "<button class='btn btn-success note-save'>Save Note</button>",
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
      $(".btn.note-save").data("article", noteData);
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
        bootbox.alert("<h3 class='text-center m-top-80 scrape-message'>" + "Note saved!" + "<h3>", function(){bootbox.hideAll();});
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
