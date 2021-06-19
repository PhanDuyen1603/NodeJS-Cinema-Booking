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
router.get('/', async function(req, res) {
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

    const highViewFilms = await Film.findAll({
        where: {
            film_Public: true,
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
router.get('/gioi-thieu', function(req, res) {
    const intro = true;
    res.render('home', { intro });
});

router.get('/ho-tro', function(req, res) {
    const support = true;
    res.render('home', { support });
});

// [GET] /phim
router.get('/phim', async function(req, res) {
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

router.get('/filmSearch', async function(req, res) {
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
router.get('/forgotPassword', function(req, res) {
    res.render('auth/forgotPassword');
});

// [GET] /logout
router.get('/logout', function(req, res) {
    if (req.session.user_Id) {
        delete req.session.user_Id;
    } else if (req.session.Admin) {
        delete req.session.Admin;
    }
    res.redirect('/');
});


router.get('/phim/:id', async function(req, res) {
    const id = Number(req.params.id);
    var dateNow = Date.now();

    //TĂNG LƯỢT GHÉ THĂM PHIM
    await Film.increment({ film_ViewCount: 1 }, { where: { film_ID: id } });

    const currentFilm = await Film.findOne({
        where: {
            film_ID: id,
            film_Public: true,
        }
    });
    const cinema = await Cinema.findAll();
    const cineplex = await Cineplex.findAll();

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

    // LẤY TẤT CẢ SUẤT CHIẾU CỦA PHIM
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

    res.render('home', { currentFilm, cinema, cineplex, otherNowShowingFilms, showtimesOfFilm });

});

// [POST] /phim/id
router.post('/phim/:id', async function(req, res) {
    const id = Number(req.params.id);
    var dateNow = Date.now();
    var { cineplexID } = req.body;

    var currentCineplex = await Cineplex.findByPk(cineplexID);

    const currentFilm = await Film.findOne({
        where: {
            film_ID: id,
            film_Public: true,
        }
    });
    const cinema = await Cinema.findAll();
    const cineplex = await Cineplex.findAll();
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


    //LẤY CÁC RẠP CỦA CỤM RẠP NÀY
    const allCinemasOfCineplex = await Cinema.findAll({
        where: {
            CineplexCineplexID: cineplexID,
        }
    });

    var list_cinemaID = [];
    allCinemasOfCineplex.forEach(cinema => {
        list_cinemaID.push(Number(cinema.cinema_ID));
    });

    //showtimes theo cum rap
    const showtimesOfFilm = await Showtime.findAll({
        include: [
            { model: Cinema, include: [{ model: Cineplex }] },
            { model: Film },
        ],
        where: {
            showtime_Film: id,
            showtime_Cinema: {
                [Op.in]: list_cinemaID, //list_cinemaID
            }
        },
        order: [
            ['showtime_Cinema', 'ASC'],
            ['showtime_Film', 'ASC'],
        ],

    });


    res.render('home', { currentFilm, cinema, cineplex, otherNowShowingFilms, showtimesOfFilm, currentCineplex });
});


router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

module.exports = router;