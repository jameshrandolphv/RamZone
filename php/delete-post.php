<?php

/* Connect to the db */
include_once("connect-to-db.php");

session_start();

/* If a username, email, and hashed password have been posted */
if (isset($_POST["pid"])) {
    
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Not logged in');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }

    /* Sanitize and store the request variables */
    $uid = $_SESSION['user_id'];
    $pid = $_POST["pid"];

    $userCheck = "SELECT * FROM Posts P WHERE P.id = ".$pid." AND P.uid = ".$uid."";
    $query = $mysqli->prepare($userCheck);
    
    if ($query) {
        $query->execute();
        $query->store_result();
        
        /* If this post doesn't exist */
        if ($query->num_rows < 1) {
            header('HTTP/1.1 401 Unauthorized');
            header('Content-type: application/json');
            print(json_encode(false));
            exit();
        }
    } else {
        header('HTTP/1.1 500 Server Error Inserting Post');
        header('Content-type: application/json');
        print(json_encode(false));
        exit();
    }

    if ($delete_query = $mysqli->prepare("DELETE FROM Posts WHERE id=".$pid." AND uid=".$uid."")) {
        // Execute the prepared query.
        if (!$delete_query->execute()) {
            header('HTTP/1.1 500 Server Error Inserting Post');
            header('Content-type: application/json');
            print(json_encode(false));
            exit();
        }
        $delete_comments = $mysqli->prepare("DELETE FROM Comments WHERE pid=".$pid."");
        $delete_comments->execute();
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