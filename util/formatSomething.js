

module.exports.format_date = function (originalDate) {
    var day = new Date(originalDate);
    var day_result = "";
    day_result += addZero(day.getDate());
    day_result += "/";
    day_result += addZero(day.getMonth() + 1);
    day_result += "/";
    day_result += day.getFullYear();

    return day_result;
}

module.exports.format_time = function (originalTime) {
    const timeStr = String(originalTime);
    var hour = timeStr.substr(0, 2);
    var minute = timeStr.substr(3, 2)
    var second = timeStr.substr(6, 2)
    var time_result = "";
    time_result = hour + ":" + minute + ":" + second;
    return time_result;
}
