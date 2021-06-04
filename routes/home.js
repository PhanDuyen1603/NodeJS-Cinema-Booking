const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');
const User = require('../models/User.js');
const Cineplex = require('../models/Cineplex.js');
const Cinema = require('../models/Cinema.js');
const TimeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const Ticket = require('../models/Ticket.js');
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
router.get('/', async function (req, res) {
	var dateNow = Date.now();
	var user;
	const { user_Id } = req.session;
	if (user_Id) {
		user = await User.findOne({
			where: {
				user_ID: user_Id
			},
		});
	}
	const filmPublic = await Film.findAll({
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
	const filmNoPublic = await Film.findAll({
		where: {
			film_DatePublic: {
				[Op.gt]: dateNow,
			},
			film_Public: true,
		},
		order: [
			['film_DatePublic', 'ASC']
		],
	});
	const filmViewHigh = await Film.findAll({
		where: {
			film_DatePublic: {
				[Op.lte]: dateNow,
			},
			film_Public: true,
		},
		order: [
			['film_ViewCount', 'DESC'],
		]
	});

	const film = { filmPublic: filmPublic, filmNoPublic: filmNoPublic, filmViewHigh: filmViewHigh };
	res.render('home', { film, user });
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

router.get('/forgotPassword', function (req, res) {
	res.render('auth/forgotPassword');
});

router.get('/logout', function (req, res) {
	delete req.session.user_Id;
	res.redirect('/');
});





router.get('/phim', async function (req, res) {
	var dateNow = Date.now();
	var user;
	const { user_Id } = req.session;
	if (user_Id) {
		user = await User.findOne({
			where: {
				user_ID: user_Id
			},
		});
	}
	const filmDangChieu = await Film.findAll({
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
	const filmSapChieu = await Film.findAll({
		where: {
			film_DatePublic: {
				[Op.gt]: dateNow,
			},
			film_Public: true,
		},
		order: [
			['film_DatePublic', 'ASC']
		],
	});
	const filmXemNhieu = await Film.findAll({
		where: {
			film_DatePublic: {
				[Op.lte]: dateNow,
			},
			film_Public: true,
		},
		order: [
			['film_ViewCount', 'DESC'],
		]
	});
	const filmChieu = { filmDangChieu: filmDangChieu, filmSapChieu: filmSapChieu, filmXemNhieu: filmXemNhieu };
	res.render('home', { filmChieu, user });
});

router.get('/phim/:id', async function (req, res) {
	const id = Number(req.params.id);

	var viewCount_new = await Film.findOne({
		where: {
			film_ID: id,
		}
	})
	await Film.update(
		{ film_ViewCount: viewCount_new.dataValues.film_ViewCount + 1 },
		{
			where: {
				film_ID: id,
			}
		}
	)
	const filmID = await Film.findOne({
		where: {
			film_ID: id,
			film_Public: true,
		}
	});
	var user;
	const { user_Id } = req.session;
	if (user_Id) {
		user = await User.findOne({
			where: {
				user_ID: user_Id
			},
		});
	}
	var dateNow = Date.now();
	const filmDangChieu2 = await Film.findAll({
		where: {
			film_DatePublic: {
				[Op.lte]: dateNow,
			},
			'$film_ID$': { [Op.ne]: id },
			film_Public: true,
		},
		order: [
			['film_DatePublic', 'DESC']
		],
	});
	//console.log(filmDangChieu2);
	const cinema = await Cinema.findAll();
	const cineplex = await Cineplex.findAll();
	const cinemaTimeShow = await CinemaTimeShow.findAll({
		where: {
			film_ID: id,
		},
		order: [
			['cinema_ID', 'ASC'],
			['timeShow_ID', 'ASC'],
		],
		include: [
			{ model: Cinema },
			{ model: Film },
			{ model: TimeShow },
		]
	});

	//console.log(cinemaTimeShow);
	res.render('home', { filmID, user, filmDangChieu2, cinemaTimeShow, cinema, cineplex });
});


router.post('/phim/:id', async function (req, res) {
	const id_reqfilm = Number(req.params.id);

	var cinemaChosen = req.body.cinemaID;
	req.session.cinemaIDChosen = cinemaChosen;
	//console.log(cineplexIDChosen);
	res.redirect('/phim/muave/' + id_reqfilm);
});





router.get('/phim/muave/:id', async function (req, res) {
	const id_Chosen = Number(req.params.id);
	const { user_Id } = req.session;
	if (user_Id) {
		var user = await User.findOne({
			where: {
				user_ID: user_Id
			},
		});
		const cinemaTimeShow = await CinemaTimeShow.findOne({
			where: {
				cinemaTimeShow_ID: id_Chosen,
			},
			include: [
				{
					model: Cinema, include: [
						{ model: Cineplex },
					]
				},
				{ model: Film },
				{ model: TimeShow },
			]
		});
		const ticket = await Ticket.findAll({
			where: {
				cinemaTimeShow_ID: id_Chosen,
			},
			include: [
				{ model: CinemaTimeShow }
			],
			order: [
				['ticket_Chair', 'ASC'],
			]
		});
		if (ticket) {
			var i = 0;
			var ghe_da_dat = "";
			while (ticket[i]) {
				ghe_da_dat = ghe_da_dat + ticket[i].ticket_Chair;
				ghe_da_dat = ghe_da_dat + ", ";
				i++;
			}
			console.log("Chuỗi ghế đã đặt:")
			console.log(ghe_da_dat);
			res.render('users/muave.ejs', { user, cinemaTimeShow, ticket, ghe_da_dat });
		} else {
			res.render('users/muave.ejs', { user, cinemaTimeShow, ticket, ghe_da_dat });
		}
	} else {
		res.render('auth/login');
	}
});

router.post('/phim/muave/:id', async function (req, res) {
	var { txtUserEmail, txtUserPassword } = req.body;
	var UserSaiPass = 'abc';
	const user = await User.findOne({
		where: {
			user_Email: txtUserEmail,
		}
	});
	const id_req = String(req.params.id);
	if (!user) {
		res.render('auth/login', { UserSaiPass });
	}
	else {
		const match = await bcrypt.compare(txtUserPassword, user.user_Password);
		if (match) {
			req.session.user_Id = user.user_ID;
			res.redirect('/phim/muave/' + id_req);
		}
		else {
			res.render('auth/login', { UserSaiPass });
		}
	}
});

router.get('/phim/muave/comeback/:id', async function (req, res) {
	const id_req = String(req.params.id);
	res.redirect('/phim/' + id_req);
});

router.post('/phim/muave/thongtinve/:id', async function (req, res) {
	const id_cinemaTimeShow_req = Number(req.params.id);
	const user_Chosen = req.session;
	var { txtChair, txtChairType, txtTotalMoney } = req.body;

	var timeShow_Chosen = await CinemaTimeShow.findOne({
		where: {
			cinemaTimeShow_ID: id_cinemaTimeShow_req,
		},
		include: [
			{ model: Film },
			{ model: TimeShow },
			{
				model: Cinema, include: [
					{ model: Cineplex },
				]
			},
		],
	})
	var user = await User.findOne({
		where: {
			user_ID: user_Chosen.user_Id,
		}
	})

	/* Định dạng tiền */
	function format_number(num_format) {
		if (isNaN(num_format)) {
			return 0;
		};
		if (num_format == '') {
			return 0;
		};
		var string_num_format = new String(num_format);
		var result_df = "";
		var dem = 0;
		for (var i = string_num_format.length - 1; i >= 0; i--) {
			dem++;
			if (dem % 3 == 0) {
				result_df = result_df + string_num_format[i];
				result_df = result_df + ".";
			} else {
				result_df = result_df + string_num_format[i];
			}
		}
		var result = "";

		if (string_num_format.length % 3 == 0) {
			result_df = result_df.slice(0, (result_df.length - 1));
		}
		for (var j = result_df.length - 1; j >= 0; j--) {
			result = result + result_df[j];
		}

		return result;
	}

	/* Định dạng ngày/tháng/năm */
	function format_date(day_df) {
		var day = new Date(day_df);
		var day_result = "";
		day_result = day_result + day.getDay();
		day_result = day_result + "/";
		day_result = day_result + (day.getMonth() + 1);
		day_result = day_result + "/";
		day_result = day_result + day.getFullYear();

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
	var form = new formidable.IncomingForm();

	if (form) {
		var txtMave = "VNC_";
		txtMave = txtMave + timeShow_Chosen.dataValues.Cinema.Cineplex.cineplex_Name.slice(0, 1);
		txtMave = txtMave + timeShow_Chosen.dataValues.Cinema.cinema_Name.slice(0, 1);
		txtMave = txtMave + timeShow_Chosen.dataValues.Film.film_Name.slice(0, 1);
		txtMave = txtMave + user_Chosen.user_Id;
		var ve = await Ticket.max('ticket_Num', {
			where: {
				user_ID: user_Chosen.user_Id,
			},
		});

		if (ve > 0) {
			var num_of = ve + 1;
			txtMave = txtMave + num_of;
		} else {
			txtMave = txtMave + "1";
		}


		await Ticket.create({
			ticket_ID: txtMave,
			ticket_Chair: txtChair,
			ticket_ChairType: txtChairType,
			ticket_TotalMoney: txtTotalMoney,
			cinemaTimeShow_ID: id_cinemaTimeShow_req,
			user_ID: user_Chosen.user_Id,
		}).then(async function () {
			console.log("Đã lưu vào DB");
			req.session.user_Id = user_Chosen.user_Id;
			await sendEmail(user.user_Email, 'Thông tin vé', 'Mã vé: ' + txtMave + '\nPhim: ' + timeShow_Chosen.dataValues.Film.film_Name + '\nXuất chiếu: ' + timeShow_Chosen.dataValues.TimeShow.timeShow_Start + '\nNgày chiếu: ' + format_date(timeShow_Chosen.dataValues.cinemaTimeShow_Date) + '\nCụm rạp/Rạp: ' + timeShow_Chosen.dataValues.Cinema.Cineplex.cineplex_Name + ' / ' + timeShow_Chosen.dataValues.Cinema.cinema_Name + '\nLoại ghế: ' + txtChairType + '\nGhế: ' + txtChair + '\nGiá vé: ' + format_number(txtTotalMoney, 0) + ' ₫\n\nVNCinema xin chân thành cảm ơn bạn đã tin tưởng lựa chọn chúng tôi!');
			var number_phone_user = await User.findOne({
				where: {
					user_ID: user_Chosen.user_Id,
				}
			})
			var str_nb_user = new String(number_phone_user.dataValues.user_NumberPhone);
			var nb_user = "84" + str_nb_user.slice(1, str_nb_user.length);
			console.log(nb_user);
			const sms_from = 'VNCinema';
			const sms_to = nb_user;
			const sms_content = "Ban da dat ve thanh cong!\nMa ve: " + txtMave + "\nPhim: " + xoa_dau(timeShow_Chosen.dataValues.Film.film_Name) + "\nNgay chieu: " + format_date(timeShow_Chosen.dataValues.cinemaTimeShow_Date) + "\nCum rap/Rap: " + xoa_dau(timeShow_Chosen.dataValues.Cinema.Cineplex.cineplex_Name) + " / " + xoa_dau(timeShow_Chosen.dataValues.Cinema.cinema_Name) + "\nLoai ghe: " + xoa_dau(txtChairType) + "\nGhe: " + txtChair + "\nGia ve: " + format_number(txtTotalMoney, 0) + " ₫\nVNCinema Xin Cam On!\n";

			/*nexmo.message.sendSms(sms_from, sms_to, sms_content);*/

			res.render('users/da_muave.ejs', { timeShow_Chosen, txtChair, txtChairType, txtTotalMoney, txtMave });
		}).catch(async function (err) {
			console.log("Lỗi bắt được là:");
			console.log(err);
		});
	}
});

router.post('/phim/muave/thongtinve/back/:id', async function (req, res) {
	const req_cinemaTimeShow_ID = Number(req.params.id);
	var timeShow_Chosen = await CinemaTimeShow.findOne({
		where: {
			cinemaTimeShow_ID: req_cinemaTimeShow_ID,
		}
	});
	var film_id = timeShow_Chosen.film_ID;
	res.redirect('/phim/' + film_id);
});

module.exports = router;

router.get('/support', function (req, res) {
	const support = true;
	res.render('home', { support });
});

router.get('/intro', function (req, res) {
	const intro = true;
	res.render('home', { intro });
});