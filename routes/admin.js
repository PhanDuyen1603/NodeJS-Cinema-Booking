const Router = require('express').Router;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');

//MODELS
const user = require('../models/User');
// const ticket = require('../models/Ticket');
const Cinema = require('../models/Cinema');
const Cineplex = require('../models/Cineplex');
const Film = require('../models/Film');
const Showtime = require('../models/Showtime')
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

//UPLOAD FILE
const { promisify } = require('util');
var multer = require('multer');
var upload = multer({ dest: './public/image/uploads/film/' })
const rename = promisify(require('fs').rename);

//REMOVE IMAGE FILE
// const unlinkAsync = promisify(fs.unlink)

const router = new Router();

const ensureLoggedInAdmin = require('../middlewares/ensure_logged_in_admin');
router.use(ensureLoggedInAdmin);

router.get('/', async function (req, res) {
    // THỐNG KÊ THEO PHIM
    var filmStatistic = [];
    var cinemaStatistic = [];
    var cineplexStatistic = [];
    //LẤY DOANH THU TỪ BOOKING,SHOWTIME
    const bookings = await Booking.findAll({
        attributes: [
            'Showtime.showtime_ID',
            [Sequelize.fn('SUM', Sequelize.col('booking_TotalPrice')), 'showtimeTotalMoney'],
        ],
        group: ['Showtime.showtime_ID'],

        include: [{
            model: Showtime,
        }],
    });
    // res.send('fdsaf');

    var filmIDArray = [];
    var cinemaIDArray = [];
    var cineplexIDArray = [];

    bookings.forEach(booking => {
        if (!filmIDArray.includes(booking.Showtime.showtime_Film)) {
            filmIDArray.push(booking.Showtime.showtime_Film);
        }
        if (!cinemaIDArray.includes(booking.Showtime.showtime_Cinema)) {
            cinemaIDArray.push(booking.Showtime.showtime_Cinema);
        }
    });

    const films = await Film.findAll({
        where: {
            'film_ID': {
                [Op.in]: filmIDArray,
            }
        }
    });

    const cinemas = await Cinema.findAll({
        where: {
            'cinema_ID': {
                [Op.in]: cinemaIDArray,
            }
        },
        include: [{ model: Cineplex }]
    });

    var addedFilm = [];
    var addedCinema = [];
    var addedCineplex = [];

    for (var j = 0; j < bookings.length; j++) {

        for (var i = 0; i < films.length; i++) {
            if (bookings[j].Showtime.showtime_Film === films[i].film_ID) {

                if (!addedFilm.includes(films[i].film_ID)) {
                    filmStatistic.push({
                        filmID: films[i].film_ID,
                        filmName: films[i].film_Name,
                        filmRevenue: bookings[j].dataValues.showtimeTotalMoney,
                        filmSoldTicketAmount: 0,
                    });
                } else {
                    filmStatistic.forEach(fst => {
                        if (fst.filmID === films[i].film_ID) {
                            fst.filmRevenue += bookings[j].dataValues.showtimeTotalMoney;
                        }
                    })
                }
                addedFilm.push(films[i].film_ID);
            }
        }

        for (var i = 0; i < cinemas.length; i++) {

            if (bookings[j].Showtime.showtime_Cinema === cinemas[i].cinema_ID) {

                if (!addedCinema.includes(cinemas[i].cinema_ID)) {

                    if (!addedCineplex.includes(cinemas[i].CineplexCineplexID)) {
                        cineplexIDArray.push(cinemas[i].CineplexCineplexID)
                    }

                    cinemaStatistic.push({
                        cinemaID: cinemas[i].cinema_ID,
                        cinemaName: cinemas[i].cinema_Name,
                        cinemaCineplex: cinemas[i].CineplexCineplexID,
                        cinemaRevenue: bookings[j].dataValues.showtimeTotalMoney,
                        cinemaSoldTicketAmount: 0,
                    });

                } else {
                    cinemaStatistic.forEach(fst => {
                        if (fst.cinemaID === cinemas[i].cinema_ID) {
                            fst.cinemaRevenue += bookings[j].dataValues.showtimeTotalMoney;
                        }
                    })
                }
                addedCinema.push(cinemas[i].cinema_ID);
                addedCineplex.push(cinemas[i].CineplexCineplexID);
            }
        }

    }

    const booking = await Booking.findAll({
        include: [{ model: Showtime }]
    });

    var bookingSeatArray;
    var bookingSeatLength;
    booking.forEach(b => {
        for (var i = 0; i < filmStatistic.length; i++) {
            if (b.Showtime.showtime_Film == filmStatistic[i].filmID) {
                bookingSeatArray = String(b.booking_Seat).split(", ");
                bookingSeatLength = bookingSeatArray.length;
                filmStatistic[i].filmSoldTicketAmount += bookingSeatLength;
            }
        }
    });


    // THỐNG KÊ THEO CỤM RẠP
    const cineplexes = await Cineplex.findAll({
        where: {
            cineplex_ID: {
                [Op.in]: cineplexIDArray,
            }
        }
    });


    booking.forEach(b => {
        for (var i = 0; i < cinemaStatistic.length; i++) {
            if (b.Showtime.showtime_Cinema == cinemaStatistic[i].cinemaID) {
                bookingSeatArray = String(b.booking_Seat).split(", ");
                bookingSeatLength = bookingSeatArray.length;
                cinemaStatistic[i].cinemaSoldTicketAmount += bookingSeatLength;
            }
        }
    });


    //BIẾN LƯU CỤM RẠP ĐÃ THÊM
    var addedCine = [];
    for (var i = 0; i < cineplexes.length; i++) {
        cinemaStatistic.forEach(cineSt => {

            //NẾU RẠP THUỘC CỤM RẠP
            if (cineSt.cinemaCineplex == cineplexes[i].cineplex_ID) {

                //NẾU CHƯA THÊM CỤM RẠP
                if (!addedCine.includes(cineplexes[i].cineplex_ID)) {

                    cineplexStatistic.push({
                        cineplexName: cineplexes[i].cineplex_Name,
                        cineplexRevenue: cineSt.cinemaRevenue,
                        cineplexSoldTicketAmount: cineSt.cinemaSoldTicketAmount,
                    });

                } else {
                    cineplexStatistic[i].cineplexRevenue += cineSt.cinemaRevenue;
                    cineplexStatistic[i].cineplexSoldTicketAmount += cineSt.cinemaSoldTicketAmount;
                }

                addedCine.push(cineplexes[i].cineplex_ID);
            }


        });
    }

    res.render('admin', { filmStatistic, cineplexStatistic });

});

