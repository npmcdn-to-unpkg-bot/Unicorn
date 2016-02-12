$(document).ready(function(){
    // Reposition speech bubbles
    $('.comic.x-editor .-comicPanel .-speechBubble')
        .draggable({
            stop: function(event, ui) {
                var $bubble = $(this);

                $.ajax($bubble.data('edit-url'), {
                    method: 'PUT',
                    data: {
                        text: $bubble.text(),
                        position_x: $bubble.position().left,
                        position_y: $bubble.position().top,
                    }
                });
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
        })
});
