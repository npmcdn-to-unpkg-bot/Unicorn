$(document).ready(function(){
    var speechBubbles = $('.comic.x-editor .-comicPanel .-speechBubble')
        .draggable({
            stop: function(event, ui) {
                // TODO: save the position
                var $bubble = $(this);
                console.log($bubble.position());
            }
        });
});
