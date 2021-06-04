const Router = require('express').Router;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const user = require('../models/User.js');
const ticket = require('../models/Ticket.js');
const Cinema = require('../models/Cinema.js');
const Cineplex = require('../models/Cineplex.js');
const Film = require('../models/Film.js');
const timeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const router = new Router();
var multer = require('multer');
var formidable = require('formidable');



const upload = multer({ dest: __dirname + '/uploads/images' });

router.get('/', async function (req, res) {
    const { Admin } = req.session;
    var D = new Date();
    var month = D.getMonth() + 1;
    var year = D.getFullYear() + 1;
    var F = new Date();
    F.setDate(1);
    if (Admin) {
        // tính theo film
        const TongTienCuaXuatChieu = await ticket.findAll({
            attributes: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
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

        res.render('admin.ejs', { thuocTinhFilm, thuocTinhCumRap });
    }
    else {
        res.redirect('/');
    }
});
router.post('/', async function (req, res) {
    const { Admin } = req.session;
    const { txtDateOne, txtDateTwo } = req.body;
    if (Admin) {
        // tính theo film
        const TongTienCuaXuatChieu = await ticket.findAll({
            attributes: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID', [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'], [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc']],
            group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
            where: {

            },
            include: [
                {
                    model: CinemaTimeShow, where: {
                        cinemaTimeShow_Date: {
                            [Op.between]: [txtDateOne, txtDateTwo],
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
                            [Op.between]: [txtDateOne, txtDateTwo],
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

        res.render('admin.ejs', { thuocTinhFilm, thuocTinhCumRap });
    }
    else {
        res.redirect('/');
    }
});
router.get('/logout', async function (req, res) {
    delete req.session.Admin;
    res.redirect('/');
});


//cinema 
router.get('/update/cinema', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        const cinema = await Cinema.findAll({
            include: [{
                model: Cineplex,
            }]
        });
        const Adress = await Cineplex.findAll({

        });

        res.render('admin.ejs', { cinema, Adress });
    }
    else {
        res.redirect('/');
    }
});
router.get('/delete/cinema/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        await Cinema.destroy({
            where: {
                cinema_ID: id,
            }
        }).then(function () {
            res.redirect('/admin/update/cinema/');
        }).catch(function () {
            res.render('404NotFound.ejs');
        });
    }
    else {
        res.redirect('/');
    }
});
router.get('/update/cinema/:id', async function (req, res) {
    res.render('404NotFound.ejs');
});
router.post('/update/cinema/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        var { txtCinemaName, txtCinemaType, txtCinemaLength, txtCinemaWidth, txtCineplexName } = req.body;
        var cineplex_Name_id = await Cineplex.findOne({
            where: {
                cineplex_Name: {
                    [Op.substring]: txtCineplexName,
                }
            }
        });
        if (cineplex_Name_id) {
            await Cinema.update({
                cinema_Name: txtCinemaName,
                cinema_Type: txtCinemaType,
                cinema_Length: txtCinemaLength,
                cinema_Width: txtCinemaWidth,
                CineplexCineplexID: cineplex_Name_id.dataValues.cineplex_ID
            },
                {
                    where: {
                        cinema_ID: id,
                    },
                }).then(function () {
                    res.redirect('/admin/update/cinema/');
                }).catch(function () {
                    res.render('404NotFound.ejs');
                });
        } else {
            res.redirect('/admin');
        }
    }
    else {
        res.redirect('/');
    }
});
router.post('/create/cinema/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        var { txtCinemaName, txtCinemaType, txtCinemaLength, txtCinemaWidth, txtCineplexName } = req.body;
        const cineplex_Name_id = await Cineplex.findOne({
            where: {
                cineplex_ID: txtCineplexName,
            }
        }
        ).catch(function () {
            console.log('co loi gi do roi m oi ');
        });


        if (await cineplex_Name_id) {
            await Cinema.create({
                cinema_Name: txtCinemaName,
                cinema_Type: txtCinemaType,
                cinema_Length: txtCinemaLength,
                cinema_Width: txtCinemaWidth,
                CineplexCineplexID: cineplex_Name_id.dataValues.cineplex_ID
            }).then(function () {
                res.redirect('/admin/update/cinema');
            }).catch(function (err) {
                console.log(err);
                res.render('404NotFound.ejs');
            });
        } else {
            res.redirect('/admin');
        }
    } else {
        res.redirect('/');
    }
});
router.get('/create/cinema/', async function (req, res) {
    res.render('404NotFound.ejs');
});



