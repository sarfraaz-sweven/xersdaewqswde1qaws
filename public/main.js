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

$('#login_form_admin').submit(function(e){
  e.preventDefault();
  $.ajax({
    url:'/admin/login',
    method:'post',
    data:$(this).serialize(),
    success:function(data){
      window.location.replace("/admin");
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


$('#signup_form_admin').submit(function(e){
  e.preventDefault();
  var form = this;
  if($('input[name="password"]').val() == $('input[name="confirm_password"]').val())
  {
    $.ajax({
      url:'/admin/signin',
      method:'post',
      data:$(form).serialize(),
      success:function(data){
        $('#alert').hide();
        window.location.replace("/admin");
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

$('#logout_admin').on('click',function(e){
  e.preventDefault();
  $.ajax({
    url:"/admin/logout",
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

$('.activate').bind('click',function(e){
  e.preventDefault();
  var me = this;

  var id=$(me).attr('data-id');
  var active=true;

  $.ajax({
    url:"/admin/users/changeState",
    method:"patch",
    data:{'id':id,'active':active},
    success:()=>{
      $(me).removeClass('activate');
      $(me).addClass('deactivate');
      $(me).html("Deactivate");
    },
    error:()=>{
      console.log("Activation error!!");
    }
  });
});

$('.deactivate').bind('click',function(e){
  e.preventDefault();
  var me = this;

  var id=$(me).attr('data-id');
  var active=false;

  $.ajax({
    url:"/admin/users/changeState",
    method:"patch",
    data:{'id':id,'active':active},
    success:()=>{
      $(me).removeClass('deactivate');
      $(me).addClass('activate');
      $(me).html("Activate");
    },
    error:()=>{
      console.log("Deactivation error!!");
    }
  });
});

$('#forgot_pass_form').submit(function(e){
  e.preventDefault();
  var form = this;
  $.ajax({
    url:'/generate_reset_password',
    method:'post',
    data:$(form).serialize(),
    success:function(data){
      $('#alert').hide();
      $('#success').find('p').text('Password reset link has been sent to your email address, click on the link there to change your password!');
      $('#success').show();
      $(form).hide();
      console.log(data);
    },
    error:function(err){
      var er = JSON.parse(err.responseText);
      $('#success').hide();
      $('#alert').find('p').text(er.error);
      $('#alert').show();
    }
  })
});

$('#reset_pass_form').submit(function(e){
  e.preventDefault();
  var form = this;
  if($('input[name="password"]').val() == $('input[name="confirm_password"]').val())
  {
    $.ajax({
      url:'/change_password_after_reset',
      method:'patch',
      data:$(form).serialize(),
      success:function(data){
        $('#alert').hide();
        $('#success').find('p').text('Password changed successfully! Login to continue.');
        $('#success').show();
        $(form).hide();
        console.log(data);
      },
      error:function(err){
        var er = JSON.parse(err.responseText);
        $('#success').hide();
        $('#alert').find('p').text(er.error);
        $('#alert').show();
      }
    });
  }
  else {
    $('#alert').find('p').text("Passwords not matching!");
    $('#alert').show();
  }
});
