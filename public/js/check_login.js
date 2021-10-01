function CheckSubmit() {
    var user_email = document.getElementById("user_Email");
    if (user_email.value == "")
    {
        alert("Yêu cầu nhập tên đăng nhập!");
        username.focus();
        return false;
    }

    var user_password = document.getElementById("user_Password");
    if (user_password.value == "")
    {
        alert("Yêu cầu nhập mật khẩu!");
        password.focus();
        return false;
    }

    return true;
}
