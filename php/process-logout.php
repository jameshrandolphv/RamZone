<?php
session_start();
 
/* Clear all session variables */
$_SESSION = array();
unset($_SESSION["user_id"]);
unset($_SESSION["username"]);
unset($_SESSION["auth"]);
 
// Delete the actual cookies.
unset($_COOKIE[session_name()]);
setcookie(session_name(),'', time() - 42000);
unset($_COOKIE["auth"]);
setcookie("auth",'', time() - 42000);
 
/* Destroy the session and relocate to the homepage */
session_destroy();
header('Content-type: application/json');
print(json_encode(true));
