$(document).ready(function(){
    function updateSpeechBubble($bubble) {
        $.ajax($bubble.data('edit-url'), {
            method: 'PUT',
            data: {
                text: $bubble.children('.-text').text(),
                position_x: $bubble.position().left,
                position_y: $bubble.position().top,
            }
        });
    }

    // Reposition speech bubbles
    $('.comic.x-editor .-comicPanel .-speechBubble')
        .draggable({
            stop: function(event, ui) {
                updateSpeechBubble($(this));
            }
        });


    $('.comic.x-editor .-comicPanel .-speechBubble .-delete')
        .on('click', function(event) {
            event.preventDefault();
            var $trashButton = $(this);

            $.ajax({
                url: $trashButton.data('delete-url'),
                method: 'DELETE',
                success: function() {
                    $trashButton.parent().remove()
                }
            })
        });

    $('.comic.x-editor .-comicPanel .-speechBubble .-edit')
        .on('click', function(event) {
            event.preventDefault();
            var $speechBubble = $(this).parent();

            var newText = prompt('Enter the caption for this speech bubble', $speechBubble.text());
            $speechBubble.children('.-text').text(newText);
            updateSpeechBubble($speechBubble);
        })
		
	// POST request to add panel: this is probably an overkill
  // problem: if requests sent too frequently, server gets comic panel position conflict at insertion
	function addPanel() {
		$.ajax({
			url: $("#add-panel-btn").attr("data-add-panel-url"),
			type: "POST",
			dataType : "json",
			success: function( json ) {
				// json = {newPanelHtml: XXX, statusString: XXX}
				// alert( json.statusString );
        var $newPanel = $(json.newPanelHtml);
				$("ul#panels-list").append($newPanel);
        $newPanel.collapse("show");
				console.log(json.newPanelHtml);
        updateInfoBoxes(json.statusString);
			},
			error: function( xhr, status, errorThrown ) {
				alert( "Sorry, there was a problem sending the request!" );
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
				console.dir( xhr );
			},
			
			// Code to run regardless of success or failure
			complete: function( xhr, status ) {
				// alert( "The request is complete!" );
			}
		});	
	}
  
  // PUT request to save panels' order
	function savePanelsOrder() {
    var newOrder = $("#panels-list").sortable('toArray', {attribute: 'data-original-index'});
    console.log(newOrder);
		$.ajax({
			url: $("#panel-save-order").attr("data-save-order-url"),
			type: "PUT",
      data: {newOrder: newOrder},
			dataType : "json",
			success: function( json ) {
				// json = {statusString: XXX}
        statusString = json.statusString;
				alert( json.statusString );
        if (json.statusString==="PanelReordered") {
          window.location.href = window.location.pathname + "./?status=" + statusString;
        } else {
          updateInfoBoxes(statusString);
        }
			},
			error: function( xhr, status, errorThrown ) {
				alert( "Sorry, there was a problem sending the request!" );
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
				console.dir( xhr );
			},
			
			// Code to run regardless of success or failure
			complete: function( xhr, status ) {
				alert( "The request is complete!" );
			}
		});	
	}
	
  function updateInfoBoxes(statusString) {
    var sentences = {
      BGAllGood:   '<div class="alert alert-success" role="alert">        \
                      <strong> Well done! </strong>                       \
                      Your background image was successfully replaced!    \
                    </div>',
      BGRetry:   '<div class="alert alert-danger" role="alert">        \
                    <strong> Ooooooops! </strong>                       \
                    Your background image was not replaced due to server side problems! Please retry later...    \
                  </div>',
      BGRemind:  '<div class="alert alert-danger" role="alert">        \
                    <strong> Ooooooops! </strong>                       \
                    Your background image was not replaced! Please check your upload file type, image size and url!    \
                  </div>',
      PanelRetry: '<div class="alert alert-danger" role="alert">        \
                    <strong> Ooooooops! </strong>                       \
                    Your new panel was not added! Please try again...    \
                  </div>',
      PanelAdded: '<div class="alert alert-success" role="alert">        \
                    <strong> Well done!! </strong>                       \
                    Your new panel has been added!    \
                  </div>',
      PanelDeleted: '<div class="alert alert-success" role="alert">        \
                      <strong> Well done! </strong>                       \
                      Your old panel has been deleted!    \
                    </div>',
      PanelNotDeleted: '<div class="alert alert-danger" role="alert">        \
                          <strong> Ooooooops! </strong>                       \
                          Your old panel was not deleted! Please try again...    \
                        </div>',
      PanelReordered: '<div class="alert alert-success" role="alert">        \
                          <strong> Well done! </strong>                       \
                          Your panels have been reordered!    \
                        </div>',
      PanelNotReordered: '<div class="alert alert-danger" role="alert">        \
                          <strong> Ooooooops! </strong>                       \
                          Your panels were not reordered! Please try again...    \
                        </div>'
    };
    var closeAlert = '<a href=' + '#' + ' class="close" data-dismiss="alert" aria-label="close">&times;</a>';
    var newInfo = sentences[statusString];
    var infoBoxes = $(".info-boxes");
    infoBoxes.html(newInfo);
    infoBoxes.children(".alert").each(function(index){
      $( this ).prepend( closeAlert );
    });
  }
  
  // Read a page's GET URL variables and return them as an associative array.
  // source: http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
  function getUrlVars()
  {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++)
      {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
      }
      return vars;
  }
  
  function startReordering() {
    $(".sortable-panels").sortable();
    $("#panel-reorder").attr("id","panel-save-order");
    $("#panel-save-order").text("Save order changes!");
    $("#panel-save-order").click(savePanelsOrder);
    $("#panels-list > *").hover(function() {
      $(this).css("box-shadow", "10px 10px 5px grey");
    }, function() {
      $(this).css("box-shadow", "none");
    });
  }
  
  updateInfoBoxes( getUrlVars()["status"] );
  
  $("#add-panel-btn").click(addPanel);
  
  $("#panel-reorder").click(startReordering);
	
  
	
	$("div[id|='collapsible-panel']").collapse('show');
	
	$("#panel-show-all").click(function(){
		$("div[id|='collapsible-panel']").collapse('show');
	});
	
	$("#panel-collapse-all").click(function(){
		$("div[id|='collapsible-panel']").collapse('hide');
	});
  
});
