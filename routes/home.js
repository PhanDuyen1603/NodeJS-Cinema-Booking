const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');
const User = require('../models/User.js');
const Cineplex = require('../models/Cineplex.js');
const Cinema = require('../models/Cinema.js');
const Showtime = require('../models/Showtime');
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

const router = new Router();

// const ensureLoggedIn = require('../middlewares/ensure_logged_in');
// router.use(ensureLoggedIn);

// ROUTERS FOR HEADER

// [GET] /
router.get('/', async function (req, res) {
    var dateNow = Date.now();
    var filmLimit = 12;

    //Phim đang chiếu --> ngày chiếu <= ngày hiện tại && trạng thái: công chiếu
    const nowShowingFilms = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.lte]: dateNow,
            },
            film_Public: true,
        },
        limit: filmLimit,
        order: [
            ['film_DatePublic', 'DESC']
        ],
    });

    const upcomingFilms = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.gt]: dateNow,
            },
            film_Public: true,
        },
        limit: filmLimit,
        order: [
            ['film_DatePublic', 'DESC']
        ],
    });

    //
    const highViewFilms = await Film.findAll({
        where: {
            film_Public: true,
            film_ViewCount: {
                [Op.gt]: 0,
            }
        },
        limit: filmLimit,
        order: [
            ['film_ViewCount', 'DESC'],
        ],
    });

    const homeMovieSelection = "hehe";
    const film = { nowShowingFilms, upcomingFilms, highViewFilms };

    res.render('home', { film, homeMovieSelection });
});

// [GET] /gioi-thieu
router.get('/gioi-thieu', function (req, res) {
    const intro = true;
    res.render('home', { intro });
});

router.get('/event', function (req, res) {
    const event = true;
    res.render('home', { event });
});

router.get('/ho-tro', function (req, res) {
    const support = true;
    res.render('home', { support });
});

// [GET] /phim
router.get('/phim', async function (req, res) {
    var dateNow = Date.now();

    //Phim đang chiếu --> ngày chiếu <= ngày hiện tại && trạng thái: công chiếu
    const nowShowingFilms = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.lte]: dateNow,
            },
            film_Public: true,
        },
        order: [
            ['film_DatePublic', 'DESC']
        ],
    });

    const upcomingFilms = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.gt]: dateNow,
            },
            film_Public: true,
        },
        order: [
            ['film_DatePublic', 'DESC']
        ],
    });

    const highViewFilms = await Film.findAll({
        where: {
            film_Public: true,
            film_ViewCount: {
                [Op.gt]: 0,
            }
        },
        order: [
            ['film_ViewCount', 'DESC'],
        ],
    });
    var full = "Biến này dùng để ẩn nút Xem thêm";
    const film = { nowShowingFilms, upcomingFilms, highViewFilms, full };
    var hideSlideHeader = "Biến dùng để ẩn slide header đi kakaka";
    res.render('home', { film, hideSlideHeader });
});

router.get('/filmSearch', async function (req, res) {
    var dateNow = Date.now();
    const NameFilm = req.query.txtSearch;
    const searchNameFilmPublic = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.lte]: dateNow,
            },
            film_Public: true,
            film_Name: {
                [Op.substring]: NameFilm,
            },
        },
        order: [
            ['film_DatePublic', 'DESC']
        ],
    });
    const searchNameFilmNoPublic = await Film.findAll({
        where: {
            film_DatePublic: {
                [Op.gt]: dateNow,
            },
            film_Public: true,
            film_Name: {
                [Op.substring]: NameFilm,
            },
        },
        order: [
            ['film_DatePublic', 'ASC']
        ],
    });
    var user;
    const { user_Id } = req.session;
    if (user_Id) {
        user = await User.findOne({
            where: {
                user_ID: user_Id
            },
        });
    };
    const searchNameFilm = { searchNameFilmPublic: searchNameFilmPublic, searchNameFilmNoPublic: searchNameFilmNoPublic }
    res.render('home', { searchNameFilm, user });
});

// [GET] /forgotPassword
router.get('/forgotPassword', function (req, res) {
    res.render('auth/forgotPassword');
});

// [GET] /logout
router.get('/logout', function (req, res) {
    if (req.session.user_Id) {
        delete req.session.user_Id;
    } else if (req.session.Admin) {
        delete req.session.Admin;
    }
    res.redirect('/');
});

