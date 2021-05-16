# NodeJS-Cinema-Booking
   **Đồ án môn học Lập Trình Web 2**
   
 #### Danh sách thành viên (3 thành viên)
       - Phan Thị Mỹ Duyên
       - Nguyễn Tuấn Tú
       - Nguyễn Võ Quang Vinh
  #### Mục tiêu: 
  - Xây	dựng	website	đặt	vé	xem	phim
 - Hệ thống	rạp	phim	bao	gồm	nhiều	cụm	rạp,	mỗi	cụm	rạp	bao	gồm	nhiều	rạp	chiếu	khác	
nhau
- Mỗi	rạp	có	một	cấu	hình	ghế theo	hình	chữ nhật:	hàng	A-Z,	cột	1-n
- Mỗi	phim	được	chiếu	ở hệ thống	rạp	bao	gồm	nhiều	suất	chiếu	khác	nhau	tại	nhiều	cụm	
rạp	khác	nhau
- Người	dùng	phải	đăng	nhập	vào	tài	khoản	để đặt	vé
- Mỗi	đặt	vé	có	thể bao	gồm	nhiều	ghế khác	nhau	của	một	suất	chiếu
-  Không	thể đặt trùng	ghế tại	cùng	một	suất	chiếu,	đặt	chỗ phải	xác	nhận	TẤT	CẢ các	ghế
thành	công	hoặc	thất	bại
- Quản	lý	cụm	rạp,	rạp,	phim,	suất	chiếu	và	thống	kê	doanh	thu	(cụm	rạp,	phim)
- Gửi	email	thông	báo	(mã	vé,	thông	tin	suất	chiếu)	sau	khi	đặt	vé	thành	công
 #### Chức năng: 
  - Người dùng:
    - Đăng	ký (xác	nhận	email),	đăng	nhập,	đăng	xuất	(email,	mật	khẩu),	quên	mật	khẩu	bằng	
email
        - Điểm	cộng:	đăng	nhập	bằng	Google,	Facebook
    - Quản	lý	thông	tin	cá	nhân	(email,	mật	khẩu,	họ tên,	số điện	thoại)
    - Trang	chủ hiển	thị các	phim	mới	được	công	chiếu và	phim	được	xem	nhiều	nhất
    - Tìm	các suất	chiếu	của	một	phim	theo	cụm	rạp	hoặc	tìm	các	suất	chiếu	của	tất	cả các	
phim	tại	một	rạp	nào	đó
        - Điểm	cộng:	Hiển	thị thông	tin	chi	tiết	phim	(giới	thiệu,	trailer)
        - Điểm	cộng:	Hiển	thị thông	tin	chi	tiết	cụm	rạp chiếu	phim	(hình	ảnh	giới	thiệu,	
các	rạp	có	trong	cụm,	bản	đồ Google	Maps dựa	vào	địa	chỉ)
    - Đặt	vé	xem	phim (chọn	suất	chiếu,	chọn	ghế,	xác	nhận)
      - Điểm	cộng:	Gửi	thông	tin	vé	qua	SMS
      - Điểm	cộng:	Tích	hợp	cổng	thanh	toán (Paypal,	Momo,	ZaloPay,	Grab…)
      - Điểm	cộng:	Barcode/QRCode cho	đặt	chỗ
    - Xem	lại	các	danh	sách	các	đặt	vé	trong	lịch	sử (ngày/giờ,	phim,	rạp/cụm	rạp,	ghế)
- Quản	lý
    - Có	phần	đăng	nhập	riêng,	có	thể sử dụng	chung	hoặc	riêng	hệ thống	người	dùng
    - Quản	lý	(thêm/xóa)	rạp (tên,	cấu	hình	ghế),	cụm	rạp (tên,	địa	chỉ),	phim (tên,	thời	lượng,	
    hình	ảnh	poster,	ngày	công	chiếu),	suất	chiếu (rạp,	thời	điểm	bắt	đầu,	thời	điểm	kết	
    thúc)
        - Điểm	cộng:	Nhiều	hình	ảnh	cho	một	phim, giới	thiệu, trailer
     - Thống	kê	doanh	thu	theo	cụm	rạp trong	khoảng	thời	gian	do	người	dùng	nhập
          - Cụm	rạp	CGV	Hùng	Vương	bán	được	2400	vé	với	doanh	thu	500.000.000	VND	từ
          ngày	01/03/2019 đến	30/04/2019
          - Cụm	rạp	CGV	Parkson…
          - Điểm	cộng:	Hiển	thị dạng	biểu	đồ (chart)
    - Thông	kê	doanh	thu	theo	phim trong	khoảng	thời	gian	do	người	dùng	nhập
         - Phim	Avenger:	Endgame	bán	được	50000	vé	với	doanh	thu	20.000.000.000	VND	
          từ ngày	25/04/2019 đến	10/05/2019
         - Điểm	cộng:	Hiển	thị dạng	biểu	đồ (chart)
  
