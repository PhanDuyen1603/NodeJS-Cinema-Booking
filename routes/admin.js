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

//UPLOAD FILE
const { promisify } = require('util');
var multer = require('multer');
var upload = multer({ dest: './public/image/uploads/film/' })
const rename = promisify(require('fs').rename);

//REMOVE IMAGE FILE
// const unlinkAsync = promisify(fs.unlink)

const router = new Router();

// var formidable = require('formidable');


const ensureLoggedInAdmin = require('../middlewares/ensure_logged_in_admin');
router.use(ensureLoggedInAdmin);


router.get('/', async function (req, res) {
    res.render('admin');
    // var D = new Date();
    // var month = D.getMonth() + 1;
    // var year = D.getFullYear() + 1;
    // var F = new Date();
    // F.setDate(1);

    // // tính theo film
    // const TongTienCuaXuatChieu = await ticket.findAll({
    //     attributes: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
    //     group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
    //     include: [
    //         {
    //             model: CinemaTimeShow, where: {
    //                 cinemaTimeShow_Date: {
    //                     [Op.between]: [F, D],
    //                 }
    //             }
    //         }
    //     ]
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // var thuocTinhFilm = [];
    // var TongXuatChieu = TongTienCuaXuatChieu.length;
    // const dateNow = Date.now();
    // const SoFilm = await Film.findAll({
    //     where: {
    //         film_DatePublic: {
    //             [Op.lte]: dateNow,
    //         },
    //         film_Public: true,
    //     },
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // for (let temp = 0; temp < SoFilm.length; temp++) {
    //     var filmTemp = {
    //         ID_film: SoFilm[temp].film_ID,
    //         Name_film: SoFilm[temp].film_Name,
    //         TotalMoney_film: 0,
    //         CountTicket_film: 0,
    //     }
    //     thuocTinhFilm.push(filmTemp);
    // }
    // for (let temp = 0; temp < thuocTinhFilm.length; temp++) {
    //     for (let i = 0; i < TongXuatChieu; i++) {
    //         if (thuocTinhFilm[temp].ID_film === TongTienCuaXuatChieu[i].CinemaTimeShow.film_ID) {
    //             thuocTinhFilm[temp].TotalMoney_film += Number(TongTienCuaXuatChieu[i].dataValues.TongTien);
    //             thuocTinhFilm[temp].CountTicket_film += Number(TongTienCuaXuatChieu[i].dataValues.SoVeBanDuoc);
    //         }
    //     }
    // }
    // // tinh theo cụm rạp        
    // const TongTienCuaXuatChieuCinema = await ticket.findAll({
    //     attributes: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
    //     group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
    //     include: [
    //         {
    //             model: CinemaTimeShow, where: {
    //                 cinemaTimeShow_Date: {
    //                     [Op.between]: [F, D],
    //                 }
    //             }
    //         }
    //     ]
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // var thuocTinhRap = [];
    // var thuocTinhCumRap = [];
    // const TimRap = await Cinema.findAll({});
    // const TimCumRap = await Cineplex.findAll({});
    // for (let temp = 0; temp < TimRap.length; temp++) {
    //     var RapTemp = {
    //         ID_cinema: TimRap[temp].cinema_ID,
    //         Name_cinema: TimRap[temp].cinema_Name,
    //         ID_cineplex: TimRap[temp].CineplexCineplexID,
    //         TotalMoney_cinema: 0,
    //         CountTicket_cinema: 0,
    //     }
    //     thuocTinhRap.push(RapTemp);
    // }
    // for (let temp = 0; temp < TimCumRap.length; temp++) {
    //     var CumRap = {
    //         ID_cineplex: TimCumRap[temp].cineplex_ID,
    //         Name_cineplex: TimCumRap[temp].cineplex_Name,
    //         TotalMoney_cineplex: 0,
    //         CountTicket_cineplex: 0,
    //     }
    //     thuocTinhCumRap.push(CumRap);
    // }
    // for (let temp = 0; temp < thuocTinhRap.length; temp++) {
    //     for (let i = 0; i < TongTienCuaXuatChieuCinema.length; i++) {
    //         if (thuocTinhRap[temp].ID_cinema === TongTienCuaXuatChieuCinema[i].CinemaTimeShow.cinema_ID) {
    //             thuocTinhRap[temp].TotalMoney_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.TongTien);
    //             thuocTinhRap[temp].CountTicket_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.SoVeBanDuoc);
    //         }
    //     }
    // }
    // for (let temp = 0; temp < thuocTinhCumRap.length; temp++) {
    //     for (let i = 0; i < thuocTinhRap.length; i++) {
    //         if (thuocTinhCumRap[temp].ID_cineplex === thuocTinhRap[i].ID_cineplex) {
    //             thuocTinhCumRap[temp].TotalMoney_cineplex += Number(thuocTinhRap[i].TotalMoney_cinema);
    //             thuocTinhCumRap[temp].CountTicket_cineplex += Number(thuocTinhRap[i].CountTicket_cinema);
    //         }
    //     }
    // }

    // res.render('admin', { thuocTinhFilm, thuocTinhCumRap });

});
router.post('/', async function (req, res) {
    // const { txtDateOne, txtDateTwo } = req.body;

    // // tính theo film
    // const TongTienCuaXuatChieu = await ticket.findAll({
    //     attributes: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
    //     group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
    //     where: {

    //     },
    //     include: [
    //         {
    //             model: CinemaTimeShow, where: {
    //                 cinemaTimeShow_Date: {
    //                     [Op.between]: [txtDateOne, txtDateTwo],
    //                 }
    //             }
    //         }
    //     ]
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // var thuocTinhFilm = [];
    // var TongXuatChieu = TongTienCuaXuatChieu.length;
    // const dateNow = Date.now();
    // const SoFilm = await Film.findAll({
    //     where: {
    //         film_DatePublic: {
    //             [Op.lte]: dateNow,
    //         },
    //         film_Public: true,
    //     },
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // for (let temp = 0; temp < SoFilm.length; temp++) {
    //     var filmTemp = {
    //         ID_film: SoFilm[temp].film_ID,
    //         Name_film: SoFilm[temp].film_Name,
    //         TotalMoney_film: 0,
    //         CountTicket_film: 0,
    //     }
    //     thuocTinhFilm.push(filmTemp);
    // }
    // for (let temp = 0; temp < thuocTinhFilm.length; temp++) {
    //     for (let i = 0; i < TongXuatChieu; i++) {
    //         if (thuocTinhFilm[temp].ID_film === TongTienCuaXuatChieu[i].CinemaTimeShow.film_ID) {
    //             thuocTinhFilm[temp].TotalMoney_film += Number(TongTienCuaXuatChieu[i].dataValues.TongTien);
    //             thuocTinhFilm[temp].CountTicket_film += Number(TongTienCuaXuatChieu[i].dataValues.SoVeBanDuoc);
    //         }
    //     }
    // }
    // // tinh theo cụm rạp        
    // const TongTienCuaXuatChieuCinema = await ticket.findAll({
    //     attributes: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
    //     group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
    //     include: [
    //         {
    //             model: CinemaTimeShow, where: {
    //                 cinemaTimeShow_Date: {
    //                     [Op.between]: [txtDateOne, txtDateTwo],
    //                 }
    //             }
    //         }
    //     ]
    // }).catch(async function (err) {
    //     console.log(err);
    // });
    // var thuocTinhRap = [];
    // var thuocTinhCumRap = [];
    // const TimRap = await Cinema.findAll({});
    // const TimCumRap = await Cineplex.findAll({});
    // for (let temp = 0; temp < TimRap.length; temp++) {
    //     var RapTemp = {
    //         ID_cinema: TimRap[temp].cinema_ID,
    //         Name_cinema: TimRap[temp].cinema_Name,
    //         ID_cineplex: TimRap[temp].CineplexCineplexID,
    //         TotalMoney_cinema: 0,
    //         CountTicket_cinema: 0,
    //     }
    //     thuocTinhRap.push(RapTemp);
    // }
    // for (let temp = 0; temp < TimCumRap.length; temp++) {
    //     var CumRap = {
    //         ID_cineplex: TimCumRap[temp].cineplex_ID,
    //         Name_cineplex: TimCumRap[temp].cineplex_Name,
    //         TotalMoney_cineplex: 0,
    //         CountTicket_cineplex: 0,
    //     }
    //     thuocTinhCumRap.push(CumRap);
    // }
    // for (let temp = 0; temp < thuocTinhRap.length; temp++) {
    //     for (let i = 0; i < TongTienCuaXuatChieuCinema.length; i++) {
    //         if (thuocTinhRap[temp].ID_cinema === TongTienCuaXuatChieuCinema[i].CinemaTimeShow.cinema_ID) {
    //             thuocTinhRap[temp].TotalMoney_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.TongTien);
    //             thuocTinhRap[temp].CountTicket_cinema += Number(TongTienCuaXuatChieuCinema[i].dataValues.SoVeBanDuoc);
    //         }
    //     }
    // }
    // for (let temp = 0; temp < thuocTinhCumRap.length; temp++) {
    //     for (let i = 0; i < thuocTinhRap.length; i++) {
    //         if (thuocTinhCumRap[temp].ID_cineplex === thuocTinhRap[i].ID_cineplex) {
    //             thuocTinhCumRap[temp].TotalMoney_cineplex += Number(thuocTinhRap[i].TotalMoney_cinema);
    //             thuocTinhCumRap[temp].CountTicket_cineplex += Number(thuocTinhRap[i].CountTicket_cinema);
    //         }
    //     }
    // }

    // res.render('admin.ejs', { thuocTinhFilm, thuocTinhCumRap });
    res.render('admin');
});
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