// [GET] /phim/id
router.get('/phim/:id', async function (req, res) {
    const id = Number(req.params.id);
    var dateNow = Date.now();

    //TĂNG LƯỢT GHÉ THĂM PHIM
    await Film.increment({ film_VisitCount: 1 }, { where: { film_ID: id } });

    const currentFilm = await Film.findOne({
        where: {
            film_ID: id,
            film_Public: true,
        }
    });
    const cinema = await Cinema.findAll();
    // film_allCineplexes
    const f_allCineplexes = await Cineplex.findAll();

    // //LẤY CÁC PHIM ĐANG CHIẾU KHÁC PHIM HIỆN TẠI (4 PHIM) ĐỂ SHOW BÊN PHẢI
    const otherNowShowingFilms = await Film.findAll({
        where: {
            'film_ID': {
                [Op.ne]: id
            },
            film_DatePublic: {
                [Op.lte]: dateNow,
            },
            film_Public: true,
        },
        order: [
            ['film_DatePublic', 'DESC']
        ],
        limit: 4,
    });

    // LẤY TẤT CẢ SUẤT CHIẾU CỦA PHIM, NHƯNG > NGÀY HIỆN TẠI

    const showtimesOfFilm = await Showtime.findAll({
        where: {
            showtime_Film: id,
        },
        order: [
            ['showtime_Date', 'ASC'],
        ],
        include: [
            { model: Cinema, include: [{ model: Cineplex }] },
            { model: Film },
        ]
    });

    res.render('home', { currentFilm, cinema, f_allCineplexes, otherNowShowingFilms, showtimesOfFilm });

});


router.post('/suat-chieu-cua-phim', async (req, res) => {
    const { filmID, cineplexID } = req.body;

    //LẤY CÁC RẠP CỦA CỤM RẠP NÀY
    const allCinemasOfCineplex = await Cinema.findAll({
        where: {
            CineplexCineplexID: Number(cineplexID),
        }
    });

    var list_cinemaID = [];
    allCinemasOfCineplex.forEach(cinema => {
        list_cinemaID.push(Number(cinema.cinema_ID));
    });

    // LẤY TẤT CẢ SUẤT CHIẾU CỦA TẤT CẢ RẠP CÓ TRONG CỤM RẠP 
    const showtimesOfFilm = await Showtime.findAll({
        where: {
            showtime_Film: Number(filmID),
            showtime_Cinema: {
                [Op.in]: list_cinemaID, //list_cinemaID
            }
        },
        order: [
            ['showtime_Date', 'ASC'],
            ['showtime_Begin', 'ASC'],
        ],
        include: [
            { model: Film },
        ],

    });

    res.json(showtimesOfFilm);
})


// [GET] /he-thong-rap
router.get('/he-thong-rap', async function (req, res) {
    const allCineplexes = await Cineplex.findAll({
        order: [
            ['cineplex_ID', 'ASC']
        ]
    });
    var hideSlideHeader = "Chỉ để hide slide header";

    // lấy suất chiếu mặc định khi chưa bắt onchange event
    const minID = await Cineplex.min("cineplex_ID");
    const cinemasOfCineplex = await Cinema.findAll({ where: { CineplexCineplexID: minID } });
    const cinemaArr = [];
    cinemasOfCineplex.forEach(cinema => {
        cinemaArr.push(cinema.cinema_ID);
    });

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
    // TẤT CẢ SUẤT CHIẾU CỦA CÁC RẠP VỪA LẤY
    var defaultShowtimes = await Showtime.findAll({
        where: {
            showtime_Cinema: {
                [Op.in]: cinemaArr,
            }
        },
        order: [
            ['showtime_Date', 'ASC']
        ],
        include: [{ model: Film }],
    })

    // var defaultShowtimes = [];
    // if (ShowtimesOfCineplex != null) {
    //     ShowtimesOfCineplex.forEach(showtime => {
    //         defaultShowtimes.push({
    //             showtimeFilmName: showtime.Film.film_Name,
    //             showtimeDate: format_date(showtime.showtime_Date),
    //             showtimeBegin: showtime.showtime_Begin.substr(0, 5),
    //         })
    //     });
    // }

    // res.send(defaultShowtimes)


    res.render('home', { allCineplexes, defaultShowtimes, hideSlideHeader });
});

//GỬI QUA BĂNG AJAX
router.post('/suat-chieu-cua-rap', async (req, res) => {
    // const id = Number(req.params.id);
    const id = Number(req.body.cineplexID);
    const cinemasOfCineplex = await Cinema.findAll({ where: { CineplexCineplexID: id } });
    const cinemaArr = [];
    cinemasOfCineplex.forEach(cinema => {
        cinemaArr.push(cinema.cinema_ID);
    });

    // TẤT CẢ SUẤT CHIẾU CỦA CÁC RẠP VỪA LẤY
    const ShowtimesOfCineplex = await Showtime.findAll({
        where: {
            showtime_Cinema: {
                [Op.in]: cinemaArr,
            }
        },
        order: [
            ['showtime_Date', 'ASC']
        ],
        include: [{ model: Film }],
    })


    res.json(ShowtimesOfCineplex);
})

router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

module.exports = router;