$(document).ready(function() {
  $("div", "#popup_header").on('click', function(event) {
    var c = $($(event.target)[0]).html().trim();
    if (c == "Register") {
      $("#popup_report").hide();
      $("#popup_register").show();
    }
    else {
      $("#popup_report").show();
      $("#popup_register").hide();
    }
  });

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
        alert('New user registered successfully');
      }
    });
  });
});