router.post('/', async function (req, res) {
    const { fromDate, toDate } = req.body;

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // THỐNG KÊ THEO PHIM
    var filmStatistic = [];
    var cinemaStatistic = [];
    var cineplexStatistic = [];
    //LẤY DOANH THU TỪ BOOKING,SHOWTIME
    const bookings = await Booking.findAll({
        attributes: [
            'Showtime.showtime_ID',
            [Sequelize.fn('SUM', Sequelize.col('booking_TotalPrice')), 'showtimeTotalMoney'],
        ],
        group: ['Showtime.showtime_ID'],
        where: {
            'booking_Date': {
                [Op.between]: [from, to],
            }
        },
        include: [{
            model: Showtime,
        }],
    });

    var filmIDArray = [];
    var cinemaIDArray = [];
    var cineplexIDArray = [];

    bookings.forEach(booking => {
        if (!filmIDArray.includes(booking.Showtime.showtime_Film)) {
            filmIDArray.push(booking.Showtime.showtime_Film);
        }
        if (!cinemaIDArray.includes(booking.Showtime.showtime_Cinema)) {
            cinemaIDArray.push(booking.Showtime.showtime_Cinema);
        }
    });

    const films = await Film.findAll({
        where: {
            'film_ID': {
                [Op.in]: filmIDArray,
            }
        }
    });

    const cinemas = await Cinema.findAll({
        where: {
            'cinema_ID': {
                [Op.in]: cinemaIDArray,
            }
        },
        include: [{ model: Cineplex }]
    });

    var addedFilm = [];
    var addedCinema = [];
    var addedCineplex = [];

    for (var j = 0; j < bookings.length; j++) {
        for (var i = 0; i < films.length; i++) {
            if (bookings[j].Showtime.showtime_Film === films[i].film_ID) {

                if (!addedFilm.includes(films[i].film_ID)) {
                    filmStatistic.push({
                        filmID: films[i].film_ID,
                        filmName: films[i].film_Name,
                        filmRevenue: bookings[j].dataValues.showtimeTotalMoney,
                        filmSoldTicketAmount: 0,
                    });
                } else {
                    filmStatistic.forEach(fst => {
                        if (fst.filmID === films[i].film_ID) {
                            fst.filmRevenue += bookings[j].dataValues.showtimeTotalMoney;
                        }
                    })
                }
                addedFilm.push(films[i].film_ID);
            }
        }

        for (var i = 0; i < cinemas.length; i++) {

            if (bookings[j].Showtime.showtime_Cinema === cinemas[i].cinema_ID) {

                if (!addedCinema.includes(cinemas[i].cinema_ID)) {

                    if (!addedCineplex.includes(cinemas[i].CineplexCineplexID)) {
                        cineplexIDArray.push(cinemas[i].CineplexCineplexID)
                    }

                    cinemaStatistic.push({
                        cinemaID: cinemas[i].cinema_ID,
                        cinemaName: cinemas[i].cinema_Name,
                        cinemaCineplex: cinemas[i].CineplexCineplexID,
                        cinemaRevenue: bookings[j].dataValues.showtimeTotalMoney,
                        cinemaSoldTicketAmount: 0,
                    });

                } else {
                    cinemaStatistic.forEach(fst => {
                        if (fst.cinemaID === cinemas[i].cinema_ID) {
                            fst.cinemaRevenue += bookings[j].dataValues.showtimeTotalMoney;
                        }
                    })
                }
                addedCinema.push(cinemas[i].cinema_ID);
                addedCineplex.push(cinemas[i].CineplexCineplexID);
            }
        }

    }

    const booking = await Booking.findAll({
        include: [{ model: Showtime }]
    });

    var bookingSeatArray;
    var bookingSeatLength;
    booking.forEach(b => {
        for (var i = 0; i < filmStatistic.length; i++) {
            if (b.Showtime.showtime_Film == filmStatistic[i].filmID) {
                bookingSeatArray = String(b.booking_Seat).split(", ");
                bookingSeatLength = bookingSeatArray.length;
                filmStatistic[i].filmSoldTicketAmount += bookingSeatLength;
            }
        }
    });




    // THỐNG KÊ THEO CỤM RẠP

    const cineplexes = await Cineplex.findAll({
        where: {
            cineplex_ID: {
                [Op.in]: cineplexIDArray,
            }
        }
    });


    booking.forEach(b => {
        for (var i = 0; i < cinemaStatistic.length; i++) {
            if (b.Showtime.showtime_Cinema == cinemaStatistic[i].cinemaID) {
                bookingSeatArray = String(b.booking_Seat).split(", ");
                bookingSeatLength = bookingSeatArray.length;
                cinemaStatistic[i].cinemaSoldTicketAmount += bookingSeatLength;
            }
        }
    });


    //BIẾN LƯU CỤM RẠP ĐÃ THÊM
    var addedCine = [];
    for (var i = 0; i < cineplexes.length; i++) {
        cinemaStatistic.forEach(cineSt => {

            //NẾU RẠP THUỘC CỤM RẠP
            if (cineSt.cinemaCineplex == cineplexes[i].cineplex_ID) {

                //NẾU CHƯA THÊM CỤM RẠP
                if (!addedCine.includes(cineplexes[i].cineplex_ID)) {

                    cineplexStatistic.push({
                        cineplexName: cineplexes[i].cineplex_Name,
                        cineplexRevenue: cineSt.cinemaRevenue,
                        cineplexSoldTicketAmount: cineSt.cinemaSoldTicketAmount,
                    });

                } else {
                    cineplexStatistic[i].cineplexRevenue += cineSt.cinemaRevenue;
                    cineplexStatistic[i].cineplexSoldTicketAmount += cineSt.cinemaSoldTicketAmount;
                }

                addedCine.push(cineplexes[i].cineplex_ID);
            }


        });
    }

    res.render('admin', { filmStatistic, cineplexStatistic, fromDate, toDate });

    // THỐNG KÊ THEO SUẤT CHIẾU
});

