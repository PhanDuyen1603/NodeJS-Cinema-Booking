const Router = require('express').Router;
const router = new Router();
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// MODELS
const User = require('../models/User');
const Film = require('../models/Film');
const Cinema = require('../models/Cinema');
const Cineplex = require('../models/Cineplex');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

const sendEmail = require('../models/email.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var formidable = require('formidable');
const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey: 'fe072a5f',
    apiSecret: 'id5zkHyT3AOaJEWh',
});


// UTIL
const format = require('../util/formatSomething');


//MIDDLEWARE KIỂM TRA TÌNH TRẠNG ĐĂNG NHẬP CỦA USER
const ensureLoggedIn = require('../middlewares/ensure_logged_in');
router.use(ensureLoggedIn);

// [GET] /user/thong-tin-ca-nhan
router.get('/thong-tin-ca-nhan', async function (req, res) {

    const user = req.currentUser;

    var totalMoneyOfUser = await Booking.sum('booking_TotalPrice', {
        where: {
            booking_User: user.user_ID
        }
    });

    var allBookings = await Booking.findAll({
        where: {
            booking_User: user.user_ID,
        },
        include: [
            {
                model: Showtime,
                include: [
                    { model: Film },
                    {
                        model: Cinema, include: [{ model: Cineplex },]
                    }]
            },
        ]
    }).catch(console.error);

    res.render('users/profile', { allBookings, totalMoneyOfUser });
});

// [GET] /user/thong-tin-ca-nhan/cap-nhat/so-dien-thoai
router.post('/thong-tin-ca-nhan/cap-nhat/so-dien-thoai', async function (req, res) {
    var { userPhoneNumber } = req.body;
    const user = req.currentUser;

    await User.update({
        user_NumberPhone: userPhoneNumber,
    }, {
        where: { user_ID: user.user_ID, }
    });

    res.redirect('back');
});

// [GET] /user/thong-tin-ca-nhan/cap-nhat/mat-khau
router.post('/thong-tin-ca-nhan/cap-nhat/mat-khau', async function (req, res) {
    const user = req.currentUser;
    var { userPassword } = req.body;
    const hash_pass = await bcrypt.hash(userPassword, saltRounds);
    await User.update({
        user_Password: hash_pass,
    }, {
        where: { user_ID: user.user_ID, },
    });

    res.redirect('back');
});

// [GET] /user/thong-tin-ca-nhan/cap-nhat/dia-chi
router.post('/thong-tin-ca-nhan/cap-nhat/dia-chi', async function (req, res) {
    const user = req.currentUser;
    var { userAddress } = req.body;
    await User.update({
        user_Address: userAddress,
    }, {
        where: { user_ID: user.user_ID, },
    });

    res.redirect('back');
});

// [GET] /user/thong-tin-ca-nhan/cap-nhat/ten
router.post('/thong-tin-ca-nhan/cap-nhat/ten', async function (req, res) {
    const user = req.currentUser;
    var { userName } = req.body;
    await User.update({
        user_Name: userName,
    }, {
        where: { user_ID: user.user_ID, },
    });

    res.redirect('back');
});

// ĐẶT VÉ

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

        //LẤY TẤT CẢ GHẾ ĐÃ ĐẶT CỦA SUẤT CHIẾU NÀY 
        const allBookings = await Booking.findAll({
            where: {
                booking_Showtime: showtimeID,
            },
        });
        var bookedSeats = "";
        if (allBookings) {
            for (var i = 0; i < allBookings.length; i++) {
                bookedSeats += allBookings[i].booking_Seat + ", ";
            }
        }
        res.render('users/booking', { showtime, bookedSeats });
        // res.send({ showtime, allBookings, bookedSeats });
    } else {
        res.redirect('back');
    }
});