//user
router.get('/update/user', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        const userAll = await user.findAll({

        });
        res.render('admin.ejs', { userAll });
    }
    else {
        res.redirect('/');
    }
});
router.post('/update/user/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        var { txtUserEmail, txtUserName, txtUserNumberPhone } = req.body;
        await user.update({
            user_Email: txtUserEmail,
            user_Name: txtUserName,
            user_NumberPhone: txtUserNumberPhone,
        }, {
            where: {
                user_ID: id,
            },
        }).then(() => {
            res.redirect('/admin/update/user/');
        }).catch(() => {
            res.render('404NotFound.ejs');
        });
    } else {
        res.redirect('/');
    }
});
router.get('/update/user/:id', async function (req, res) {
    res.render('404NotFound.ejs');
});
router.get('/delete/user/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        await user.destroy({
            where: {
                user_ID: id,
            }
        }).then(function () {
            res.redirect('/admin/update/user/');
        }).catch(function (err) {
            res.render('404NotFound.ejs');
        });
    } else {
        res.redirect('/');
    }
});



//film
router.get('/update/film/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        const filmAll = await Film.findAll({
            order: [
                ['film_ID', 'ASC']
            ]
        });
        res.render('admin.ejs', { filmAll });
    }
    else {
        res.redirect('/');
    }
});

router.post('/update/film/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = req.params.id;
    if (Admin) {
        res.redirect('/admin/');
    } else {
        res.redirect('/');
    }
});


router.get('/delete/film/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        await Film.destroy({
            where: {
                film_ID: id,
            },
        });
        res.redirect('/admin/update/film/');
    } else {
        res.redirect('/');
    }
});

// [POST] /admin/create/film
router.post('/create/film/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        var form = new formidable.IncomingForm();
        await form.parse(req, function (err, filds, files) {
            var oldpath = "dasdasdas";
            var newpath = 'public/image' + file.filetoupload.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        });
        var { txtFilmName, txtFilmDatePublic, txtFilmTime, txtFilmImage } = req.body;
        if (form) {
            await Film.create({
                film_Name: txtFilmName,
                film_Image: '/public/image/' + txtFilmImage,
                film_DatePublic: txtFilmDatePublic,
                film_Time: txtFilmTime,
            });
            res.redirect('/admin/update/film');
        } else {
            console.log("loi cmnr 2");
            res.redirect('/admin/update/film');
        }
    }
});


router.get('/create/film/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        res.redirect('/admin/update/film');
    } else {
        res.redirect('/');
    }
});