router.get('/123', async function (req, res) {

    res.send('hello admin');
    // res.render('admin');
    var D = new Date();
    var month = D.getMonth() + 1;
    var year = D.getFullYear() + 1;
    var F = new Date();
    F.setDate(1);


    // THỐNG KÊ THEO SUẤT CHIẾU
    // THỐNG KÊ THEO CỤM RẠP

    // THỐNG KÊ THEO PHIM
    const TongTienCuaXuatChieu = await Booking.findAll({
        attributes: ['Showtime.showtime_Film',
            'Showtime.showtime_Cinema',
            [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'],
            [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],

        group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],

        include: [
            {
                model: CinemaTimeShow, where: {
                    cinemaTimeShow_Date: {
                        [Op.between]: [F, D],
                    }
                }
            }
        ]
    }).catch(async function (err) {
        console.log(err);
    });
    var thuocTinhFilm = [];
    var TongXuatChieu = TongTienCuaXuatChieu.length;
    const dateNow = Date.now();
    const SoFilm = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.lte]: dateNow,
            },
            film_Public: true,
        },
    }).catch(async function (err) {
        console.log(err);
    });
    for (let temp = 0; temp < SoFilm.length; temp++) {
        var filmTemp = {
            ID_film: SoFilm[temp].film_ID,
            Name_film: SoFilm[temp].film_Name,
            TotalMoney_film: 0,
            CountTicket_film: 0,
        }
        thuocTinhFilm.push(filmTemp);
    }
    for (let temp = 0; temp < thuocTinhFilm.length; temp++) {
        for (let i = 0; i < TongXuatChieu; i++) {
            if (thuocTinhFilm[temp].ID_film === TongTienCuaXuatChieu[i].CinemaTimeShow.film_ID) {
                thuocTinhFilm[temp].TotalMoney_film += Number(TongTienCuaXuatChieu[i].dataValues.TongTien);
                thuocTinhFilm[temp].CountTicket_film += Number(TongTienCuaXuatChieu[i].dataValues.SoVeBanDuoc);
            }
        }
    }
    // tinh theo cụm rạp        
    const TongTienCuaXuatChieuCinema = await ticket.findAll({
        attributes: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
        group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
        include: [
            {
                model: CinemaTimeShow, where: {
                    cinemaTimeShow_Date: {
                        [Op.between]: [F, D],
                    }
                }
            }
        ]
    }).catch(async function (err) {
        console.log(err);
    });
    var thuocTinhRap = [];
    var thuocTinhCumRap = [];
    const TimRap = await Cinema.findAll({});
    const TimCumRap = await Cineplex.findAll({});
    for (let temp = 0; temp < TimRap.length; temp++) {
        var RapTemp = {
            ID_cinema: TimRap[temp].cinema_ID,
            Name_cinema: TimRap[temp].cinema_Name,
            ID_cineplex: TimRap[temp].CineplexCineplexID,
            TotalMoney_cinema: 0,
            CountTicket_cinema: 0,
        }
        thuocTinhRap.push(RapTemp);
    }
    for (let temp = 0; temp < TimCumRap.length; temp++) {
        var CumRap = {
            ID_cineplex: TimCumRap[temp].cineplex_ID,
            Name_cineplex: TimCumRap[temp].cineplex_Name,
            TotalMoney_cineplex: 0,
            CountTicket_cineplex: 0,
        }
        thuocTinhCumRap.push(CumRap);
    }
    for (let temp = 0; temp < thuocTinhRap.length; temp++) {
        for (let i = 0; i < TongTienCuaXuatChieuCinema.length; i++) {
            if (thuocTinhRap[temp].ID_cinema === TongTienCuaXuatChieuCinema[i].CinemaTimeShow.cinema_ID) {
                thuocTinhRap[temp].TotalMoney_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.TongTien);
                thuocTinhRap[temp].CountTicket_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.SoVeBanDuoc);
            }
        }
    }
    for (let temp = 0; temp < thuocTinhCumRap.length; temp++) {
        for (let i = 0; i < thuocTinhRap.length; i++) {
            if (thuocTinhCumRap[temp].ID_cineplex === thuocTinhRap[i].ID_cineplex) {
                thuocTinhCumRap[temp].TotalMoney_cineplex += Number(thuocTinhRap[i].TotalMoney_cinema);
                thuocTinhCumRap[temp].CountTicket_cineplex += Number(thuocTinhRap[i].CountTicket_cinema);
            }
        }
    }

    res.render('admin', { thuocTinhFilm, thuocTinhCumRap });
});