// [POST] /admin/film/create
router.post('/film/create', upload.single('filmImage'), async function (req, res) {
    var { filmName, filmPublicDate, filmTime, filmContent, filmPublic } = req.body;
    var path = './public/image/uploads/film/' + String(Date.now()) + '-' + req.file.originalname;
    var filmImage = path.substr(1, path.length);

    //Move file into path
    await rename(req.file.path, path);

    await Film.create({
        film_Name: filmName,
        film_DatePublic: filmPublicDate,
        film_Time: filmTime,
        film_Content: filmContent,
        film_Image: filmImage,
        film_Public: filmPublic,
    });

    res.redirect('back');
});

// [POST] /admin/film/update/:id
router.post('/film/update/:id', upload.single('filmImage'), async function (req, res) {
    //Update ảnh film --> xoá ảnh cũ, thêm ảnh mới
    const id = Number(req.params.id);
    var { filmName, filmPublicDate, filmTime, filmContent, filmPublic } = req.body;

    const updatedFilm = await Film.findByPk(id);

    if (filmPublicDate) {
        updatedFilm.film_DatePublic = filmPublicDate;
    }
    if (req.file) {
        var path = './public/image/uploads/film/' + String(Date.now()) + '-' + req.file.originalname;
        var filmImage = path.substr(1, path.length);

        // Xoá ảnh cũ
        fs.unlink(path, () => {
            console.log(`successfully deleted ${path}`);
        });
        // THêm ảnh mới
        await rename(req.file.path, path);

        updatedFilm.film_Image = filmImage;
    }

    updatedFilm.film_Name = filmName;
    updatedFilm.film_Time = filmTime;
    updatedFilm.film_Content = filmContent;
    updatedFilm.film_Public = filmPublic;

    await updatedFilm.save();

    res.redirect('back');
});

