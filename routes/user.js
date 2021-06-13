const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const User = require('../models/User');
const Film = require('../models/Film');
const Cinema = require('../models/Cinema');
const Cineplex = require('../models/Cineplex');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

const sendEmail = require('../models/email.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var formidable = require('formidable');
const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey: 'fe072a5f',
    apiSecret: 'id5zkHyT3AOaJEWh',
});

const router = new Router();

const ensureLoggedIn = require('../middlewares/ensure_logged_in');
router.use(ensureLoggedIn);


// router.get('/logout', function (req, res) {
//     if (req.session.user_Id) {
//         delete req.session.user_Id;
//     } else if (req.session.Admin) {
//         delete req.session.Admin;
//     }
//     res.redirect('/');
// });


// [GET] /user/mua-ve/id
router.get('/mua-ve/:id', async function (req, res) {
    const showtimeID = Number(req.params.id);
    const user = req.currentUser;


    if (user.user_Email != "admin@gmail.com") {
        const showtime = await Showtime.findOne({
            where: {
                showtime_ID: showtimeID,
            },
            include: [
                { model: Cinema, include: [{ model: Cineplex },] },
                { model: Film },
            ]
        });

        const allBookings = await Booking.findAll({
            where: {
                booking_Showtime: showtimeID,
            },
            include: [
                { model: Showtime },
            ],
        });

        var bookedSeats = "";
        var tickets;

        for (var i = 0; i < allBookings.length; i++) {
            tickets = await Booking.findAll({ where: { ticket_Booking: allBookings[i].booking_ID } });
            for (var j = 0; j < tickets.length; j++) {
                bookedSeats += tickets[j].ticket_Seat + ", ";
            }
        }

        res.render('users/booking', { showtime, bookedSeats });
        // res.send({ showtime, allBookings, bookedSeats });
    } else {
        res.redirect('back');
    }
});


// [POST] /user/mua-ve/thong-tin-ve/id
router.post('/mua-ve/thong-tin-ve/:id', async function (req, res) {
    const showtimeID = Number(req.params.id);
    var { txtChair, txtTotalMoney } = req.body;
    var user = req.currentUser;

    var currentShowtime = await Showtime.findOne({
        where: { showtime_ID: showtimeID, },
        include: [
            { model: Film },
            { model: Cinema, include: [{ model: Cineplex },] },
        ],
    })

    // FORMAT TIỀN
    var totalPrice = new Intl.NumberFormat(
        'ja-JP', { style: 'currency', currency: 'VND' }).format(txtTotalMoney);
    // res.send(totalPrice);
    // THÊM SỐ 0 ĐẰNG TRƯỚC SỐ < 10
    function addZero(number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }

    // /* Định dạng ngày/tháng/năm */
    function format_date(originalDate) {
        var day = new Date(originalDate);
        var day_result = "";
        day_result += addZero(day.getDate());
        day_result += "/";
        day_result += addZero(day.getMonth() + 1);
        day_result += "/";
        day_result += day.getFullYear();

        return day_result;
    }

    /* Xóa dấu tiếng việt */
    function xoa_dau(str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    }

    // Tạo code ngẫu nhiên cho Booking_ID
    var bookingCode = "B";
    bookingCode += addZero(currentShowtime.Cinema.Cineplex.cineplex_ID);
    bookingCode += addZero(currentShowtime.Cinema.cinema_ID);
    bookingCode += addZero(currentShowtime.showtime_Film);
    bookingCode += addZero(user.user_ID);
    bookingCode += String(Date.now());

    const today = new Date();
    var bookingTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var bookingDate = format_date(today);

    // TẠO ĐẶT CHỖ VÀ GỬI MAIL
    await Booking.create({
        booking_ID: bookingCode,
        booking_User: user.user_ID,
        booking_Showtime: showtimeID,
        booking_Date: today,
        booking_Time: bookingTime,
        booking_TotalPrice: Number(txtTotalMoney),
    }).then(async function (booking) {
        const showtimeDate = format_date(currentShowtime.showtime_Date);

        console.log("Đã lưu vào DB");
        // req.session.user_Id = user.user_Id;
        const info = await sendEmail(user.user_Email,
            'MỘT CHÚT PHIM - [THÔNG TIN ĐẶT VÉ]',
            'Content',
            '<div style="text-align:center">' + bookingCode + '</div>' + '\n<h1>' + xoa_dau(currentShowtime.Film.film_Name) + '</h1>\n' + showtimeDate + '   ' + currentShowtime.showtime_Begin + '\n' + currentShowtime.Cinema.cinema_Name + ' - ' + currentShowtime.Cinema.Cineplex.cineplex_Name + '\nGhế: ' + txtChair + '\nTổng tiền: ' + String(totalPrice) + '\n\nMỘT CHÚT PHIM xin chân thành cảm ơn bạn đã tin tưởng lựa chọn chúng tôi! Chúc bạn có khoảng thời gian xem phim vui vẻ.');

        // var number_phone_user = await User.findOne({
        //     where: {
        //         user_ID: user.user_Id,
        //     }
        // })
        // var str_nb_user = new String(number_phone_user.user_NumberPhone);
        // var nb_user = "84" + str_nb_user.slice(1, str_nb_user.length);
        // console.log(nb_user);
        // const sms_from = 'VNCinema';
        // const sms_to = nb_user;
        // const sms_content = "Ban da dat ve thanh cong!\nMa ve: " + bookingCode + "\nPhim: " + xoa_dau(currentShowtime.Film.film_Name) + "\nNgay chieu: " + format_date(currentShowtime.showtime_Date) + "\nCum rap/Rap: " + xoa_dau(currentShowtime.Cinema.Cineplex.cineplex_Name) + " / " + xoa_dau(currentShowtime.Cinema.cinema_Name) + "\nLoai ghe: " + xoa_dau(txtChairType) + "\nGhe: " + txtChair + "\nGia ve: " + format_number(txtTotalMoney, 0) + " ₫\nVNCinema Xin Cam On!\n";

        /*nexmo.message.sendSms(sms_from, sms_to, sms_content);*/


        res.render('users/booking_info', { currentShowtime, showtimeDate, booking, bookingDate, txtChair, totalPrice });

    }).catch(console.error);

});


router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

module.exports = router;