// router.post('/', async function (req, res) {
//     // const { txtDateOne, txtDateTwo } = req.body;

//     // // tính theo film
//     // const TongTienCuaXuatChieu = await ticket.findAll({
//     //     attributes: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
//     //     group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
//     //     where: {

//     //     },
//     //     include: [
//     //         {
//     //             model: CinemaTimeShow, where: {
//     //                 cinemaTimeShow_Date: {
//     //                     [Op.between]: [txtDateOne, txtDateTwo],
//     //                 }
//     //             }
//     //         }
//     //     ]
//     // }).catch(async function (err) {
//     //     console.log(err);
//     // });
//     // var thuocTinhFilm = [];
//     // var TongXuatChieu = TongTienCuaXuatChieu.length;
//     // const dateNow = Date.now();
//     // const SoFilm = await Film.findAll({
//     //     where: {
//     //         film_DatePublic: {
//     //             [Op.lte]: dateNow,
//     //         },
//     //         film_Public: true,
//     //     },
//     // }).catch(async function (err) {
//     //     console.log(err);
//     // });
//     // for (let temp = 0; temp < SoFilm.length; temp++) {
//     //     var filmTemp = {
//     //         ID_film: SoFilm[temp].film_ID,
//     //         Name_film: SoFilm[temp].film_Name,
//     //         TotalMoney_film: 0,
//     //         CountTicket_film: 0,
//     //     }
//     //     thuocTinhFilm.push(filmTemp);
//     // }
//     // for (let temp = 0; temp < thuocTinhFilm.length; temp++) {
//     //     for (let i = 0; i < TongXuatChieu; i++) {
//     //         if (thuocTinhFilm[temp].ID_film === TongTienCuaXuatChieu[i].CinemaTimeShow.film_ID) {
//     //             thuocTinhFilm[temp].TotalMoney_film += Number(TongTienCuaXuatChieu[i].dataValues.TongTien);
//     //             thuocTinhFilm[temp].CountTicket_film += Number(TongTienCuaXuatChieu[i].dataValues.SoVeBanDuoc);
//     //         }
//     //     }
//     // }
//     // // tinh theo cụm rạp        
//     // const TongTienCuaXuatChieuCinema = await ticket.findAll({
//     //     attributes: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
//     //     group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
//     //     include: [
//     //         {
//     //             model: CinemaTimeShow, where: {
//     //                 cinemaTimeShow_Date: {
//     //                     [Op.between]: [txtDateOne, txtDateTwo],
//     //                 }
//     //             }
//     //         }
//     //     ]
//     // }).catch(async function (err) {
//     //     console.log(err);
//     // });
//     // var thuocTinhRap = [];
//     // var thuocTinhCumRap = [];
//     // const TimRap = await Cinema.findAll({});
//     // const TimCumRap = await Cineplex.findAll({});
//     // for (let temp = 0; temp < TimRap.length; temp++) {
//     //     var RapTemp = {
//     //         ID_cinema: TimRap[temp].cinema_ID,
//     //         Name_cinema: TimRap[temp].cinema_Name,
//     //         ID_cineplex: TimRap[temp].CineplexCineplexID,
//     //         TotalMoney_cinema: 0,
//     //         CountTicket_cinema: 0,
//     //     }
//     //     thuocTinhRap.push(RapTemp);
//     // }
//     // for (let temp = 0; temp < TimCumRap.length; temp++) {
//     //     var CumRap = {
//     //         ID_cineplex: TimCumRap[temp].cineplex_ID,
//     //         Name_cineplex: TimCumRap[temp].cineplex_Name,
//     //         TotalMoney_cineplex: 0,
//     //         CountTicket_cineplex: 0,
//     //     }
//     //     thuocTinhCumRap.push(CumRap);
//     // }
//     // for (let temp = 0; temp < thuocTinhRap.length; temp++) {
//     //     for (let i = 0; i < TongTienCuaXuatChieuCinema.length; i++) {
//     //         if (thuocTinhRap[temp].ID_cinema === TongTienCuaXuatChieuCinema[i].CinemaTimeShow.cinema_ID) {
//     //             thuocTinhRap[temp].TotalMoney_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.TongTien);
//     //             thuocTinhRap[temp].CountTicket_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.SoVeBanDuoc);
//     //         }
//     //     }
//     // }
//     // for (let temp = 0; temp < thuocTinhCumRap.length; temp++) {
//     //     for (let i = 0; i < thuocTinhRap.length; i++) {
//     //         if (thuocTinhCumRap[temp].ID_cineplex === thuocTinhRap[i].ID_cineplex) {
//     //             thuocTinhCumRap[temp].TotalMoney_cineplex += Number(thuocTinhRap[i].TotalMoney_cinema);
//     //             thuocTinhCumRap[temp].CountTicket_cineplex += Number(thuocTinhRap[i].CountTicket_cinema);
//     //         }
//     //     }
//     // }

