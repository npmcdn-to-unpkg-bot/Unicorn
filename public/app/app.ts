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
        });


    // Remove collaborators
    $('.delete-collaborator')
        .on('click', function(event) {
            event.preventDefault();
            var $trashButton = $(this);

            $.ajax({
                url: $trashButton.data('delete-url'),
                method: 'DELETE',
                success: function() {
                    $trashButton.parent().remove();
                }
            })
        });
});
