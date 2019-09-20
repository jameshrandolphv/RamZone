<?php
/* Connect to our DB */
include_once("connect-to-db.php");

function login($username, $password, $mysqli) {
    // Using prepared statements means that SQL injection is not possible.
    if ($query = $mysqli->prepare("SELECT U.id, U.username, U.email, U.password, U.salt FROM Users U WHERE U.username = ? LIMIT 1")) {
        $query->bind_param("s", $username);
        $query->execute();
        $query->store_result();

        // get variables from result.
        $query->bind_result($user_id, $username, $db_email, $db_password, $salt);
        $query->fetch();

        // hash the password with the unique salt.
        $password = hash('sha512', $password . $salt);
        if ($query->num_rows == 1) {

            // Check if the password in the database matches
            // the password the user submitted.
            if ($db_password == $password) {
                // Password is correct!
                // Get the user-agent string of the user.
                $user_browser = $_SERVER['HTTP_USER_AGENT'];
                // XSS protection as we might print this value
                $user_id = preg_replace("/[^0-9]+/", "", $user_id);
                $_SESSION['user_id'] = $user_id;
                // XSS protection as we might print this value
                $username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
                $_SESSION['username'] = $username;

                $auth = hash('sha512', $password . $user_browser);

                setcookie('auth', $auth, time()+3600, '/', 'wwwp.cs.unc.edu', true);
                 //$_SESSION['auth'] = hash('sha512', $password . $user_browser);
                // Login successful.
                return true;
            } else {
                // Password is not correct
                header('HTTP/1.1 401 Unauthorized-Another one');
                header('Content-type: application/json');
                print(json_encode(false));
            }

        } else {
            // No user exists.
            header('HTTP/1.1 401 Unauthorized');
            header('Content-type: application/json');
            print(json_encode(false));
        }
    } else {
        // Could not create a prepared statement
        header('HTTP/1.1 401 Unauthorized');
        header('Content-type: application/json');
        print(json_encode(false));
    }
}

/* Start the session */
session_start();

if (isset($_POST["username"], $_POST["password"])) {
    $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_STRING);
    $password = $_POST["password"]; // The hashed password.

    if (login($username, $password, $mysqli) == true) {
        header('Content-type: application/json');
        $json_obj = array('username' => $username);
        print(json_encode($json_obj));
    } else {
        unset($_SESSION['user_id']);
        unset($_SESSION['username']);

        header('HTTP/1.1 401 Unauthorized');
        header('Content-type: application/json');
        print(json_encode(false));
    }
} else {
    header('HTTP/1.1 401 Unauthorized');
    header('Content-type: application/json');
    print(json_encode(false));
}