//     // res.render('admin.ejs', { thuocTinhFilm, thuocTinhCumRap });
//     res.render('admin');
// });
router.get('/logout', async function (req, res) {
    delete req.session.Admin;
    res.redirect('/');
});

//FILM

// [GET] /admin/film
router.get('/film', async function (req, res) {
    const filmAll = await Film.findAll({
        order: [
            ['film_ID', 'DESC']
        ]
    });
    res.render('admin', { filmAll });
});


router.get('/film/create', async function (req, res) {
    res.redirect('/admin/film');
});

// [POST] /admin/film/create
router.post('/film/create', upload.single('filmImage'), async function (req, res) {
    var { filmName, filmPublicDate, filmTime, filmContent, filmPublic, filmTrailer } = req.body;

    const found = await Film.findOne({ where: { film_Name: filmName } });
    if (found) {
        const filmAll = await Film.findAll({
            order: [
                ['film_ID', 'DESC']
            ]
        });
        var crud_error = "THÊM PHIM THẤT BẠI! \nPHIM ĐƯỢC THÊM ĐÃ CÓ TRONG DANH SÁCH";
        res.render('admin', { filmAll, crud_error });
    } else {
        var path = './public/image/uploads/film/' + String(Date.now()) + '-' + req.file.originalname;
        var filmImage = path.substr(1, path.length);
        // //Move file into path
        await rename(req.file.path, path);

        const maxID = await Film.max('film_ID');

        if (maxID) {
            await Film.create({
                film_ID: maxID + 1,
                film_Name: filmName,
                film_DatePublic: filmPublicDate,
                film_Time: filmTime,
                film_Content: filmContent,
                film_Image: filmImage,
                film_Public: filmPublic,
                film_Trailer: filmTrailer,
                film_ViewCount: 0,
            }).then(res.redirect('/admin/film')).catch(console.error);
        } else {
            await Film.create({
                film_Name: filmName,
                film_DatePublic: filmPublicDate,
                film_Time: filmTime,
                film_Content: filmContent,
                film_Image: filmImage,
                film_Public: filmPublic,
                film_Trailer: filmTrailer,
                film_ViewCount: 0,
            }).then(res.redirect('/admin/film')).catch(console.error);
        }

    }
});

// [POST] /admin/film/update/:id
router.post('/film/update/:id', upload.single('filmImage'), async function (req, res) {
    //Update ảnh film --> xoá ảnh cũ, thêm ảnh mới
    const id = Number(req.params.id);
    var { filmName, filmPublicDate, filmTime, filmContent, filmPublic, filmTrailer } = req.body;

    const updatedFilm = await Film.findByPk(id);
    //NẾU CÓ CẬP NHẬT TÊN PHIM
    if (updatedFilm.film_Name != filmName) {
        const found = await Film.findOne({ where: { film_Name: filmName } });
        if (found) {
            const filmAll = await Film.findAll({
                order: [
                    ['film_ID', 'DESC']
                ]
            });
            var crud_error = "CẬP NHẬT PHIM THẤT BẠI! \nTÊN PHIM ĐƯỢC CẬP NHẬT ĐÃ CÓ TRONG DANH SÁCH";
            res.render('admin', { filmAll, crud_error });
        } else {
            if (req.file) {
                var path = './public/image/uploads/film/' + String(Date.now()) + '-' + req.file.originalname;
                var filmImage = path.substr(1, path.length);

                // Xoá ảnh cũ
                fs.unlink(path, () => {
                    console.log(`successfully deleted ${path}`);
                });
                // THêm ảnh mới
                await rename(req.file.path, path);
            }
            updatedFilm.film_Image = filmImage;
            updatedFilm.film_Name = filmName;
            updatedFilm.film_DatePublic = filmPublicDate;
            updatedFilm.film_Time = filmTime;
            updatedFilm.film_Content = filmContent;
            updatedFilm.film_Public = filmPublic;
            updatedFilm.film_Trailer = filmTrailer;
            await updatedFilm.save().then(res.redirect('/admin/film')).catch(console.error);

        }
        //nếu không cập nhật tên phim --> cap nhat thứ khác
    } else { // NẾU KHÔNG CẬP NHẬT TÊN --> CẬP NHẬT THỨ KHÁC
        if (req.file) {
            var path = './public/image/uploads/film/' + String(Date.now()) + '-' + req.file.originalname;
            var filmImage = path.substr(1, path.length);

            // Xoá ảnh cũ
            fs.unlink(path, () => {
                console.log(`successfully deleted ${path}`);
            });
            // THêm ảnh mới
            await rename(req.file.path, path);
        }
        updatedFilm.film_Image = filmImage;
        updatedFilm.film_DatePublic = filmPublicDate;
        updatedFilm.film_Time = filmTime;
        updatedFilm.film_Content = filmContent;
        updatedFilm.film_Public = filmPublic;
        updatedFilm.film_Trailer = filmTrailer;
        await updatedFilm.save().then(res.redirect('/admin/film')).catch(console.error);
    }
});

// [GET] /admin/film/delete/:id
router.get('/film/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    const showtimes = await Showtime.findAll({ where: { showtime_Film: id } });
    if (showtimes.length > 0) {
        const filmAll = await Film.findAll({
            order: [
                ['film_ID', 'DESC']
            ]
        });
        var crud_error = "XOÁ PHIM THẤT BẠI! \nPHIM ĐANG ĐƯỢC CÔNG CHIẾU! HÃY CẨN THẬN";
        res.render('admin', { filmAll, crud_error });
    } else {
        const deletedFilm = await Film.findByPk(id);

        //Xoá ảnh từ folder khi xoá film
        const fileNameWithPath = '.' + deletedFilm.film_Image;
        fs.unlink(fileNameWithPath, () => {
            console.log(`successfully deleted ${fileNameWithPath}`);
        });
        await Film.destroy({ where: { film_ID: id, }, });
        res.redirect('/admin/film')
    }

});