// USER XEM LẠI VÉ ĐÃ ĐẶT
// [GET] / user / thong - tin - ve / id
router.get('/thong-tin-ve/:id', async function (req, res) {
    const id = req.params.id;
    const booking = await Booking.findByPk(id);
    const currentShowtime = await Showtime.findOne({
        where: { showtime_ID: booking.booking_Showtime, },
        include: [
            { model: Film },
            { model: Cinema, include: [{ model: Cineplex },] },
        ],
    })

    function addZero(number) {
        if (number < 10) {
            return "0" + number;
        }
        return number;
    }

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

    const showtimeDate = format_date(currentShowtime.showtime_Date);
    const bookingDate = format_date(booking.booking_Date);
    const backToUser = 'abc';

    var totalPrice = new Intl.NumberFormat(
        'ja-JP', { style: 'currency', currency: 'VND' }).format(booking.booking_TotalPrice);
    res.render('users/booking_info', { currentShowtime, showtimeDate, booking, bookingDate, totalPrice, backToUser });

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
    // function xoa_dau(str) {
    //     str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    //     str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    //     str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    //     str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    //     str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    //     str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    //     str = str.replace(/đ/g, "d");
    //     str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    //     str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    //     str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    //     str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    //     str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    //     str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    //     str = str.replace(/Đ/g, "D");
    //     return str;
    // }

    // Tạo code ngẫu nhiên cho Booking_ID
    var bookingCode = "B";
    bookingCode += addZero(currentShowtime.Cinema.Cineplex.cineplex_ID);
    bookingCode += addZero(currentShowtime.Cinema.cinema_ID);
    bookingCode += addZero(currentShowtime.showtime_Film);
    bookingCode += addZero(user.user_ID);
    bookingCode += String(Date.now());
    // B 02 11 31 10 1623539255446
    var ticketCode = "T";
    ticketCode += String(Date.now());
    ticketCode += bookingCode.substring(0, bookingCode.length - 13);

    var allSeatsArray = txtChair.split(', ');


    // res.send({ bookingCode, ticketCode, allSeatsArray });

    const today = new Date();
    var bookingTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var bookingDate = format_date(today);

    // TẠO ĐẶT CHỖ VÀ GỬI MAIL
    await Booking.create({
        booking_ID: bookingCode,
        booking_User: user.user_ID,
        booking_Showtime: showtimeID,
        booking_Seat: txtChair,
        booking_Date: today,
        booking_Time: bookingTime,
        booking_TotalPrice: Number(txtTotalMoney),
    }).then(async function (booking) {
        for (var i = 0; i < allSeatsArray.length; i++) {
            ticketCode += String(i + 1);
            await Ticket.create({
                ticket_ID: ticketCode,
                ticket_Booking: bookingCode,
                ticket_Seat: allSeatsArray[i],
                ticket_Price: currentShowtime.showtime_Price,
            });
        }

        const showtimeDate = format_date(currentShowtime.showtime_Date);

        console.log("Đã lưu vào DB");
        // req.session.user_Id = user.user_Id;
        const info = await sendEmail(user.user_Email,
            'MỘT CHÚT PHIM - [THÔNG TIN ĐẶT VÉ]',
            'Content',
            '<div style="text-align:center">' + bookingCode + '</div>' + '\n<h1>' + currentShowtime.Film.film_Name + '</h1>\n' + showtimeDate + '   ' + currentShowtime.showtime_Begin + '\n' + currentShowtime.Cinema.cinema_Name + ' - ' + currentShowtime.Cinema.Cineplex.cineplex_Name + '\nGhế: ' + txtChair + '\nTổng tiền: ' + String(totalPrice) + '\n\nMỘT CHÚT PHIM xin chân thành cảm ơn bạn đã tin tưởng lựa chọn chúng tôi! Chúc bạn có khoảng thời gian xem phim vui vẻ.');


        res.render('users/booking_info', { currentShowtime, showtimeDate, booking, bookingDate, totalPrice });

    }).catch(console.error);

});



router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

module.exports = router;

