var regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

$('#login_form').submit(function(e){
  e.preventDefault();
  console.log("Login hit");
  if(($(this).find('input[name="email"]').val().trim() == "") || regEmail.test($(this).find('input[name="email"]').val().trim()) == false )
  {
    $('#alert').find('span.error').text("Please Enter Valid Email Address");
    $('#alert').show();
  }
  else if($(this).find('input[name="password"]').val().trim() == "" || $(this).find('input[name="password"]').val().trim().length < 6)
  {
    $('#alert').find('span.error').text("Password must be at least 6 chars long");
    $('#alert').show();
  }
  else
  {
    $.ajax({
      url:'/login',
      method:'post',
      data:$(this).serialize(),
      success:function(data){
        console.log('Data',data);
        if(data.status == 1)
        {
          window.location.replace("/");
          $('#alert').hide();
        }
        else
        {
          $('#alert').find('span.error').text(data.error);
          $('#alert').show();
        }
      },
      error:function(err){
        var er = JSON.parse(err.responseText);
        $('#alert').find('span').text(er.error);
        $('#alert').show();
      }
    })
  }

});

$("#alert").find("button.close").on('click',function(){
  $('#alert').hide();
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
  console.log("Damn");
  e.preventDefault();
  var form = this;
  if($(this).find('input[name="name"]').val().trim().length < 1)
  {
    $('#alert').find('span.error').text("Please Enter Valid Name");
    $('#alert').show();
  }
  else if(($(this).find('input[name="email"]').val().trim() == "") || regEmail.test($(this).find('input[name="email"]').val().trim()) == false )
  {
    $('#alert').find('span.error').text("Please Enter Valid Email Address");
    $('#alert').show();
  }
  else if($(this).find('input[name="password"]').val().trim() == "" || $(this).find('input[name="password"]').val().trim().length < 6)
  {
    $('#alert').find('span.error').text("Password must be at least 6 chars long");
    $('#alert').show();
  }
  else if($('input[name="password"]').val().trim() != $('input[name="confirm_password"]').val().trim())
  {
    $('#alert').find('span.error').text("Both Passwords must match");
    $('#alert').show();
  }
  else{
    $.ajax({
      url:'/signin',
      method:'post',
      data:$(form).serialize(),
      success:function(data){
        console.log(JSON.stringify(data));
        if(data.status == 1)
        {
          $('#alert').hide();
          $(form).hide();
          $('#token').val(data.token)
          $('#otp_form').show();
        }
        else
        {
          $('#alert').find('span.error').text(data.error);
          $('#alert').show();
        }
      },
      error:function(err){
        var er = JSON.parse(err.responseText);
        $('#alert').find('span.error').text(er.error);
        $('#alert').show();
      }
    });
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
      window.location.replace("/");
      $('#alert').hide();
    },
    error:function(err){
      var er = JSON.parse(err.responseText);
      $('#alert').find('span.error').text(er.error);
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