//CINEMA 

// [GET] /admin/cinema
router.get('/cinema', async function (req, res) {
    const cinema = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
        order: [
            ['cinema_ID', 'DESC'],
        ],
    });
    const allCineplexes = await Cineplex.findAll({});
    res.render('admin', { cinema, allCineplexes });
});

router.get('/cinema/create', async function (req, res) {
    res.redirect('/admin/cinema');
});

// [POST] /admin/cinema/create
router.post('/cinema/create', async function (req, res) {
    var { cinemaName, cinemaType, cinemaLength, cinemaWidth, cineplexID } = req.body;
    /// Trùng tên, trùng cụm rạp
    const found = await Cinema.findOne({ where: { cinema_Name: cinemaName, CineplexCineplexID: cineplexID } });
    if (found) {
        const cinema = await Cinema.findAll({
            include: [{
                model: Cineplex,
            }],
            order: [
                ['cinema_ID', 'DESC'],
            ],
        });
        const allCineplexes = await Cineplex.findAll({});
        var crud_error = "THÊM RẠP PHIM THẤT BẠI! \nRẠP PHIM ĐÃ TỒN TẠI!!";
        res.render('admin', { cinema, allCineplexes, crud_error });
    } else {
        var maxID = await Cinema.max('cinema_ID');
        if (maxID) {
            await Cinema.create({
                cinema_ID: maxID + 1,
                cinema_Name: cinemaName,
                cinema_Type: cinemaType,
                cinema_Length: cinemaLength,
                cinema_Width: cinemaWidth,
                CineplexCineplexID: cineplexID,
            }).then(res.redirect('/admin/cinema')).catch(console.error);
        } else {
            await Cinema.create({
                cinema_Name: cinemaName,
                cinema_Type: cinemaType,
                cinema_Length: cinemaLength,
                cinema_Width: cinemaWidth,
                CineplexCineplexID: cineplexID,
            }).then(res.redirect('/admin/cinema')).catch(console.error);
        }
    }

});

// [GET] /admin/cinema/delete/id
router.get('/cinema/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    const showtimes = await Showtime.findAll({ where: { showtime_Cinema: id } });

    if (showtimes.length > 0) {
        const cinema = await Cinema.findAll({
            include: [{
                model: Cineplex,
            }],
            order: [
                ['cinema_ID', 'DESC'],
            ],
        });
        const allCineplexes = await Cineplex.findAll();
        var crud_error = "KHÔNG THỂ XOÁ RẠP NÀY !! \nRẠP ĐANG TRONG QUÁ TRÌNH HOẠT ĐỘNG\nHÃY CẨN THẬN!";
        res.render('admin', { cinema, allCineplexes, crud_error });
    } else {
        await Cinema.destroy({
            where: { cinema_ID: id, }
        }).then(res.redirect('/admin/cinema'))
            .catch(console.error);
    }
});

//[POST] /admin/cinema/update/id
router.post('/cinema/update/:id', async function (req, res) {
    const id = Number(req.params.id);

    var { cinemaName, cinemaType, cinemaLength, cinemaWidth, cineplexID } = req.body;

    const updatedCinema = await Cinema.findByPk(id);
    if (updatedCinema.cinema_Name != cinemaName || updatedCinema.CineplexCineplexID != cineplexID) {
        const found = await Cinema.findOne({ where: { cinema_Name: cinemaName, CineplexCineplexID: cineplexID } });

        if (found) {
            const cinema = await Cinema.findAll({
                include: [{
                    model: Cineplex,
                }],
                order: [
                    ['cinema_ID', 'DESC'],
                ],
            });
            const allCineplexes = await Cineplex.findAll({});
            var crud_error = "CẬP NHẬT THẤT BẠI!! \nRẠP PHIM CÓ TÊN ĐƯỢC CẬP NHẬT ĐÃ TỒN TẠI";
            res.render('admin', { cinema, allCineplexes, crud_error });
        } else {
            await Cinema.update({
                cinema_Name: cinemaName,
                cinema_Type: cinemaType,
                cinema_Length: cinemaLength,
                cinema_Width: cinemaWidth,

                CineplexCineplexID: cineplexID,
            },
                {
                    where: {
                        cinema_ID: id,
                    },
                }).then(res.redirect('/admin/cinema')).catch(console.error);
        }
    } else {
        await Cinema.update({
            cinema_Type: cinemaType,
            cinema_Length: cinemaLength,
            cinema_Width: cinemaWidth,

            CineplexCineplexID: cineplexID,
        },
            {
                where: {
                    cinema_ID: id,
                },
            }).then(res.redirect('/admin/cinema')).catch(console.error);
    }




});


//USER

// [GET] /admin/user
router.get('/user', async function (req, res) {
    const userAll = await user.findAll();
    res.render('admin', { userAll });
});

//[POST] /admin/user/delete/id
router.get('/user/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    await user.destroy({
        where: {
            user_ID: id,
        }
    }).then(res.redirect('back')).catch(console.error);

});



// CINEPLEX

