<?php

/* Connect to the db */
include_once("connect-to-db.php");

/* If a username, email, and hashed password have been posted */
if (isset($_POST["username"], $_POST["email"], $_POST["password"])) {

    /* Sanitize the username entered */
    $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_STRING);

    /* Sanitize and validate the email */
    $email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
    $email = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_msg .= "<p class='error'>The email address you entered is not valid</p>";
    }

    /* Sanitize the password string and make sure it is 128 chars long */
    $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_STRING);
    if (strlen($password) != 128) {
        /* Hashed password should be 128 chars long */
        $error_msg .= '<p class="error">Invalid password configuration.</p>';
    }

    $possibleDuplicateEmail = "SELECT U.id FROM Users U WHERE U.email = ? LIMIT 1";
    $query = $mysqli->prepare($possibleDuplicateEmail);
    
    if ($query) {
        /* Binds the email to the (string) parameter in the query */
        $query->bind_param("s", $email);
        $query->execute();
        $query->store_result();
        
        /* If there was already a user with this email */
        if ($query->num_rows == 1) {
            $error_msg .= "<p class='error'>A user with this email address already exists.</p>";
        }
    } else {
        $error_msg .= '<p class="error">Database error</p>';
    }

    $possibleDuplicateUsername = "SELECT U.id FROM Users U WHERE U.username = ? LIMIT 1";
    $query2 = $mysqli->prepare($possibleDuplicateUsername);
    
    if ($query2) {
        /* Binds the username to the (string) parameter in the query */
        $query2->bind_param("s", $username);
        $query2->execute();
        $query2->store_result();
        
        /* If there was already a member with this username */
        if ($query2->num_rows == 1) {
            $error_msg .= "<p class='error'>This username already exists.</p>";
        }
    } else {
        $error_msg .= '<p class="error">Database error</p>';
    }

    if (empty($error_msg)) {
        /* Random Salt */
        $random_salt = hash('sha512', uniqid(openssl_random_pseudo_bytes(16), TRUE));
        /* Salt the password provided as a POST parameter with the random salt */
        $password = hash('sha512', $password . $random_salt);

        /* Everything checks out, so insert the user into the db */
        if ($insert_query = $mysqli->prepare("INSERT INTO Users (username, email, password, salt) VALUES (?, ?, ?, ?)")) {
            $insert_query->bind_param("ssss", $username, $email, $password, $random_salt);
            // Execute the prepared query.
            if (!$insert_query->execute()) {
                header('HTTP/1.1 401 Unauthorized');
                header('Content-type: application/json');
                print(json_encode(false));
                exit();
            }
        }
        header('Content-type: application/json');
        print(json_encode(true));
        exit();
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-type: application/json');
        print(json_encode(false));
    }
}