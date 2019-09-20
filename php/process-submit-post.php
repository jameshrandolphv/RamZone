<?php

/* Connect to the db */
include_once("connect-to-db.php");

session_start();

/* If a username, email, and hashed password have been posted */
if (isset($_POST["title"], $_POST["category"], $_POST["content"], $_POST["thumbnailLink"], $_POST["time"])) {
    
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Not logged in');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }

    /* Sanitize and store the request variables */
    $title = filter_input(INPUT_POST, "title", FILTER_SANITIZE_STRING);
    $uid = $_SESSION['user_id'];
    $category = filter_input(INPUT_POST, "category", FILTER_SANITIZE_STRING);
    $content = filter_input(INPUT_POST, "content", FILTER_SANITIZE_STRING);
    $thumbnailLink = filter_input(INPUT_POST, "thumbnailLink", FILTER_SANITIZE_URL);
    $time = $_POST["time"];

    /* Create a new Votes entry for this post */
    $vote = "INSERT INTO Votes (count) VALUES (0)";
    $insert_vote = $mysqli->prepare($vote);
    $insert_vote->execute();

    /* Get the vid (to use as the post id) */
    $vidQuery = "SELECT MAX(id) FROM Votes";
    $getVid = $mysqli->prepare($vidQuery);
    $getVid->execute();
    $getVid->store_result();
    $getVid->bind_result($vid);
    $getVid->fetch();

    if ($insert_query = $mysqli->prepare("INSERT INTO Posts (id, title, uid, vid, category, content, thumbnailLink, time) VALUES (".$vid.", '".$title."', ".$uid.", ".$vid.", '".$category."', '".$content."', '".$thumbnailLink."', ".$time.")")) {
        // Execute the prepared query.
        if (!$insert_query->execute()) {
            header('HTTP/1.1 500 Server Error Inserting Post');
            header('Content-type: application/json');
            print(json_encode(false));
            exit();
        }
        header('Content-type: application/json');
        print(json_encode(true));
        exit();
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-type: application/json');
        print(json_encode(false));
    }
} else {
    header('HTTP/1.1 500 Invalid POST data');
    header('Content-type: application/json');
    print(json_encode(false));
}