// [GET] /admin/cineplex
router.get('/cineplex', async function (req, res) {
    /* const TongTienCineplex =  await ticket.findAll({
        include :[
            { model : CinemaTimeShow   , include : [{ model :  Cinema  }] }
        ]
    }).then(function(TongTien){
        console.TongTien();
        for(let i = 0 ; i < TongTien.length ;i++){
            console.log(TongTien[i].CinemaTimeShow.Cinema.Cineplex.cineplex_Name);
            console.log(TongTien[i].CinemaTimeShow.Cinema.Cineplex.cineplex_ID);
        }
    }).catch(async function(err){
        console.log(err);
    }); */
    /* var tempPhim = 0;
    while(SoFilm[tempPhim] !== undefined){
 
    } */

    const cineplex = await Cineplex.findAll({
        order: [
            ['cineplex_ID', 'DESC'],
        ]
    });
    res.render('admin', { cineplex });

});

// [GET] /admin/cineplex/create
router.get('/cineplex/create', async function (req, res) {
    res.redirect('/admin/cineplex');
});


// [POST] /admin/cineplex/create
router.post('/cineplex/create', upload.single('cineplexImage'), async function (req, res) {
    var { cineplexName, cineplexAddress, cineplexMap } = req.body;
    var found = await Cineplex.findOne({ where: { cineplex_Name: cineplexName } });
    if (found) {
        const cineplex = await Cineplex.findAll({
            order: [
                ['cineplex_ID', 'DESC'],
            ]
        });
        var crud_error = "CỤM RẠP ĐÃ TỒN TẠI !!";
        res.render('admin', { cineplex, crud_error });
    } else {

        var path = './public/image/uploads/cineplex/' + String(Date.now()) + '-' + req.file.originalname;
        var cineplexImage = path.substr(1, path.length);
        // //Move file into path
        await rename(req.file.path, path);

        var maxID = await Cineplex.max('cineplex_ID');
        if (maxID) {
            await Cineplex.create({
                cineplex_ID: maxID + 1,
                cineplex_Name: cineplexName,
                cineplex_Address: cineplexAddress,
                cineplex_Image: cineplexImage,
                cineplex_GoogleMap: cineplexMap,
            }).then(res.redirect('/admin/cineplex')).catch(console.error);
        } else {
            await Cineplex.create({
                cineplex_Name: cineplexName,
                cineplex_Address: cineplexAddress,
                cineplex_Image: cineplexImage,
                cineplex_GoogleMap: cineplexMap,
            }).then(res.redirect('/admin/cineplex')).catch(console.error);
        }

    }
});


// [GET] /admin/cineplex/delete/:id
router.get('/cineplex/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    const cinemas = await Cinema.findAll({ where: { CineplexCineplexID: id } });
    if (cinemas.length > 0) {
        const cineplex = await Cineplex.findAll({
            order: [
                ['cineplex_ID', 'DESC'],
            ]
        });
        var crud_error = "KHÔNG THỂ XOÁ CỤM RẠP NÀY !! \nCỤM RẠP ĐANG TRONG QUÁ TRÌNH HOẠT ĐỘNG\nHÃY CẨN THẬN!";
        res.render('admin', { cineplex, crud_error });
    } else {
        const deletedCineplex = await Cineplex.findByPk(id);
        const fileNameWithPath = '.' + deletedCineplex.cinplex_Image;
        fs.unlink(fileNameWithPath, () => {
            console.log(`successfully deleted ${fileNameWithPath}`);
        });
        await Cineplex.destroy({
            where: {
                cineplex_ID: id,
            }
        }).then(res.redirect('/admin/cineplex')).catch(console.error);
    }
});

// [POST] /admin/cineplex/update/:id
router.post('/cineplex/update/:id', upload.single('cineplexImage'), async function (req, res) {
    const id = Number(req.params.id);
    var { cineplexName, cineplexAddress, cineplexMap } = req.body;

    // update name -> kiem tra trung -> neu trung, neu ko
    const updatedCineplex = await Cineplex.findByPk(id);

    if (updatedCineplex.cineplex_Name != cineplexName) {
        const found = await Cineplex.findOne({ where: { cineplex_Name: cineplexName } });
        if (found) {
            const cineplex = await Cineplex.findAll({
                order: [
                    ['cineplex_ID', 'DESC'],
                ]
            });
            var crud_error = "KHÔNG THỂ CẬP NHẬT !! \nTÊN CỤM RẠP CẬP NHẬT ĐÃ TỒN TẠI";
            res.render('admin', { cineplex, crud_error });
        } else {
            if (req.file) {
                var path = './public/image/uploads/cineplex/' + String(Date.now()) + '-' + req.file.originalname;
                var cineplexImage = path.substr(1, path.length);

                // Xoá ảnh cũ
                fs.unlink(path, () => {
                    console.log(`successfully deleted ${path}`);
                });
                // THêm ảnh mới
                await rename(req.file.path, path);
            }

            await Cineplex.update({
                cineplex_Name: cineplexName,
                cineplex_Address: cineplexAddress,
                cineplex_Image: cineplexImage,
                cineplex_GoogleMap: cineplexMap,
            }, {
                where: {
                    cineplex_ID: id,
                }
            }).then(res.redirect('/admin/cineplex')).catch(console.error);
        }
    } else {
        await Cineplex.update({ cineplex_Address: cineplexAddress }, { where: { cineplex_ID: id } });
        res.redirect('/admin/cineplex');
    }

});



// SHOWTIME

// [GET] /admin/showtime
router.get('/showtime', async function (req, res) {
    const showtime = await Showtime.findAll({
        include: [
            { model: Cinema, include: [{ model: Cineplex }] },
            { model: Film },

        ],
        order: [['showtime_ID', 'DESC']],
    });

    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtime, allCinemas, allFilms });
});