// [GET] /admin/film/delete/:id
router.get('/film/delete/:id', async function (req, res) {
    const id = Number(req.params.id);

    //Xoá ảnh từ folder khi xoá film
    const deletedFilm = await Film.findByPk(id);
    const fileNameWithPath = '.' + deletedFilm.film_Image;
    fs.unlink(fileNameWithPath, () => {
        console.log(`successfully deleted ${fileNameWithPath}`);
    });
    await Film.destroy({
        where: {
            film_ID: id,
        },
    });

    res.redirect('back');
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
    const allCineplexAddresses = await Cineplex.findAll({
    });

    res.render('admin', { cinema, allCineplexAddresses });
});

// [POST] /admin/cinema/create
router.post('/cinema/create', async function (req, res) {
    var { cinemaName, cinemaType, cinemaLength, cinemaWidth, cineplexID } = req.body;

    await Cinema.create({
        cinema_Name: cinemaName,
        cinema_Type: cinemaType,
        cinema_Length: cinemaLength,
        cinema_Width: cinemaWidth,

        CineplexCineplexID: cineplexID,
    });

    res.redirect('back');
});

// [GET] /admin/cinema/delete/id
router.get('/cinema/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    await Cinema.destroy({
        where: {
            cinema_ID: id,
        }
    });
    res.redirect('back');
});

//[POST] /admin/cinema/update/id
router.post('/cinema/update/:id', async function (req, res) {
    const id = Number(req.params.id);

    var { cinemaName, cinemaType, cinemaLength, cinemaWidth, cineplexID } = req.body;

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
        });

    res.redirect('back');
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
    });
    res.redirect('back');
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

