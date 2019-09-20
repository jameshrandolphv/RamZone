<?php
require_once("postClass.php");

$path_components = explode('/', $_SERVER['PATH_INFO']);

if ($_SERVER['REQUEST_METHOD'] == "GET") {
  header("Content-type: application/json");
  print(json_encode(Post::getAll()));
  exit();

} else if ($_SERVER['REQUEST_METHOD'] == "POST") {
//******************** Should try to validate posts or make sure bad ones cannot be submitted

//If it is of type newPost then Insert it!
  if (trim($_REQUEST['type'])=="newPost") {
      $title=trim($_REQUEST['title']);
      $user=trim($_REQUEST['user']);
      $category=trim($_REQUEST['category']);
      $content=trim($_REQUEST['content']);
      $thumbnailLink=trim($_REQUEST['thumbnailLink']);

      //create timestamp
      $time=date("Y-m-d h:i:s");

      Post::create($user,$time,$content,$category,$title,$thumbnailLink);

      header("Content-type: application/json");
      print(json_encode(true));
      exit();
    }
}

// If here, none of the above applied and URL could
// not be interpreted with respect to RESTful conventions.

header("HTTP/1.0 400 Bad Request");
print("Did not understand URL");

?>
