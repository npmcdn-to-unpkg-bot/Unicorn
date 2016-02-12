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
});
