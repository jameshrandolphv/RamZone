<?php

/* Connect to the db */
include_once("connect-to-db.php");

session_start();

/* If a username, email, and hashed password have been posted */
if (isset($_POST["pid"], $_POST["change"], $_POST["currentVote"])) {
    
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Not logged in');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }

    /* Sanitize and store the request variables */
    $pid = $_POST["pid"];
    $uid = $_SESSION['user_id'];
    $change = $_POST["change"];
    $currentVote = $_POST["currentVote"];

    /* See if a like already exists or create a new one */
    $like = "SELECT * FROM Likes WHERE uid=".$uid." AND vid=".$pid."";
    $getLike = $mysqli->prepare($like);
    $getLike->execute();
    $getLike->store_result();
    if ($getLike->num_rows < 1) {
        $insert = "INSERT INTO `Likes`(`uid`, `vid`, `vote`) VALUES (".$uid.",".$pid.",".$currentVote.")";
        $insertLike = $mysqli->prepare($insert);
        $insertLike->execute();
        $insertLike->store_result();
    } else {
        $update = "UPDATE `Likes` SET `vote`=".$currentVote." WHERE `uid`=".$uid." AND `vid`=".$pid."";
        $updateLike = $mysqli->prepare($update);
        $updateLike->execute();
        $updateLike->store_result();
    }

    $oldCountQuery = "SELECT count FROM Votes WHERE id=".$pid."";
    $fetchOldCount = $mysqli->prepare($oldCountQuery);
    $fetchOldCount->execute();
    $fetchOldCount->store_result();
    $fetchOldCount->bind_result($oldCount);
    $fetchOldCount->fetch();



    if ($insert_query = $mysqli->prepare("UPDATE `Votes` SET `count` = '".($change + $oldCount)."' WHERE `Votes`.`id` = ".$pid."")) {
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