<?php
/* Connect to our DB */
include_once("connect-to-db.php");
session_start();
$retrieveQuery = "SELECT *
                FROM Comments C";

$retrieveQuery1 = "SELECT C.id,C.pid,C.content,C.time,U.username,C.uid FROM Comments C, Users U where C.uid=U.id";
$retrieve = $mysqli->prepare($retrieveQuery1);
// $retrieve->bind_result($id, $title, $uid, $vid, $category, $content, $thumbnailLink, $time);
$retrieve->execute();
$result = $retrieve->get_result();
$comments = array();
while ($row = $result->fetch_array()) {
    $comment = array();
    foreach ($row as $r) {
        array_push($comment, $r);
    }
    array_push($comments, $comment);
}
header('Content-type: application/json');
print(json_encode($comments));
exit();
