# Bản đồ CTĐT và Khung Năng lực số

Ứng dụng tạo dữ liệu website từ các biểu mẫu CTĐT/NLS. Mỗi ngành dùng một file cấu hình riêng cùng các file nguồn của ngành đó; dữ liệu đầu ra được tạo trong thư mục dự án hoặc thư mục triển khai đã cấu hình.

## Triển khai nhanh cho ngành mới

1. Sao chép mã nguồn dự án vào thư mục riêng của ngành.
2. Đặt các file nguồn của ngành vào thư mục đó. Tối thiểu cần:
   - Workbook ma trận NLS, có các sheet tra cứu khung, ma trận 6 miền, ma trận 24 NLTP và gợi ý/minh chứng.
   - Workbook ánh xạ CLO, có sheet ánh xạ theo mẫu chung.
   - Workbook BM03 và DOCX tóm tắt học phần là tùy chọn; bỏ trống nếu ngành chưa có các nguồn này.
3. Sửa `program_config.json`: cập nhật tên trường/khoa/ngành/khóa, tên các file nguồn, tên sheet (nếu khác) và thư mục xuất. Đường dẫn file trong cấu hình được tính từ thư mục chứa `program_config.json`.
4. Cài Python và các thư viện được liệt kê trong `requirements.txt`, sau đó chạy:

   ```powershell
   python build_data.py
   ```

   Hoặc chỉ định file cấu hình khác:

   ```powershell
   python build_data.py --config "D:\CTDT\NganhMoi\program_config.json"
   ```

5. Mở `index.html` để kiểm tra dữ liệu, tiêu đề và thông tin ngành trước khi đưa lên máy chủ web tĩnh. Nếu `outputDirectory` trỏ tới một thư mục triển khai riêng, thư mục đó cần có `index.html` và `app.js`; trình tạo sẽ đồng bộ dữ liệu vào trang tại đó.

## Rà soát và chỉnh sửa trực tiếp trên website

- Mở tab **Chỉnh Sửa & Phân Tích** để chọn học phần, cập nhật mức độ ở ma trận 6 miền, bật/tắt NLTP ở ma trận 24, sửa/thêm/xóa CLO cùng PI và phương pháp đánh giá, hoặc chỉnh tóm tắt và tài liệu tham khảo.
- Tab **Ma Trận Môn Học - PI** tổng hợp CLO theo từng môn học và PI, nhóm cột theo PLO, tô màu cảnh báo cho số CLO đã map ở từng môn, hiển thị số thứ tự và tổng theo PI ở hàng cuối. Phần rà soát bên dưới tổng hợp độ phủ môn/PLO/PI và gợi ý đối chiếu các môn chưa có CLO được map; kết quả là chỉ báo dữ liệu, không thay thế thẩm định chuẩn đầu ra.
- Nhấn **Lưu và phân tích lại** để lưu thay đổi học phần. Các ô NLTP ở bảng ma trận 24 lưu ngay khi bật/tắt. Dữ liệu được lưu trong bộ nhớ trình duyệt trên thiết bị hiện tại; thay đổi không tự ghi ngược vào workbook nguồn hay chia sẻ sang trình duyệt khác.
- Dùng **Sao lưu chỉnh sửa JSON** để chuyển thay đổi giữa máy hoặc lưu trữ; trên máy khác, mở đúng website/ngành rồi nhập file JSON. Tệp chỉ áp dụng cho đúng ngành.
- Dùng **Xuất báo cáo rà soát** để tải báo cáo HTML có đối chiếu dữ liệu gốc và dữ liệu sau chỉnh sửa, danh sách CLO thay đổi và các cảnh báo cấu trúc. Mở tệp HTML bằng trình duyệt, chọn **In → Lưu thành PDF** để tạo bản PDF tổng hợp làm tài liệu tham khảo khi cập nhật đề cương.
- **Khôi phục dữ liệu gốc** xóa toàn bộ chỉnh sửa được lưu trên trình duyệt cho ngành đang mở. Cảnh báo phân tích chỉ hỗ trợ rà soát tính nhất quán, không thay thế thẩm định học thuật.

## Cấu hình

- `metadata`: thông tin hiển thị của trường/khoa/ngành, khóa, khung áp dụng, ngày cập nhật và các chỉ tiêu tổng kết CTĐT; mục `downloads` khai báo các file được cung cấp để tải.
- `files`: file đầu vào. `mappingWorkbook` và `cloTemplate` là bắt buộc; `courseSummaries`, `coursePlan`, `distanceLearningData` có thể đặt `null`.
- `sheets`: tên các sheet nguồn; các giá trị mẫu tương ứng với biểu mẫu đang dùng.
- `courseSummaryPattern`: tùy chọn, biểu thức chính quy nhận diện tiêu đề học phần trong DOCX; mặc định nhận mã 6 chữ số, sau đó là dấu gạch ngang hoặc dấu phân cách khoảng trắng/tab.
- `courseCodeOverrides`: các ngoại lệ theo mã học phần như học phần tự chọn thiếu số tín chỉ hoặc mã học phần cũ cần đối chiếu. Xóa các ngoại lệ CNTT khi cấu hình cho ngành mới nếu không áp dụng.
- `outputDirectory`: nơi tạo/cập nhật `curriculum_data.json`, `data.js` và trang `index.html` nếu có.

Quy trình hiện tại hỗ trợ các ngành dùng chung cấu trúc biểu mẫu và quy ước dữ liệu. Nếu sheet/cột hoặc bố cục tài liệu nguồn khác mẫu, cần chuẩn hóa về biểu mẫu chung hoặc điều chỉnh bộ đọc dữ liệu trước khi chạy. Dữ liệu học từ xa chỉ được bật khi cấu hình có file `distanceLearningData`.

## Kiểm tra và cập nhật

Sau khi sinh dữ liệu, rà soát số học phần, ma trận 6 miền/24 năng lực, ánh xạ CLO, kế hoạch học tập và thông tin hiển thị. Khi sửa file nguồn, chạy lại lệnh build để cập nhật website; nên giữ mỗi ngành trong một bản sao/thư mục riêng để tránh ghi đè dữ liệu ngành khác.