// [GET] /admin/showtime/create
router.get('/showtime/create', async function (req, res) {
    res.redirect('/admin/showtime')
});

// [POST] /admin/showtime/create
router.post('/showtime/create', async function (req, res) {
    //Chưa kiểm tra các điều kiện khi thêm
    const { cinemaID, filmID, showtimeDate, beginTime, showtimePrice } = req.body;
    const found = await Showtime.findOne({ where: { showtime_Cinema: cinemaID, showtime_Film: filmID, showtime_Date: showtimeDate, showtime_Begin: beginTime } });
    if (found) {
        const showtime = await Showtime.findAll({
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            order: [['showtime_ID', 'DESC']],
        });

        const allCinemas = await Cinema.findAll({
            include: [{
                model: Cineplex,
            }],
        });
        const allFilms = await Film.findAll();
        var crud_error = "THÊM SUẤT CHIẾU THẤT BẠI! \nSUẤT CHIẾU ĐÃ TỒN TẠI";
        res.render('admin', { showtime, allCinemas, allFilms, crud_error });
    } else {
        var endHour, endMinute;
        // xử lý THÊM THỜI GIAN KẾT THÚC
        const showtimeFilm = await Film.findByPk(filmID);
        const runningTime = showtimeFilm.film_Time;
        // 09:30
        endHour = Number(String(beginTime).substr(0, 2)) + parseInt(runningTime / 60);
        endMinute = Number(String(beginTime).substr(3, 2)) + parseInt(runningTime % 60);

        //12:00
        if (endMinute >= 60) {
            endHour++;
            endMinute = endMinute - 60;
        }
        if (endHour >= 24) {
            endHour = endHour - 24;
        }

        function addZero(number) {
            if (number < 10) {
                return "0" + number;
            }
            return number;
        }

        endHour = addZero(endHour);
        endMinute = addZero(endMinute);
        const endTime = `${endHour}:${endMinute}:00`;

        var maxID = await Showtime.max('showtime_ID');
        if (maxID) {
            await Showtime.create({
                showtime_ID: maxID + 1,
                showtime_Date: showtimeDate,
                showtime_Begin: beginTime,
                showtime_End: endTime,
                showtime_Price: showtimePrice,
                showtime_Film: filmID,
                showtime_Cinema: cinemaID,
            }).then(res.redirect('/admin/showtime')).catch(console.error)
        } else {
            await Showtime.create({
                showtime_Date: showtimeDate,
                showtime_Begin: beginTime,
                showtime_End: endTime,
                showtime_Price: showtimePrice,
                showtime_Film: filmID,
                showtime_Cinema: cinemaID,
            }).then(res.redirect('/admin/showtime')).catch(console.error)
        }
    }
});

// [GET] /admin/showtime/delete/id
router.get('/showtime/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    const bookings = await Booking.findAll();
    if (bookings.length > 0) {
        const showtime = await Showtime.findAll({
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            order: [['showtime_ID', 'DESC']],
        });

        const allCinemas = await Cinema.findAll({
            include: [{
                model: Cineplex,
            }],
        });
        const allFilms = await Film.findAll();
        var crud_error = "XOÁ SUẤT CHIẾU THẤT BẠI! \nSUẤT CHIẾU HIỆN ĐANG TRONG THỜi GIAN CHUẨN BỊ CHIẾU \nHÃY CẨN THẬN";
        res.render('admin', { showtime, allCinemas, allFilms, crud_error });
    } else {

    } await Showtime.destroy({ where: { showtime_ID: id } }).then(res.redirect('/admin/showtime')).catch(console.error);

});

// [POST] /admin/showtime/update/id
router.post('/showtime/update/:id', async function (req, res) {
    const id = Number(req.params.id);
    const { cinemaID, filmID, showtimeDate, beginTime, showtimePrice } = req.body

    Showtime.update({
        showtime_Film: filmID,
        showtime_Cinema: cinemaID,
        showtime_Date: showtimeDate,
        showtime_Begin: beginTime,
        showtime_Price: showtimePrice,
    }, { where: { showtime_ID: id } }).then(res.redirect('back')).catch(console.error);
});


// HIỆN SHOWTIMES CỦA MỘT BỘ PHIM CỤ THỂ
// [GET] /admin/showtime/film/id
router.get('/showtime/film/:id', async function (req, res) {
    const filmID = Number(req.params.id);

    const currentFilm = await Film.findByPk(filmID);
    // showtime by film
    const showtimesByFilm = await Showtime.findAll(
        {
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            where: { showtime_Film: filmID },
            order: [['showtime_ID', 'DESC']],
        },
    );

    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtimesByFilm, allCinemas, allFilms, currentFilm });
});


// HIỆN SHOWTIMES CỦA MỘT BỘ RẠP CỤ THỂ
// [GET] /admin/showtime/cinema/id
router.get('/showtime/cinema/:id', async function (req, res) {
    const cinemaID = Number(req.params.id);
    const currentCinema = await Cinema.findOne({ where: { cinema_ID: cinemaID }, include: [{ model: Cineplex }] });
    // showtime by cinema
    const showtimesByCinema = await Showtime.findAll(
        {
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            where: { showtime_Cinema: cinemaID },
            order: [['showtime_ID', 'DESC']],
        },
    );
    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtimesByCinema, allCinemas, allFilms, currentCinema });
});




router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

//statistical
module.exports = router;