// [POST] /admin/cineplex/create
router.post('/cineplex/create', async function (req, res) {
    var { cineplexName, cineplexAddress } = req.body;
    await Cineplex.create({
        cineplex_Name: cineplexName,
        cineplex_Address: cineplexAddress,
    });
    res.redirect('back');
});

// [GET] /admin/cineplex/delete/:id
router.get('/cineplex/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    await Cineplex.destroy({
        where: {
            cineplex_ID: id,
        }
    });


    res.redirect('back');
});

// [POST] /admin/cineplex/update/:id
router.post('/cineplex/update/:id', async function (req, res) {
    const id = Number(req.params.id);
    var { cineplexName, cineplexAddress } = req.body;
    await Cineplex.update({
        cineplex_Name: cineplexName,
        cineplex_Address: cineplexAddress,
    }, {
        where: {
            cineplex_ID: id,
        }
    });
    res.redirect('back');
});



// SHOWTIME

// [GET] /admin/showtime
router.get('/showtime', async function (req, res) {
    const showtime = await Showtime.findAll({
        include: [
            { model: Cinema, include: [{ model: Cineplex }] },
            { model: Film }
        ]
    });

    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtime, allCinemas, allFilms });
});

// [POST] /admin/showtime/create
router.post('/showtime/create', async function (req, res) {
    //Chưa kiểm tra các điều kiện khi thêm
    const { cinemaID, filmID, showtimeDate, beginTime, showtimePrice } = req.body;

    await Showtime.create({
        showtime_Date: showtimeDate,
        showtime_Begin: beginTime,
        showtime_Price: showtimePrice,
        showtime_Film: filmID,
        showtime_Cinema: cinemaID,
    });

    console.log(cinemaID, filmID, showtimeDate, beginTime, showtimePrice);
    res.redirect('back');
});

// [GET] /admin/showtime/delete/id
router.get('/showtime/delete/:id', async function (req, res) {
    const id = Number(req.params.id);
    await Showtime.destroy({ where: { showtime_ID: id } });
    res.redirect('back');
});

// [POST] /admin/showtime/update/id
router.post('/showtime/update/:id', async function (req, res) {
    const id = Number(req.params.id);
    const { cinemaID, filmID, showtimeDate, beginTime, showtimePrice } = req.body;

    // const updatedShowtime = await Showtime.findByPk(id);
    if (showtimeDate) {
        await Showtime.update({ showtime_Date: showtimeDate, }, { where: { showtime_ID: id } })
    }
    if (beginTime) {
        Showtime.update({ showtime_Begin: beginTime, }, { where: { showtime_ID: id } })
    }

    Showtime.update({
        showtime_Price: showtimePrice,
        showtime_Film: filmID,
        showtime_Cinema: cinemaID,
    }, { where: { showtime_ID: id } });

    // if (showtimeDate) {
    //     updatedShowtime.showtime_Date = showtimeDate;
    // }

    // if (beginTime) {
    //     updatedShowtime.showtime_Begin = beginTime;
    // }

    // updatedShowtime.showtime_Price = showtimePrice;
    // updatedShowtime.showtime_Film = filmID;
    // updatedShowtime.showtime_Cinema = cinemaID;

    // await updatedShowtime.save();


    res.redirect('back');
});


// HIỆN SHOWTIMES CỦA MỘT BỘ PHIM CỤ THỂ
// [GET] /admin/showtime/film/id
router.get('/showtime/film/:id', async function (req, res) {
    const filmID = Number(req.params.id);
    // showtime by film
    const showtimesByFilm = await Showtime.findAll(
        {
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            where: { showtime_Film: filmID },
            order: [['showtime_Date', 'ASC']],
        },
    );

    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtimesByFilm, allCinemas, allFilms });
});


// HIỆN SHOWTIMES CỦA MỘT BỘ RẠP CỤ THỂ
// [GET] /admin/showtime/cinema/id
router.get('/showtime/cinema/:id', async function (req, res) {
    const cinemaID = Number(req.params.id);
    // showtime by cinema
    const showtimesByCinema = await Showtime.findAll(
        {
            include: [
                { model: Cinema, include: [{ model: Cineplex }] },
                { model: Film },

            ],
            where: { showtime_Cinema: cinemaID },
        },
    );
    const allCinemas = await Cinema.findAll({
        include: [{
            model: Cineplex,
        }],
    });
    const allFilms = await Film.findAll();

    res.render('admin', { showtimesByCinema, allCinemas, allFilms });
    // console.log(
    //     showtimesByCinema
    // )
    // res.render('admin', showtimesByCinema);
});




router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

//statistical
module.exports = router;