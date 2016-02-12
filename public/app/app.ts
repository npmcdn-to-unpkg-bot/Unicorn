$(document).ready(function(){
    // Reposition speech bubbles
    $('.comic.x-editor .-comicPanel .-speechBubble')
        .draggable({
            stop: function(event, ui) {
                // TODO: save the position
                var $bubble = $(this);
                console.log($bubble.position());
            }
        });
});
