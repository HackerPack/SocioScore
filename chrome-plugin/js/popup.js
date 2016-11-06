var isRegistered = false;
var userDetails = {};

$(document).ready(function() {

  isRegistered = localStorage.getItem("hoya-hacks-userdetails") != null;
  if (isRegistered) {
    userDetails = $.parseJSON(localStorage.getItem("hoya-hacks-userdetails"));
    $("#popup_report").show();
    $("#popup_register").hide();
  }

  $("#registerButton").on("click", function() {
    var name = $("#register_name").val();
    var email = $("#phone").val();
    var phone = $("#email").val();
    var twitter = $("#twitter").val();
    var gender = $('input:radio[name=gender]:checked').val();
    api.registerNewUser(name, email, phone, twitter, gender, function(data) {
      if (data.success) {
        $("#register_name").val('');
        $("#phone").val('');
        $("#email").val('');
        $("#twitter").val('');
        userDetails = {'name' : name, 'email' : email, 'phone' : phone, 'twitter' : twitter, 'gender' : gender};
        localStorage.setItem("hoya-hacks-userdetails", JSON.stringify(userDetails));
        alert('New user registered successfully');
        $("#popup_report").show();
        $("#popup_register").hide();
      }
    });
  });

  $("#reportButton").on("click", function() {
    var email = $("#rep_phone").val();
    var phone = $("#rep_emailid").val();
    var twitter = $("#rep_twitter").val();
    var description = $("#rep_description").val();
    var gender = userDetails.gender;

    var contnt = "";
    if (email.length > 0) contnt = email;
    if (phone.length > 0) contnt = phone;
    if (twitter.length > 0) contnt = twitter;

    api.reportHarassment(userDetails.twitter, contnt, gender, description, function(data) {
      if (data.success) {
        alert('Harassment reported successfully');
      }
    });
  });
});
