function CheckSubmit() {
    var email = document.getElementById("user_Email");
    if (email.value == "")
    {
        alert("Yêu cầu nhập email!");
        email.focus();
        return false;
    }

    var name = document.getElementById("user_Name");
    if (name.value == "")
    {
        alert("Yêu cầu nhập tên!");
        name.focus();
        return false;
    }

    var numberPhone= document.getElementById("user_NumberPhone");
    if (numberPhone.value == "")
    {
        alert("Yêu cầu nhập số điện thoại!");
        numberPhone.focus();
        return false;
    }
    
    var password = document.getElementById("user_Password");
    if (password.value == "")
    {
        alert("Yêu cầu nhập mật khẩu!");
        password.focus();
        return false;
    }

    var confirm_password = document.getElementById("user_ConfirmPassword");
    if (confirm_password.value == "")
    {
        alert("Yêu cầu nhập kiểm tra mật khẩu!");
        confirm_password.focus();
        return false;
    }


    if (password.value != confirm_password.value)
    {
        alert("Mật khẩu và mật khẩu nhập lại phải giống nhau ");
        confirm_password.focus();
        password.focus();
        return false;
    }
    return true;
}
