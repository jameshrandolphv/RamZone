<?php
/* Connect to our DB */
include_once("connect-to-db.php");

session_start();

if (isset($_SESSION['user_id'], $_SESSION['username'], $_COOKIE['auth'])) {
    $user_id = $_SESSION['user_id'];
    $auth = $_COOKIE['auth'];
    $username = $_SESSION['username'];
    // Get the user-agent string of the user.
    $user_browser = $_SERVER['HTTP_USER_AGENT'];
    if ($query = $mysqli->prepare("SELECT U.password
                  FROM Users U
                  WHERE U.id = ? LIMIT 1")) {
        // Bind "$user_id" to parameter.
        $query->bind_param('i', $user_id);
        $query->execute();   // Execute the prepared query.
        $query->store_result();
        if ($query->num_rows == 1) {
            // If the user exists get variables from result.
            $query->bind_result($password);
            $query->fetch();
            $auth_check = hash('sha512', $password . $user_browser);
            if ($auth_check == $auth) {
                header('Content-type: application/json');
                $json_obj = array('username' => $username, 'uid' => $user_id);
                print(json_encode($json_obj));
            } else {
                header('HTTP/1.1 401 Unauthorized - 1');
                header('Content-type: application/json');
                print(json_encode(false));
            }
        } else {
            header('HTTP/1.1 401 Unauthorized - 2');
            header('Content-type: application/json');
            print(json_encode(false));
        }
    } else {
        header('HTTP/1.1 401 Unauthorized - 3');
        header('Content-type: application/json');
        print(json_encode(false));
    }
} else {
    header('HTTP/1.1 401 Unauthorized - 4');
    header('Content-type: application/json');
    print(json_encode(false));
}
