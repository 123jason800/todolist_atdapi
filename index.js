// Get the variables
var createNoteBtn = $('#create-note');
var cardSpace = $('#card-space');
var cardInput = $('.card-item-input');
var apiKey = '242';
var categoryBtn = $('.note-category')
var cards = [];
// Adds Event handler to each card(note) when user focus out of input. It will then update to server
var onUpdateInput = function(card,note) {
  card.find('.card-item-input').on('focusout',function() {
    if(note['content'] !== $(this).val() && $(this).val() !== '') {
      updateData(note['id'],$(this).val(),card);
      $(this).unbind();
    }
    else if ($(this).val() === '') {
      deleteData(note['id'],card);
    }    
  });
}

// Filter cards from screen base on category active
var filterCards = function() {
  var tempCards = cards;
  var id = $('.category-active').data('id');
  if (id === 2 ) {
    tempCards = cards.filter(function(element){ return !$(element).find('.complete-checkbox').is(':checked');});
  }

  else if (id === 3) {
    tempCards = cards.filter(function(element){ return $(element).find('.complete-checkbox').is(':checked');});
  }

  $('.card').remove();
  tempCards.forEach(function(item){
    cardSpace.append($(item));
  })
}
// creates a new card an return the style of our card/note.
var createNoteTemplate = function() {
    var newCard = $(` <div class="card uk-width-1-4 uk-margin-bottom">
                        <div class="card-item uk-height-1-1 uk-position-relative uk-card task-card">
                            <div class="uk-card-body uk-position-relative uk-padding-small">
                                <textarea rows="6" class="card-item-input"></textarea>
                            </div>
                        </div>
                    </div>`);
    return newCard;
   }
  



  // Adds Card to server and triggers focus on the current added card. 
  var createNoteToServer = function(card){
    cardSpace.append(card);
    var cardInput = card.find('.card-item-input');
    cardInput.trigger('focus');
    cardInput.on('focusout',function() {
      if ($(this).val() !== '') {
        postData(card,$(this).val());
        $(this).unbind();
      }
      else {
        card.remove();
      }
    });
  }

  // Adds all the actual info to card
var addInfoToCard = function(card,text,completed,id) {
  
  var bottomOfCard = $(`<div class="card-complete uk-text-center">
                            <label for="complete">Completed?</label>
                            <input data-id=${id} class="complete-checkbox" name="complete" type="checkbox" ${completed?'checked':''}>
                        </div>
                          <button data-id=${id} class="delete-button"><i class="fas fa-lg fa-trash"></i></button>
                        `);
  card.find('.card-item').append(bottomOfCard);
  card.find('.card-item-input').text(text);
 
}
  
var getNotes = function() {
  $.ajax({
    type: 'GET',
    url: `https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=${apiKey}`,
    dataType: 'json',
    success: function (response, textStatus) {
      cards = response['tasks'].map(function(note){
        var card = createNoteTemplate();
        addInfoToCard(card,note['content'],note['completed'],note['id']);
        if(note['completed']) {
          card.find('.card-item').toggleClass('bg-completed');
        }
        cardSpace.append(card);
        onUpdateInput(card,note);
        return card;
      });
    },
    error: function (request, textStatus, errorMessage) {
      console.log(errorMessage);
    }
  });
}

var postData = function(card,text) {
  card.find('.card-item').toggleClass('bg-updating');
  $.ajax({
    type: 'POST',
    url:`https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=${apiKey}`,
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      task: {
        content: text
      }
    }),
    success: function (response, textStatus) {
      var note = response['task'];
      addInfoToCard(card,note['content'],note['completed'],note['id']);
      cards.push(card);
      onUpdateInput(card,note);
      card.find('.card-item').toggleClass('bg-updating');
      filterCards();
    },
    error: function (request, textStatus, errorMessage) {
      console.log(errorMessage);
    }
  });
}

var getData = function() {
  $.ajax({
    type: 'GET',
    url: `https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=${apiKey}`,
    dataType: 'json',
    success: function (response, textStatus) {
      console.log(response);
    },
    error: function (request, textStatus, errorMessage) {
      console.log(errorMessage);
    }
  });
}

var deleteData = function(id,card) {
  $.ajax({
    type: 'DELETE',
    url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=${apiKey}`,
    success: function (response, textStatus) {
      cards = cards.filter(function(element){return !card.is($(element))});
      card.remove();
      filterCards();
    },
    error: function (request, textStatus, errorMessage) {
      console.log(errorMessage);
    }
  });
}

var updateData = function(id,text,card) {
  card.find('.card-item').toggleClass('bg-updating');
  $.ajax({
    type: 'PUT',
    url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=${apiKey}`,
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      task: {
        content: text
      }
    }),
    success: function (response, textStatus) {
      var note = response['task'];
      onUpdateInput(card,note);
      card.find('.card-item').toggleClass('bg-updating');
    },
    error: function (request, textStatus, errorMessage) {
      console.log(errorMessage);
      card.find('.card-item').toggleClass('bg-updating');
    }
  });
}

var updateCheckBox = function(id,checked,card) {
  card.find('.card-item').toggleClass('bg-updating');
  if (checked) {
    $.ajax({
      type: 'PUT',
      url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_complete?api_key=${apiKey}`,
      success: function (response, textStatus) {
        card.find('.card-item').toggleClass('bg-updating');
        card.find('.card-item').toggleClass('bg-completed');
        filterCards();
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
    
  }
  else {
    $.ajax({
      type: 'PUT',
      url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_active?api_key=${apiKey}`,
      success: function (response, textStatus) {
        card.find('.card-item').toggleClass('bg-updating');
        card.find('.card-item').toggleClass('bg-completed');
        filterCards();
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
    
  }
  
}

  // Change Backgrounds
var editBgEvent = function(){
  $(this).parentsUntil('.card').toggleClass('bg-editing');
}




// Event Listeners 
  // Create Note Template and then add it to the server.
createNoteBtn.on('click',function()
{
  var card = createNoteTemplate();
  createNoteToServer(card);
});

  // On Existing and non existing.Change Background Color when on focused on input. 
cardSpace.on('focusin','.card-item-input',function(){
  editBgEvent.call(this);
});
cardSpace.on('focusout','.card-item-input',function(){
  editBgEvent.call(this);

});

  // Delete Button,both existing and non existing
cardSpace.on('click','.delete-button',function(){
  var id = $(this).attr('data-id');
  var card = $(this).closest('.card');
  deleteData(id,card);
});
  // Check input, both existing and non existing
cardSpace.on('change','.complete-checkbox',function(){
  var id = $(this).attr('data-id');
  var checked = $(this).is(':checked');
  var card = $(this).closest('.card');
  updateCheckBox(id,checked,card);
});

// Users clicks on category. Should filter notes and set that button as active
categoryBtn.on('click', function(){
  // Adds active class to current button.
  if (!$(this).hasClass('category-active')) {
    $('.category-active').removeClass('category-active');
    $(this).toggleClass("category-active");
  }
  filterCards();
})





// Show Current Notes in DataBase
getNotes();
