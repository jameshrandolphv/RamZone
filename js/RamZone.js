$(document).ready(function() {

    var applySearch = function() {
        var selectedCategory = $(".siteNavigationBar__pageLink__active").text().trim();
        posts.forEach(function(post) {
            if (post["element"].text().toUpperCase().includes($(".siteNavigationBar__search").val().toUpperCase())
                && (post["element"].find(".content__post__textContent__details__category").text().trim() == selectedCategory 
                || selectedCategory == "All")) {
                post["element"].css("display", "block");
            } else {
                post["element"].css("display", "none");
            }
        });
    }
    $(".siteNavigationBar__search").on("input", function() {
        applySearch();
    });
    $(".siteNavigationBar__searchButton").click(function() {
        applySearch();
    });

//Putting this function up here so it can be accessed globally
var retrieveComments = function() {
            /* Retrieve Comments */
            $.ajax('./php/retrieve-comments.php',
                {type: 'POST',
                data: {},
                cache: false,
                success: function (data) {
                    data.forEach(function(comment, index) {
                      console.log(comment);
                        var retrievedComment = new Comment(comment[0*2], comment[1*2], comment[2*2], comment[3*2], comment[4*2], comment[5*2]);
                        /* id, pid, content, time, username, uid */
                        var $postObject = posts[comment[1*2]]["element"];
                        insertComment(retrievedComment, $postObject, comment[1*2]);
                    });
                    posts.forEach(function(post) {
                        var text = post["object"].getComments().length == 1 ? "1 comment" : post["object"].getComments().length + " comments";
                        post["element"].find(".option__comments").html(text);
                    });
                },
                error: function () {
                    var normalColor = $(".content").css("background-color");
                    $(".content").css("background-color", "#a0442b");
                    $(".content").animate({backgroundColor: normalColor}, 1500);
                }
            });
        };
var retrievePosts = function(){
    $(".content__post").remove();
  /* Retrieve Posts */
  $.ajax('./php/retrieve-posts.php',
        {type: 'POST',
        data: {category: "General", sort: "New", user: "", page: "1"},
        cache: false,
        success: function (data) {
            data.forEach(function(post, index) {
              console.log(post);
                var retrievedPost = new Post(/* ID */ post[0*2], post[10*2], post[6*2], post[1*2], post[5*2], post[7*2],
                //  "user"+post[2*2]
                post[9*2]
                  , post[4*2], /* Comments */[]);
                insertPost(retrievedPost, post[10*2+1]/* user votes */);
                console.log(post + "========[" + post.length + "]\n");
                if (index == data.length - 1) {
                    retrieveComments();
                }
            });
            applySearch();
        },
        error: function () {
            var normalColor = $(".content").css("background-color");
            $(".content").css("background-color", "#a0442b");
            $(".content").animate({backgroundColor: normalColor}, 1500);
            console.log("Error retrieving posts...");
        }
    });
};


  /*Hot Posts Clicked*/
  $("#hot").click(function() {
    /*Take off all posts*/
    $(".content__post").remove();

    /* Retrieve Posts */
    $.ajax('./php/retrieve-posts.php',
        {type: 'POST',
        data: {category: "General", sort: "hot", user: "", page: "1"},
        cache: false,
        success: function (data) {
            data.forEach(function(post, index) {
              console.log(post);
                var retrievedPost = new Post(/* ID */ post[0*2], post[10*2], post[6*2], post[1*2], post[5*2], post[7*2],
                //  "user"+post[2*2]
                post[9*2]
                  , post[4*2], /* Comments */[]);
                insertPost(retrievedPost, post[10*2+1]/* user votes */);
                console.log(post + "========[" + post.length + "]\n");
                if (index == data.length - 1) {
                    retrieveComments();
                }
            });
            applySearch();
        },
        error: function () {
            var normalColor = $(".content").css("background-color");
            $(".content").css("background-color", "#a0442b");
            $(".content").animate({backgroundColor: normalColor}, 1500);
            console.log("Error retrieving posts...");
        }
    });
  });


    /*New Posts Clicked*/
    $("#new").click(function() {
        /*Take off all posts*/
        $(".content__post").remove();

        /* Retrieve Posts */
        retrievePosts();
    });

    /*Search Bar Function*/
    // var search=function(searchString){
    // //   var searchWords=searchString.split(' ');
    // //   //all posts
    // //   post=$(".content__post");
    // //   //goes through each post

    // //  for(var i = 0; i < post.length;i++){
    // //     post_i=post[i];
    // //     children=post_i.children[2];
    // //     children=children.children;
    // //     //goes through each word in search Bar
    // //     for(var j = 0; j < searchWords.length;j++){
    // //       if(children[0].innerText.toLowerCase().includes(searchWords[j])
    // //       ||children[1].innerText.toLowerCase().includes(searchWords[j])
    // //       ||children[2].innerText.toLowerCase().includes(searchWords[j])){
    // //         //Make this post visible
    // //         post_i.setAttribute("search","true");
    // //         console.log("true");
    // //       }
    // //     }
    // //   }
    // // $(".content__post").each(function () {
    // //     if ($(this).text().includes(searchString)) {
    // //         $(this).css("display", "block");
    // //     } else {
    // //         $(this).css("display", "none");
    // //     }
    // // });

    // };

    /* Search */
    //$(".siteNavigationBar__searchButton").click(function() {
      //make all search attribute set to false
    //   post=$(".content__post");
    //   for(var i = 0; i < post.length;i++){
    //     post[i].setAttribute("search","false");
    //   }
    //   console.log("SEARCH");
    //   search($(".siteNavigationBar__search").val());
    //   $(".siteNavigationBar__search").val("");
    //});





    /* State variables for the utility panel, submit post form, and content posts */
    var utilityPanelCollapsed = false;
    var submitPostExpanded = false;
    var postActive = false;
    var $activePostObject = null;

    /* Not necessary until mobile optimization is complete */
    var navigationOpenedOnMobile = false;

    /* Local collection of posts */
    var posts = [];

    /* Class representing a comment */
    var Comment = function(id, pid, content, timeSubmitted, username, uid) {
        this.getID = function() {
            return id;
        }
        this.getPID = function() {
            return pid;
        }
        this.getContent = function() {
            return content;
        }
        this.getTimeSinceSubmitted = function() {
            /* Gets minutes (as an integer) since post was submitted */
            var minuteDifference = parseInt( (Date.now() - timeSubmitted) / 1000.0 / 60.0 );

            /* If it's been more than an hours */
            if (minuteDifference > 60) {
                if (minuteDifference / 60 < 2) {
                    return "1 hour";
                } if (minuteDifference / 60 < 24) {
                    parseInt(minuteDifference / 60) + " hours";
                } if (minuteDifference / 60 / 24 < 2) {
                    return "1 day";
                }
                return parseInt(minuteDifference / 60 / 24) + " days";
            } else {
                return minuteDifference + " minutes";
            }
        }
        this.getUser = function() {
            return username;
        }
        this.getUID = function() {
            return uid;
        }
    }

    /* Class representing a post */
    var Post = function(id, voteCount, image, title, content, timeSubmitted, user, category, comments) {
        this.getID = function() {
            return id;
        }
        this.getVoteCount = function() {
            return voteCount;
        }
        this.getImage = function() {
            return image;
        }
        this.getTitle = function() {
            return title;
        }
        this.getContent = function() {
            return content;
        }
        this.getTimeSinceSubmitted = function() {
            /* Gets minutes (as an integer) since post was submitted */
            var minuteDifference = parseInt( (Date.now() - timeSubmitted) / 1000.0 / 60.0 );

            /* If it's been more than an hours */
            if (minuteDifference > 60) {
                if (minuteDifference / 60 < 2) {
                    return "1 hour";
                } if (minuteDifference / 60 < 24) {
                    parseInt(minuteDifference / 60) + " hours";
                } if (minuteDifference / 60 / 24 < 2) {
                    return "1 day";
                }
                return parseInt(minuteDifference / 60 / 24) + " days";
            } else {
                return minuteDifference + " minutes";
            }
        }
        this.getUser = function() {
            return user;
        }
        this.getCategory = function() {
            return category;
        }
        this.getComments = function() {
            return comments;
        }
    }

    /* Function that inserts a comment into the active post */
    var insertComment = function(comment, $post, postID) {
        var $comment = $(
            "<div class='content__post__comments__comment'>"+
                "<p class='content__post__comments__comment__text'>" + comment.getContent() + "</p>"+
                "<p class='content__post__comments__comment__user'>" + comment.getUser() + " replied " + comment.getTimeSinceSubmitted() + " ago</p>"+
            "</div>"
        );
        // $comment.prop("associatedCommentObject", comment);
        $post.find(".content__post__comments").append($comment);
        posts[postID]["object"].getComments().push(comment);
    };

    /* Function that inserts a post (given a post object as a parameter) */
    var insertPost = function(post, userVotes) {

        var upArrow = "content__post__votes__arrow__inactive";
        var downArrow = "content__post__votes__arrow__inactive";
        if (userVotes > 0) {
            var upArrow = "content__post__votes__arrow__active";
        } else if (userVotes < 0) {
            var downArrow = "content__post__votes__arrow__active";
        }
        /* Create the post div and wrap it in a jquery object */
        var $post = $(
            "<div class='content__post' id='" + post.getID() + "'>"+
                "<div class='content__post__votes'>"+
                        "<img class='content__post__votes__arrow " + upArrow + " up' src='./images/vote.png'>"+
                        "<p class='content__post__votes__count'>" + (post.getVoteCount()) + "</p>"+
                        "<img class='content__post__votes__arrow " + downArrow + " down' src='./images/vote.png'>"+
                "</div>"+
                "<div class='content__post__image'>"+
                    "<img class='content__post__image__icon' src='" + post.getImage() + "'>"+
                "</div>"+
                "<div class='content__post__textContent'>"+
                    "<div class='content__post__textContent__title'>"+
                        "<p>" + post.getTitle() + "</p>"+
                    "</div>"+
                    "<div class='content__post__textContent__content'>"+
                        "<p>" + post.getContent() + "</p>"+
                    "</div>"+
                    "<div class='content__post__textContent__details'>"+
                        "<p>submitted " + post.getTimeSinceSubmitted() + " ago by <a>" + post.getUser() + "</a> to <a class='content__post__textContent__details__category'>" + post.getCategory() + "</a></p>"+
                    "</div>"+
                    "<div class='content__post__textContent__options'>"+
                        "<a class='option option__comments'>" + post.getComments().length + " comments</a><a class='option delete'>delete</a>"+
                    "</div>"+
                "</div>"+
                "<div class='content__post__commentForm'>"+
                    "<textarea class='content__post__commentForm__content content__post__commentForm__input' placeholder='Leave a comment...'></textarea>"+
                    "<input class='content__post__commentForm__commentButton' type='button' value='Comment'>"+
                "</div>"+
                "<div class='content__post__comments'>"+
                "</div>"+
            "</div>"
        );
        // $post.prop("associatedPostObject", post);
        posts[post.getID()] = {"element": $post, "object": post};

        /* Delete post */
        $post.find(".delete").click(function() {
            /* Store the post object's data in our database */
            $.ajax('./php/delete-post.php',
            {type: 'POST',
            data: {pid: post.getID()},
            cache: false,
            success: function () {

                location.reload();

            },
            error: function (data) {
                var normalColor = $post.css("background-color");
                $post.css("background-color", "#a0442b");
                $post.animate({backgroundColor: normalColor}, 1000);
            }
            });
        });

        /* Post comment */
        $post.find(".content__post__commentForm__commentButton").click(function(e) {
            e.preventDefault();

            /* If there is no content */
            if ($activePostObject.find(".content__post__commentForm__input").val().length < 1) {
                var normalColor = $activePostObject.find(".content__post__commentForm").css("background-color");
                $activePostObject.find(".content__post__commentForm").css("background-color", "#a0442b");
                $activePostObject.find(".content__post__commentForm").animate({backgroundColor: normalColor}, 1000);
                $activePostObject.find(".content__post__commentForm__input").focus();
                console.log("No comment provided...");
                return;
            }

            /* Verify that the user is logged in */
            var username = " ";
            var uid = 0;
            $.ajax('./php/authenticate.php',
                {type: 'POST',
                cache: false,
                success: function (data) {
                    /* User already logged in */
                    username = data["username"];
                    uid = data["uid"];
                },
                error: function () {
                    /* User not logged in */
                    alert("You cannot comment unless you login!");
                }
            });
            if (username == "") {
                var normalColor = $activePostObject.find(".content__post__commentForm").css("background-color");
                $activePostObject.find(".content__post__commentForm").css("background-color", "#a0442b");
                $activePostObject.find(".content__post__commentForm").animate({backgroundColor: normalColor}, 1000);
                console.log("Not logged in...");
                return;
            }

            var pid = parseInt($activePostObject.attr("id"));
            var content = $activePostObject.find(".content__post__commentForm__input").val();

            /* Store the comment in our database */
            $.ajax('./php/process-submit-comment.php',
                {type: 'POST',
                data: {pid: pid, content: content, time: Date.now(), username: username},
                cache: false,
                success: function (data) {
                    /* Insert the comment into the user's DOM */
                    var commentObject = new Comment(data["cid"], pid, content, Date.now(), username, uid);
                    insertComment(commentObject, posts[pid]["element"], pid);
                    $activePostObject.find(".content__post__commentForm__input").val("");
                    //console.log("COMMENT COUNT: " + (posts[parseInt($activePostObject.attr("id"))]["object"].getComments().length+1));
                    $activePostObject.find(".option__comments").html((posts[parseInt($activePostObject.attr("id"))]["object"].getComments().length) + " comments");
                    // $activePostObject["associatedPostObject"].getComments().push(commentObject);

                    // var normalColor = "#0b4779";
                    // $(".loginBlock").css("background-color", "#548436");
                    // $(".loginBlock").animate({backgroundColor: normalColor}, 1000);
                },
                error: function (data) {
                    var normalColor = $activePostObject.find(".content__post__commentForm").css("background-color");
                    $activePostObject.find(".content__post__commentForm").css("background-color", "#a0442b");
                    $activePostObject.find(".content__post__commentForm").animate({backgroundColor: normalColor}, 1000);
                }
            });
        });

        /* Enable upvote and downvote arrows for the post */
        $post.find(".content__post__votes__arrow").click(function() {


            /* Verify that the user is logged in */
            $.ajax('./php/authenticate.php',
                {type: 'POST',
                cache: false,
                success: function (data) {
                    /* User already logged in */

                },
                error: function () {

                }
            });

            /* Vote */
            var change = 0;
            var currentVote = 0;
            if ($(this).hasClass("content__post__votes__arrow__inactive")) {
                var alreadyVoted = $(this).siblings(".content__post__votes__arrow__active").length > 0;
                $(this).siblings(".content__post__votes__arrow").removeClass("content__post__votes__arrow__active");
                $(this).siblings(".content__post__votes__arrow").addClass("content__post__votes__arrow__inactive");
                $(this).removeClass("content__post__votes__arrow__inactive");
                $(this).addClass("content__post__votes__arrow__active");

                change = alreadyVoted ? 2 : 1;

                if ($(this).hasClass("up")) {
                    $(this).siblings("p").html(parseInt($(this).siblings("p").html()) + change);
                    currentVote = 1;
                } else {
                    $(this).siblings("p").html(parseInt($(this).siblings("p").html()) - change);
                    change = change * -1;
                    currentVote = -1;
                }

            }
            /* Undo vote */
            else {
                $(this).removeClass("content__post__votes__arrow__active");
                $(this).addClass("content__post__votes__arrow__inactive");

                if ($(this).hasClass("up")) {
                    $(this).siblings("p").html(parseInt($(this).siblings("p").html()) - 1);
                    change = -1;
                } else {
                    $(this).siblings("p").html(parseInt($(this).siblings("p").html()) + 1);
                    change = 1;
                }

                currentVote = 0;
            }

            var pid = $post.attr("id");

            /* Store the post object's data in our database */
            $.ajax('./php/process-vote.php',
                {type: 'POST',
                data: {pid: pid, change: change, currentVote: currentVote},
                cache: false,
                success: function () {

                },
                error: function (data) {
                    alert("Your vote won't count if you aren't logged in!");
                }
            });


        });

        /* Function for displaying a post */
        var activatePost = function() {
            if (postActive && $activePostObject == $post) {
                $post.animate({height: "90px"}, 200, function() {
                    $post.find(".content__post__textContent__content").css("display", "none");
                    $post.find(".content__post__commentForm").css("display", "none");
                    $post.find(".content__post__comments").css("display", "none");
                    $(".content__post").each(function() {
                        $(this).css("display", "block");
                        $(this).css("overflow-y", "hidden");
                    });
                });
                postActive = false;
                $activePostObject = null;
            } else {
                $(".content__post").each(function() {
                    $(this).css("height", "90px");
                    $(this).css("display", "none");
                    $(this).css("overflow-y", "hidden");
                });
                $post.css("display", "block");
                $post.animate({height: "90%"}, 200, function() {
                    $post.css("overflow-y", "auto");
                });
                $post.find(".content__post__textContent__content").css("display", "block");
                $post.find(".content__post__commentForm").css("display", "block");
                $post.find(".content__post__comments").css("display", "block");
                postActive = true;
                $activePostObject = $post;
            }
        };

        /* Click listener for displaying the post content and comments */
        $post.find(".content__post__textContent__title").click(activatePost);
        $post.find(".option__comments").click(activatePost);

        /* Append the post to the top of the content pane */
        $($post).insertAfter($(".content__header"));
    }

    /* This function clears up what content is being displayed */
    var updateContentSortHeader = function() {
        /* Update content header */
        var sortPrefix = $(".utilityPanel__optionBlock__option__active").text().trim() == "Hot" ? "HOT posts in " :
        $(".utilityPanel__optionBlock__option__active").text().trim() == "New" ? "NEW posts in " :
        $(".utilityPanel__optionBlock__option__active").text().trim() == "Posts" ? "MY posts to " :
        $(".utilityPanel__optionBlock__option__active").text().trim() == "Comments" ? "MY comments in " :
        "My SAVED posts in ";
        var categorySuffix = $(".siteNavigationBar__pageLink__active").text().toUpperCase();
        if (categorySuffix == "ALL") {
            if (sortPrefix == "MY posts to ") {
                sortPrefix = "ALL of MY posts";
                categorySuffix = "";
            } else if (sortPrefix == "MY comments in ") {
                sortPrefix = "ALL of MY comments";
                categorySuffix = "";
            } else if (sortPrefix == "My SAVED posts in ") {
                sortPrefix = "ALL of my SAVED posts";
                categorySuffix = "";
            }
        }
        $(".content__header").html(sortPrefix + categorySuffix);
    };


    /* ****************************** */
    /* ****** CLICK LISTENERS ******* */
    /* ****************************** */

    /* Click listener that expands the submit post form */
    $(".infoPane__submitButton").click(function() {
        if (submitPostExpanded) {
            $(".infoPane__submitForm").css("display", "none");
            submitPostExpanded = false;
        } else {
            $(".infoPane__submitForm").css("display", "block");
            submitPostExpanded = true;
        }
    });

    /* Click listener that inserts a post using info from the submit post form */
    $(".infoPane__submitForm__postButton").click(function(event) {
        event.preventDefault();

        /* If there is no title */
        if ($(".infoPane__submitForm__title").val().length < 1) {
            var normalColor = $(".infoPane__submitForm").css("background-color");
            $(".infoPane__submitForm").css("background-color", "#a0442b");
            $(".infoPane__submitForm").animate({backgroundColor: normalColor}, 1000);
            $(".infoPane__submitForm__title").focus();
            return;
        }

        var thumbnailLink = $(".infoPane__submitForm__thumnailLink").val().substring(0,4) == "http" ? $(".infoPane__submitForm__thumnailLink").val() : "./images/logo.png";
        var title = $(".infoPane__submitForm__title").val();
        var content = $(".infoPane__submitForm__content").val();

        /* Verify that the user is logged in */
        var username = "";
        $.ajax('./php/authenticate.php',
            {type: 'POST',
            cache: false,
            success: function (data) {
                /* User already logged in */
                username = data["username"];
                var category = $(".infoPane__submitForm__select").val();

                /* Store the post object's data in our database */
                $.ajax('./php/process-submit-post.php',
                    {type: 'POST',
                    data: {title: title, category: category, content: content, thumbnailLink: thumbnailLink, time: Date.now()},
                    cache: false,
                    success: function () {
                        /* Insert the post into the user's DOM */
                        var postObject = new Post(/* TODO: ID */0, 0, thumbnailLink, title, content, Date.now(), username, category, []);
                        insertPost(postObject, 0);

                        location.reload();

                        // var normalColor = "#0b4779";
                        // $(".loginBlock").css("background-color", "#548436");
                        // $(".loginBlock").animate({backgroundColor: normalColor}, 1000);
                    },
                    error: function (data) {
                        var normalColor = $(".infoPane__submitForm").css("background-color");
                        $(".infoPane__submitForm").css("background-color", "#a0442b");
                        $(".infoPane__submitForm").animate({backgroundColor: normalColor}, 1000);
                    }
                });

                /*Take off all posts*/
                $(".content__post").remove();
                /* Retrieve Posts */
                retrievePosts();
            },
            error: function () {
                // alert("You are not logged in!");
                /* User not logged in */
                    var normalColor = $(".infoPane__submitForm").css("background-color");
                    $(".infoPane__submitForm").css("background-color", "#a0442b");
                    $(".infoPane__submitForm").animate({backgroundColor: normalColor}, 1000);
                    return;
            }
        });

        /*Clear the fields*/
        $(".infoPane__submitForm__title").val("");
        $(".infoPane__submitForm__content").val("");
        $(".infoPane__submitForm__thumnailLink").val("");
    });


    /* ****************************** */
    /* FUNCTIONS THAT PREPARE THE DOM */
    /* ****************************** */

    /* DESKTOP */
    var prepareForDesktop = function() {

        /* Click listener for categories */
        $(".siteNavigationBar__pageLink").click(function () {
            /* Hide any active posts */
            $(".content__post").each(function() {
                $(this).css("display", "block");
                $(this).css("height", "90px");
                $(this).css("overflow-y", "hidden");
                $(this).find(".content__post__textContent__content").css("display", "none");
                $(this).find(".content__post__commentForm").css("display", "none");
                $(this).find(".content__post__comments").css("display", "none");
            });
            postActive = false;
            $activePostObject = null;

            $(".siteNavigationBar__pageLink").removeClass("siteNavigationBar__pageLink__active");
            $(".siteNavigationBar__pageLink").addClass("siteNavigationBar__pageLink__inactive");
            $(this).removeClass("siteNavigationBar__pageLink__inactive");
            $(this).addClass("siteNavigationBar__pageLink__active");

            var selectedCategory = $(".siteNavigationBar__pageLink__active").text().trim();
            $(".content__post").each(function () {
                if ($(this).find(".content__post__textContent__details__category").text().trim() == selectedCategory ||
                    selectedCategory == "All") {
                    $(this).css("display", "block");
                } else {
                    $(this).css("display", "none");
                }
            });

            updateContentSortHeader();
            applySearch();
        });

        /* Click listener for utility panel collapser */
        $(".utilityPanel__collapser").click(function() {
            if (utilityPanelCollapsed) {
                $(this).animate({left: "+=215px"}, 200);
                $(".utilityPanel").animate({left: "+=215px"}, 200);
                $(".siteNavigationBar").animate({left: "+=215px"}, 200);
                $(".content").animate({left: "+=215px"}, 200);
                $(".utilityPanel__optionBlock").css("border-bottom", "1px solid #487697");
                $(".loginBlock").animate({opacity: "1"}, 200);
                $(".createAccountBlock").animate({opacity: "1"}, 200);
                $(".utilityPanel__collapser__arrow").rotate({
                    angle: 180,
                    animateTo: 0,
                    duration: 600
                });
                $(".utilityPanel__optionBlock__option__icon__collapsed").animate({opacity: "0"}, 200);
                $(".content__post").animate({width: "62%"}, 200);
                $(".next").css("padding-right", "42%");
                utilityPanelCollapsed = false;
            } else {
                $(this).animate({left: "-=215px"}, 200);
                $(".utilityPanel").animate({left: "-=215px"}, 200);
                $(".siteNavigationBar").animate({left: "-=215px"}, 200);
                $(".content").animate({left: "-=215px"}, 200);
                $(".utilityPanel__optionBlock").css("border-bottom", "0px solid #487697");
                $(".loginBlock").animate({opacity: "0"}, 200);
                $(".createAccountBlock").animate({opacity: "0"}, 200);
                $(".utilityPanel__collapser__arrow").rotate({
                    angle: 0,
                    animateTo: 180,
                    duration: 600
                });
                $(".utilityPanel__optionBlock__option__icon__collapsed").animate({opacity: "1"}, 200);
                $(".content__post").animate({width: "80%"}, 200);
                $(".next").css("padding-right", "25%");
                utilityPanelCollapsed = true;
            }
        });

        /* Click listener for selecting a utility panel option */
        $(".utilityPanel__optionBlock__option").click(function() {
            $(".utilityPanel__optionBlock__option").removeClass("utilityPanel__optionBlock__option__active");
            $(".utilityPanel__optionBlock__option").addClass("utilityPanel__optionBlock__option__inactive");
            $(this).removeClass("utilityPanel__optionBlock__option__inactive");
            $(this).addClass("utilityPanel__optionBlock__option__active");

            var img = $(this).find(".icon");
            if (img.hasClass("hot")) {
                img.attr("src", "./images/hot-active.png");
            } else {
                $(".hot").attr("src", "./images/hot.png");
            }
            if (img.hasClass("new")) {
                img.attr("src", "./images/new-active.png");
            } else {
                $(".new").attr("src", "./images/new.png");
            }
            if (img.hasClass("posts")) {
                img.attr("src", "./images/posts-active.png");
            } else {
                $(".posts").attr("src", "./images/posts.png");
            }
            if (img.hasClass("comments")) {
                img.attr("src", "./images/comments-active.png");
            } else {
                $(".comments").attr("src", "./images/comments.png");
            }
            if (img.hasClass("saved")) {
                img.attr("src", "./images/saved-active.png");
            } else {
                $(".saved").attr("src", "./images/saved.png");
            }

            updateContentSortHeader();
            applySearch();
        });

        /* If the user is already logged in */
        var username="";
        $.ajax('./php/authenticate.php',
            {type: 'POST',
            cache: false,
            success: function (data) {
              username=data["username"];
                /* User already logged in, so display account and logout blocks */
                $(".accountBlock").css("display", "block");
                $(".logoutBlock").css("display", "block");
                $(".loginBlock").css("display", "none");
                $(".createAccountBlock").css("display", "none");

                $(".usernameHeader").html("" + data["username"].toUpperCase());
            },
            error: function () {
                /* User not logged in, so display login and register blocks */
                $(".accountBlock").css("display", "none");
                $(".logoutBlock").css("display", "none");
                $(".loginBlock").css("display", "block");
                $(".createAccountBlock").css("display", "block");
            }
        });

        /* Logout */
        $(".logout").click(function(e) {
            e.preventDefault();
            $.ajax('./php/process-logout.php',
                {type: 'POST',
                cache: false,
                success: function () {
                    $(".accountBlock").css("display", "none");
                    $(".logoutBlock").css("display", "none");
                    $(".loginBlock").css("display", "block");
                    $(".createAccountBlock").css("display", "block");
                    $(".usernameHeader").html("MY ACCOUNT");
                },
                error: function () {
                    $(".accountBlock").css("display", "block");
                    $(".logoutBlock").css("display", "block");
                    $(".loginBlock").css("display", "none");
                    $(".createAccountBlock").css("display", "none");
                }
            });
        });

        /* Login */
        $(".login").click(function(e) {
            e.preventDefault();
            $.ajax('./php/process-login.php',
                {type: 'POST',
                data: {username: $('.utilityPanel__optionBlock__username').val(), password: hex_sha512($('.utilityPanel__optionBlock__password').val())},
                cache: false,
                success: function (data) {
                    $(".accountBlock").css("display", "block");
                    $(".logoutBlock").css("display", "block");
                    $(".loginBlock").css("display", "none");
                    $(".createAccountBlock").css("display", "none");

                    var normalColor = "#0b4779";
                    $(".accountBlock").css("background-color", "#548436");
                    $(".accountBlock").animate({backgroundColor: normalColor}, 1000);

                    $('.utilityPanel__optionBlock__username').val("");
                    $('.utilityPanel__optionBlock__password').val("");

                    $(".usernameHeader").html("" + data["username"].toUpperCase());
                },
                error: function () {
                    $(".accountBlock").css("display", "none");
                    $(".logoutBlock").css("display", "none");
                    $(".loginBlock").css("display", "block");
                    $(".createAccountBlock").css("display", "block");

                    var normalColor = "#0b4779";
                    $(".loginBlock").css("background-color", "#a0442b");
                    $(".loginBlock").animate({backgroundColor: normalColor}, 1000);
                }
            });
        });

        /* Register a New User */
        $(".signup").click(function(e) {
            e.preventDefault();

            /* Check to see if username contains spaces */
            reg = /^\w+$/;
            if(!reg.test($(".utilityPanel__optionBlock__newUsername").val())) {
                $(".utilityPanel__optionBlock__newUsername").focus();
                var normalColor = "#0b4779";
                $(".createAccountBlock").css("background-color", "#a0442b");
                $(".createAccountBlock").animate({backgroundColor: normalColor}, 1000);
                return false;
            }

            /* Check to make sure passwords match */
            if ($('.utilityPanel__optionBlock__newPassword').val() != $('.utilityPanel__optionBlock__confirmNewPassword').val()) {
                $('.utilityPanel__optionBlock__confirmNewPassword').focus();
                var normalColor = "#0b4779";
                $(".createAccountBlock").css("background-color", "#a0442b");
                $(".createAccountBlock").animate({backgroundColor: normalColor}, 1000);
                return false;
            }

            $.ajax('./php/process-register.php',
                {type: 'POST',
                data: {username: $('.utilityPanel__optionBlock__newUsername').val(), email: $('.utilityPanel__optionBlock__email').val(), password: hex_sha512($('.utilityPanel__optionBlock__newPassword').val())},
                cache: false,
                success: function () {
                    $(".accountBlock").css("display", "block");
                    $(".logoutBlock").css("display", "block");
                    $(".loginBlock").css("display", "none");
                    $(".createAccountBlock").css("display", "none");

                    $('.utilityPanel__optionBlock__newUsername').val("");
                    $('.utilityPanel__optionBlock__email').val("");
                    $('.utilityPanel__optionBlock__newPassword').val("");
                    $('.utilityPanel__optionBlock__confirmNewPassword').val("");

                    var normalColor = "#0b4779";
                    $(".loginBlock").css("background-color", "#548436");
                    $(".loginBlock").animate({backgroundColor: normalColor}, 1000);
                },
                error: function () {
                    $(".accountBlock").css("display", "none");
                    $(".logoutBlock").css("display", "none");
                    $(".loginBlock").css("display", "block");
                    $(".createAccountBlock").css("display", "block");

                    var normalColor = "#0b4779";
                    $(".createAccountBlock").css("background-color", "#a0442b");
                    $(".createAccountBlock").animate({backgroundColor: normalColor}, 1000);
                }
            });
        });


        var retrieveComments = function() {
            /* Retrieve Comments */
            $.ajax('./php/retrieve-comments.php',
                {type: 'POST',
                data: {},
                cache: false,
                success: function (data) {
                    data.forEach(function(comment, index) {
                        var retrievedComment = new Comment(comment[0*2], comment[1*2], comment[2*2], comment[3*2], comment[4*2], comment[5*2]);
                        /* id, pid, content, time, username, uid */
                        var $postObject = posts[comment[1*2]]["element"];
                        insertComment(retrievedComment, $postObject, comment[1*2]);
                    });
                    posts.forEach(function(post) {
                        var text = post["object"].getComments().length == 1 ? "1 comment" : post["object"].getComments().length + " comments";
                        post["element"].find(".option__comments").html(text);
                    });
                },
                error: function () {
                    var normalColor = $(".content").css("background-color");
                    $(".content").css("background-color", "#a0442b");
                    $(".content").animate({backgroundColor: normalColor}, 1500);
                }
            });
        };


    retrievePosts();


    
    /* My posts Clicked*/
    $("#myPosts").click(function() {
      /*Take off all posts*/
      $(".content__post").remove();

      console.log("USERNAME: " + username);
      /* Retrieve Posts */
      $.ajax('./php/retrieve-posts.php',
        {type: 'POST',
        data: {category: "General", sort: "myPosts", user: username, page: "1"},
        cache: false,
        success: function (data) {
            data.forEach(function(post, index) {
              console.log(post);
                var retrievedPost = new Post(/* ID */ post[0*2], post[10*2], post[6*2], post[1*2], post[5*2], post[7*2],
                //  "user"+post[2*2]
                post[9*2]
                  , post[4*2], /* Comments */[]);
                insertPost(retrievedPost, post[10*2+1]/* user votes */);
                console.log(post + "========[" + post.length + "]\n");
                if (index == data.length - 1) {
                    retrieveComments();
                }
            });
            applySearch();
        },
        error: function () {
            var normalColor = $(".content").css("background-color");
            $(".content").css("background-color", "#a0442b");
            $(".content").animate({backgroundColor: normalColor}, 1500);
            console.log("Error retrieving posts...");
        }
    });
    });



    };

    prepareForDesktop();

});
