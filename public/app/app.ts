var wall; // for dev purposes wall made accessible in browser console
$(document).ready(function () {
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
        stop: function (event, ui) {
            updateSpeechBubble($(this));
        }
    });
    $('.comic.x-editor .-comicPanel .-speechBubble .-delete')
        .on('click', function (event) {
        event.preventDefault();
        var $trashButton = $(this);
        $.ajax({
            url: $trashButton.data('delete-url'),
            method: 'DELETE',
            success: function () {
                $trashButton.parent().remove();
            }
        });
    });
    $('.comic.x-editor .-comicPanel .-speechBubble .-edit')
        .on('click', function (event) {
        event.preventDefault();
        var $speechBubble = $(this).parent();
        var newText = prompt('Enter the caption for this speech bubble', $speechBubble.text());
        $speechBubble.children('.-text').text(newText);
        updateSpeechBubble($speechBubble);
    });
    // POST request to add panel: this is probably an overkill
    // problem: if requests sent too frequently, server gets comic panel position conflict at insertion
    function addPanel() {
        $.ajax({
            url: $("#add-panel-btn").attr("data-add-panel-url"),
            type: "POST",
            dataType: "json",
            success: function (json) {
                // json = {newPanelHtml: XXX, statusString: XXX}
                // alert( json.statusString );
                var $newPanel = $(json.newPanelHtml);
                $("ul#panels-list").append($newPanel);
                $newPanel.collapse("show");
                // console.log(json.newPanelHtml);
                updateInfoBoxes(json.statusString);
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem sending the request!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            // Code to run regardless of success or failure
            complete: function (xhr, status) {
                // alert( "The request is complete!" );
            }
        });
    }
    // PUT request to save panels' order
    function savePanelsOrder() {
        var newOrder = $("#panels-list").sortable('toArray', { attribute: 'data-original-index' });
        var statusString;
        console.log(newOrder);
        $.ajax({
            url: $("#panel-save-order").attr("data-save-order-url"),
            type: "PUT",
            data: { newOrder: newOrder },
            dataType: "json",
            success: function (json) {
                // json = {statusString: XXX}
                statusString = json.statusString;
                if (json.statusString === "PanelReordered") {
                    window.location.href = updateQueryStringParameter(window.location.pathname, "status", statusString);
                }
                else {
                    updateInfoBoxes(statusString);
                }
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem sending the request!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            // Code to run regardless of success or failure
            complete: function (xhr, status) {
                // alert( "The request is complete!" );
            }
        });
    }
    // GET request to search for comics
    function searchComics() {
        var comicname = $("input#inputComicName:input").val();
        $.ajax({
            url: "/comics/searchcomic",
            type: "POST",
            data: { comicname: comicname },
            dataType: "json",
            success: function (json) {
                // json = {newComicsHtml: html}
                $("#freewall-p").html(json.newComicsHtml);
                wall = new Freewall("#comics-list");
                wall.reset(freewallInitObj);
                wall.fitWidth();
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem sending the request!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            // Code to run regardless of success or failure
            complete: function (xhr, status) {
                // alert( "The request is complete!" );
            }
        });
    }
    // GET request to search for contributor
    function searchContributor() {
        var contributorname = $("input#inputContributorName:input").val();
        $.ajax({
            url: "/users/searchContributor",
            type: "POST",
            data: { contributorname: contributorname },
            dataType: "json",
            success: function (json) {
                // json = {newComicsHtml: html}
                $("#user-list").html(json.newUsersHtml);
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem sending the request!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            // Code to run regardless of success or failure
            complete: function (xhr, status) {
                // alert( "The request is complete!" );
            }
        });
    }
    function updateInfoBoxes(statusString) {
        var sentences = {
            BGAllGood: '<div class="alert alert-success" role="alert">        \
                      <strong> Well done! </strong>                       \
                      Your background image was successfully replaced!    \
                    </div>',
            BGRetry: '<div class="alert alert-danger" role="alert">        \
                    <strong> Ooooooops! </strong>                       \
                    Your background image was not replaced due to server side problems! Please retry later...    \
                  </div>',
            BGRemind: '<div class="alert alert-danger" role="alert">        \
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
                        </div>',
            ComicDeleted: '<div class="alert alert-success" role="alert">        \
                          <strong> Well done! </strong>                       \
                          Your comic has been deleted!    \
                        </div>',
            ComicNotDeleted: '<div class="alert alert-danger" role="alert">        \
                          <strong> Ooooooops! </strong>                       \
                          Your Comic was not deleted! Please try again or refresh the page    \
                        </div>'
        };
        var closeAlert = '<a href=' + '#' + ' class="close" data-dismiss="alert" aria-label="close">&times;</a>';
        var newInfo = sentences[statusString];
        var infoBoxes = $(".info-boxes");
        infoBoxes.html(newInfo);
        infoBoxes.children(".alert").each(function (index) {
            $(this).prepend(closeAlert);
        });
    }
    function startReordering() {
        $(".sortable-panels").sortable();
        $("#panel-reorder").attr("id", "panel-save-order");
        $("#panel-save-order").text("Save order changes!");
        $("#panel-save-order").click(savePanelsOrder);
        $("#panels-list").on("mouseenter", "li.-comicPanel", function () {
            $(this).css("box-shadow", "10px 10px 5px grey");
        });
        $("#panels-list").on("mouseleave", "li.-comicPanel", function () {
            $(this).css("box-shadow", "none");
        });
        /*
        $("#panels-list > *").hover(function() {
          $(this).css("box-shadow", "10px 10px 5px grey");
        }, function() {
          $(this).css("box-shadow", "none");
        });
        */
    }
    // Remove collaborators
    $('.delete-collaborator')
        .on('click', function (event) {
        event.preventDefault();
        var $trashButton = $(this);
        $.ajax({
            url: $trashButton.data('delete-url'),
            method: 'DELETE',
            success: function () {
                $trashButton.parent().remove();
            }
        });
    });
    // adds or updates query string parameter
    // source http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
    // Read a page's GET URL variables and return them as an associative array.
    // source: http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    // used for javascript sort function
    function compare(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }
    // add, delete and re-order panels
    updateInfoBoxes(getUrlVars()["status"]);
    $("#add-panel-btn").click(addPanel);
    $("#panel-reorder").click(startReordering);
    $("div[id|='collapsible-panel']").collapse('show');
    $("#panel-show-all").click(function () {
        $("div[id|='collapsible-panel']").collapse('show');
    });
    $("#panel-collapse-all").click(function () {
        $("div[id|='collapsible-panel']").collapse('hide');
    });
    // search for comics
    $("#search-btn").on("click", searchComics);
    $("#inputComicName").on("keydown", function (event) {
        if (event.keyCode == 13) {
            $("#search-btn").trigger("click");
            return false;
        }
    });
    // search for contributor
    $("#search-contributor-btn").on("click", searchContributor);
    $("#inputContributorName").on("keydown", function (event) {
        if (event.keyCode == 13) {
            $("#search-contributor-btn").trigger("click");
            return false;
        }
    });
    // Freewall dynamic grids for comics display
    // no errors occur even when $("#comics-list") returns [] (empty array)
    wall = new Freewall("#comics-list");
    freewallInitObj = {
        selector: '.comics-brick',
        animate: true,
        draggable: false,
        cellW: 200,
        cellH: 'auto',
        onResize: function () {
            wall.fitWidth();
        }
    };
    wall.reset(freewallInitObj);
    wall.container.find('.comics-brick img').load(function () {
        wall.fitWidth();
    });
    var sortCriterion = "data-created-at";
    wall.sortBy(function (a, z) {
        var invert = -1;
        var regex = /"/g; // extra double quotes somehow appear at the beginning and end of data strings
        var ap = Date.parse($(a).attr(sortCriterion).replace(regex, ""));
        var zp = Date.parse($(z).attr(sortCriterion).replace(regex, ""));
        return invert * compare(ap, zp);
    });
    $("#sort").on("click", "li", function customSort() {
        sortCriterion = $(this).attr("data-name");
        console.log(sortCriterion);
        var invert = 1;
        if (sortCriterion === "data-num-panels" || sortCriterion === "data-created-at") {
            invert = -1;
        }
        wall.sortBy(function (a, z) {
            var ap = $(a).attr(sortCriterion);
            var zp = $(z).attr(sortCriterion);
            if (sortCriterion === "data-created-at") {
                var regex = /"/g; // extra double quotes somehow appear at the beginning and end of data strings
                var ap = Date.parse($(a).attr(sortCriterion).replace(regex, ""));
                var zp = Date.parse($(z).attr(sortCriterion).replace(regex, ""));
            }
            if (sortCriterion === "data-num-panels") {
                ap = parseInt(ap, 10);
                zp = parseInt(zp, 10);
            }
            return invert * compare(ap, zp);
        });
    });
    // delete a comic -- admin
    function deleteComic(comicId) {
        $.ajax({
            url: "/comics/"+comicId,
            type: "DELETE",
            data: {},
            dataType: "json",
            success: function (json) {
                // json = {statusString: "ComicDeleted"/"ComicNotDeleted"}
                updateInfoBoxes(json.statusString);
                if (json.statusString == "ComicDeleted") {
                    $("div.comics-brick[data-comic-id=" + comicId + "]").remove();
                }
                wall.refresh();
            },
            error: function (xhr, status, errorThrown) {
                alert("Sorry, there was a problem sending the request!");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            },
            // Code to run regardless of success or failure
            complete: function (xhr, status) {
                alert("The request is complete!");
            }
        });
    }
    // wait until images are loaded and all css and/or js styling (hopefully) finished execution
    $("img").imagesLoaded(function () {
        // content hover plugin to add effects when mouse pointer hovers over an image.
        $(".hover-img").contenthover({
            overlay_background: 'rgb(125, 131, 136)',
            overlay_opacity: 0.8
        });
        // center vertical button groups on images
        var targets = $(".contenthover");
        targets.each(function () {
            var elem;
            elem = $(this);
            elem.on("mouseover", function () {
                elem1 = $(this);
                elem1.children(".btn-group-vertical.center").center(true);
            });
        });
        $(".delete-comic.btn").each(function(){
          var elem = $(this);
          elem.on("click",function(){
            console.log("clicked");
            deleteComic($(this).attr("data-comic-id"));
          });
        });
    });
    // a little plugin to center any element (1) with fixed width and height and (2) with a parent that has fixed width and height
    // put it before your first use
    // source: http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
    jQuery.fn.center = function (parent) {
        if (parent) {
            parent = this.parent();
        }
        else {
            parent = window;
        }
        this.css({
            "position": "absolute",
            "top": ((($(parent).outerHeight() - this.outerHeight()) / 2) + $(parent).scrollTop() + "px"),
            "left": ((($(parent).outerWidth() - this.outerWidth()) / 2) + $(parent).scrollLeft() + "px")
        });
        return this;
    };
});
