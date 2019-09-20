<?php

/* Connect to the db */
include_once("connect-to-db.php");

session_start();

if (isset($_POST["pid"], $_POST["content"], $_POST["time"], $_POST["username"])) {
    
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Not logged in');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }

    /* Sanitize and store the request variables */
    $pid = $_POST["pid"];
    $content = filter_input(INPUT_POST, "content", FILTER_SANITIZE_STRING);
    $time = $_POST["time"];
    $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_STRING);
    $uid = $_SESSION['user_id'];

    if ($insert_query = $mysqli->prepare("INSERT INTO Comments (pid, content, time, username, uid) VALUES (".$pid.", '".$content."', ".$time.", '".$username."', ".$uid.")")) {
        // Execute the prepared query.
        if (!$insert_query->execute()) {
            header('HTTP/1.1 500 Server Error Inserting Post');
            header('Content-type: application/json');
            print(json_encode(false));
            exit();
        }
        /* Get the comment id  */
        $commentQuery = "SELECT MAX(id) FROM Comments";
        $getCommentID = $mysqli->prepare($commentQuery);
        if (!$getCommentID->execute()) {
            header('HTTP/1.1 500 Server Error Inserting Post');
            header('Content-type: application/json');
            print(json_encode(false));
            exit();
        }
        $getCommentID->store_result();
        $getCommentID->bind_result($cid);
        $getCommentID->fetch();

        header('Content-type: application/json');
        $commentID = array("cid" => $cid);
        print(json_encode($commentID));
        exit();
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }
}
header('HTTP/1.1 500 Invalid POST data');
header('Content-type: application/json');
print(json_encode(false));
exit();