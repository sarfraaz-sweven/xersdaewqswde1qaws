$('#login_form').submit(function(e){
  e.preventDefault();
  $.ajax({
    url:'/login',
    method:'post',
    data:$(this).serialize(),
    success:function(data){
      window.location.replace("/users/me");
      $('#alert').hide();
    },
    error:function(err){
      var er = JSON.parse(err.responseText);
      $('#alert').find('p').text(er.error);
      $('#alert').show();
    }
  })
});

$('#signup_form').submit(function(e){
  e.preventDefault();
  var form = this;
  if($('input[name="password"]').val() == $('input[name="confirm_password"]').val())
  {
    $.ajax({
      url:'/signin',
      method:'post',
      data:$(form).serialize(),
      success:function(token){
        $('#alert').hide();
        $(form).hide();
        $('#token').val(token)
        $('#otp_form').show();
      },
      error:function(err){
        var er = JSON.parse(err.responseText);
        $('#alert').find('p').text(er.error);
        $('#alert').show();
      }
    });
  }
  else{
    $('#alert').find('p').text("Passwords not matching!");
    $('#alert').show();
  }
});

$('#otp_form').submit(function(e){
  e.preventDefault();
  $.ajax({
    url:'/verify_otp',
    method:'post',
    data:$(this).serialize(),
    success:function(data){
      window.location.replace("/users/me");
      $('#alert').hide();
    },
    error:function(err){
      var er = JSON.parse(err.responseText);
      $('#alert').find('p').text(er.error);
      $('#alert').show();
    }
  })
});


$('#logout').on('click',function(e){
  e.preventDefault();
  $.ajax({
    url:"/logout",
    method:"delete",
    success:()=>{
      console.log('wohoooo');
      $('#alert').hide();
      window.location.replace("/");
    },
    error:()=>{
      console.log("Error Logging out");
    }
  });
});