// Cineplex 
router.get('/update/cineplex', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
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
        }).catch(async function () {
            console.log('da bi loi');
            res.redirect('/admin');
        });
        res.render('admin.ejs', { cineplex });
    } else {
        res.redirect('/');
    }
});
router.get('/delete/cineplex/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        await Cineplex.destroy({
            where: {
                cineplex_ID: id,
            }
        });
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});
router.post('/update/cineplex/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        var { txtCineplexName, txtCineplexAdress } = req.body;
        await Cineplex.update({
            cineplex_Name: txtCineplexName,
            cineplex_Adress: txtCineplexAdress,
        }, {
            where: {
                cineplex_ID: id,
            }
        });
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});
router.get('/update/cineplex/:id', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});
router.post('/create/cineplex/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        var { cineplex_Name, cineplex_Adress } = req.body;
        await Cineplex.create({
            cineplex_Name,
            cineplex_Adress,
        });
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});
router.get('/create/cineplex/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});


//CinemaTimeShow
router.get('/update/cinemaTimeShow/cinema/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    req.session.cinemaID = id;
    if (Admin) {
        const loi = req.session.loi;
        const timeShowCinemaIDcinema = await CinemaTimeShow.findAll({
            where: {
                cinema_ID: id
            }
            , include: [
                { model: Cinema },
                { model: Film },
                { model: timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({
            where: {
                cinema_ID: id,
            }
        });
        const TimeShow = await timeShow.findAll({

        });
        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where: {
                film_DatePublic: {
                    [Op.lte]: dateNow,
                },
                film_Public: true,
            }
        });
        res.render('admin.ejs', { timeShowCinemaIDcinema, cinemaAll, filmCinemaTimeShow, TimeShow, loi });
    }
    else {
        res.redirect('/');
    }
});
router.get('/update/cinemaTimeShow/film/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    req.session.cinemaID = id;
    if (Admin) {
        const loi = req.session.loi;
        const timeShowCinemaIDcinema = await CinemaTimeShow.findAll({
            where: {
                film_ID: id
            }
            , include: [
                { model: Cinema },
                { model: Film },
                { model: timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({

        });
        const TimeShow = await timeShow.findAll({

        });

        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where: {
                film_ID: id,
            }
        });
        res.render('admin.ejs', { timeShowCinemaIDcinema, cinemaAll, filmCinemaTimeShow, TimeShow });
    }
    else {
        res.redirect('/');
    }
});
router.post('/create/cinemaTimeShow/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        var { txtcinema_ID, txtCinemaTimeShow_Date, timeShowID, filmID } = req.body;
        console.log(txtCinemaTimeShow_Date);
        const cinemaTonTai = await CinemaTimeShow.findOne({
            where: {
                cinema_ID: txtcinema_ID,
                cinemaTimeShow_Date: txtCinemaTimeShow_Date,
                timeShow_ID: timeShowID,
            }
        }).catch(async function (err) {
            console.log(err);
        });
        if (cinemaTonTai) {
            req.session.loi = 'bạn đã nhập xuất chiếu xày rồi . xin mời nhập lại';
            res.redirect('/admin/update/cinemaTimeShow/cinema/' + String(txtcinema_ID));
        } else {
            await CinemaTimeShow.create({
                cinema_ID: txtcinema_ID,
                cinemaTimeShow_Date: txtCinemaTimeShow_Date,
                timeShow_ID: timeShowID,
                film_ID: filmID,
            }).then(async function () {
                await delete req.session.loi;
                res.redirect('/admin/update/cinemaTimeShow/cinema/' + String(txtcinema_ID));
            }).catch(async function () {
                req.session.loi = 'bạn đã nhập xuất chiếu xày rồi . xin mời nhập lại';
                res.redirect('/admin/update/cinemaTimeShow/cinema/' + String(txtcinema_ID));
            });
        }
    }
    else {
        res.redirect('/');
    }
});
router.get('/create/cinemaTimeShow/', async function (req, res) {
    const { Admin } = req.session;
    if (Admin) {
        res.redirect('/admin/update/cinemaTimeShow/');
    } else {
        res.redirect('/');
    }
});
router.get('/update/cinemaTimeShow/film/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if (Admin) {
        const timeShowCinemaIDfilm = await CinemaTimeShow.findAll({
            where: {
                film_ID: id,
            }
        });
        res.render('admin.ejs', { timeShowCinemaIDfilm })
    } else {
        res.redirect('/');
    }
});
router.get('/delete/cinemaTimeShow/cinema/:id', async function (req, res) {
    const { Admin } = req.session;
    const id = Number(req.params.id);
    const cinemaID = req.session;
    if (Admin) {
        await CinemaTimeShow.destroy({
            where: {
                cinemaTimeShow_ID: id,
            }
        });
        res.redirect('/update/cinemaTimeShow/cinema/' + String(cinemaID));
    }
    else {
        res.redirect('/');
    }
});


router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

//statistical
module.exports = router;