$(function(){
  var whitelist = [];
  var loggedIn = false;
  var prefix = "http://localhost:3000";
  var currentUser = null;

  function changeViews(user){
    console.log(user);
    if(!user){
      //not logged in
      console.log("not logged in");
      $("#signup #email, #signup #password, #signup #confirm").val("");
      $("#login #email, #login #password").val("");
      $("#login .error, #register .error").text("");
      $("#signup, #login").show();
      $("#whitelist").hide();
    } else {
      $("#whitelist").show();
      $("#signup, #login").hide();
    }
  }

  changeViews(currentUser);


  //signout
  $("#whitelist #signout").click(function(){
    $.ajax({
        url : prefix + '/sign_out',
        type: 'POST',
        dataType : "json",
        success: function(data){
          currentUser = null;
          changeViews(currentUser);
          console.log("Signed out");
        },
        error: function(err){
          if(err.responseText == "Signed out successfully"){
            currentUser = null;
            changeViews(currentUser);
            console.log("Signed out");
          } else {
            alert("An error occurred! Check console");
            console.log(err);
          }
        }

      })
  })


  //get request on current white list here

  $("#whitelist .mark").click(function(){
    var site = prompt("Enter your site");
    if(site != ""){
      whitelist.push(site);
      //do a post request to the server
    }

  })

  $("#whitelist .unmark").click(function(){
    //remove this site
  })


  var same = false;
  $("#signup #password, #signup #confirm").keyup(function(){
    same = $("#signup #password").val() == $("#signup #confirm").val();
    if(!same){
      $("#signup .error").text("Passwords do not match!");
    } else {
      $("#signup .error").text("");
    }

  })

  $("#signup #register").click(function(){
    var email = $("#signup #email").val();
    var password = $("#signup #password").val();

    if(same && email.length != 0 && password.length != 0){
      //send to server
      $.ajax({
          url : prefix + '/sign_up',
          type: 'POST',
          dataType : "json",
          headers: {
            "user": email,
            "password": password
          },
          success: function(data){
            currentUser = {
              user: data.user,
              authkey: data.authkey
            }
            changeViews(currentUser);
            console.log(currentUser);
          },
          error: function(err){
            var msg = err.responseText;
            console.log(msg);
            if(msg == "auth/email-already-in-use"){
              $("#signup .error").text("This email is already taken");
            } else if(msg == "auth/invalid-email"){
              $("#signup .error").text("Invalid email");
            } else if(msg == "auth/weak-password"){
              $("#signup .error").text("Password must be at least 6 alpha-numeric characters long");
            } else {
              $("#signup .error").text("Some other error occurred");
            }
          }

        })
    } else {
      $("#signup .error").text("Either the password you entered is empty or passwords don't match");

    }
  })




  $("#login #login_bt").click(function(){
    var loginEmail = $("#login #email").val();
    var loginPwd = $("#login #password").val();

    console.log(loginEmail + " " + loginPwd);

    if(loginEmail.length == 0 || loginPwd.length == 0){
      $("#login .error").text("Please complete all fields!");
    } else {
      $.ajax({
          url : prefix + '/login',
          type: 'POST',
          dataType : "json",
          headers: {
            "user": loginEmail,
            "password": loginPwd
          },
          success: function(authkey){
            currentUser = {
              user: loginEmail,
              authkey: authkey
            }
            changeViews(currentUser);
            console.log(currentUser);
          },
          error: function(err){
            var msg = err.responseText;
            console.log(msg);
            if(msg == "auth/email-already-in-use"){
              $("#login .error").text("This email is already taken");
            } else if(msg == "auth/invalid-email"){
              $("#login .error").text("Invalid email");
            } else if(msg == "auth/weak-password"){
              $("#login .error").text("Password must be at least 6 alpha-numeric characters long");
            } else if(!msg.includes("/")){ //success case
              currentUser = {
                user: loginEmail,
                authkey: msg
              }
              changeViews(currentUser);
              console.log(currentUser);
            } else if(msg == "auth/wrong-password"){
              $("#login .error").text("The password you entered is wrong");
            } else {
              $("#login .error").text("Some other error occurred. Check console");
            }
          }

        })
    }


  })

})