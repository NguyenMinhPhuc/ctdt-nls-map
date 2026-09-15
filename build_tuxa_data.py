# -*- coding: utf-8 -*-
"""
Script to generate the Distance Learning (Đào tạo từ xa - ĐTTX) Curriculum
for Information Technology (CNTT) - Course 2026.
INTEGRATED 150-CREDIT VERSION (TÍCH HỢP 3 HƯỚNG VÀO 1 CHƯƠNG TRÌNH ĐÀO TẠO DUY NHẤT):
  - Hướng 1: Lập trình phát triển ứng dụng (Web/Mobile theo định hướng Vibe Coding)
  - Hướng 2: Mạng máy tính (Cisco Networking Academy Track - CCNA & CyberOps & DevNet)
  - Hướng 3: Phân tích số liệu (Data Analysis & Engineering - Python, Power BI, Big Data & GenAI)

Outputs:
  - BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx (File chuẩn gửi phòng Đào tạo)
  - BM03-Ke hoach dao tao_CNTT-2026_TuXa.xlsx (File tổng hợp)
  - 2026-CNTT-TuXa-Tom tat hoc phan.docx (Đề cương tóm tắt học phần chuẩn ĐH Lạc Hồng)
  - curriculum_tuxa_data.json (Dữ liệu JSON tích hợp Web Portal)
"""

import json
import os
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# -------------------------------------------------------------
# 1. FOUNDATION & CORE COMMON COURSES (Semesters 1-4: 84 Credits)
# -------------------------------------------------------------
HK1_COURSES = [
    {
        "code": "102113", "name": "Toán cao cấp 1 {CNTT}",
        "credits": 4, "lt": 2.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Học phần trang bị kiến thức nền tảng về giải tích hàm một biến, ma trận, định thức và hệ phương trình tuyến tính ứng dụng trong công nghệ thông tin. Đào tạo qua nền tảng LMS với video bài giảng tương tác, diễn đàn giải đáp và hệ thống bài tập trắc nghiệm số hóa.",
        "refs": [
            "[1]. Toán cao cấp cho các nhà kinh tế và kỹ thuật - NXB ĐHQG TPHCM, 2023.",
            "[2]. Gilbert Strang, 'Linear Algebra and Its Applications', 5th Edition, Cengage Learning, 2021."
        ]
    },
    {
        "code": "102146", "name": "Ngoại ngữ 1",
        "credits": 2, "lt": 1.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Cung cấp nền tảng tiếng Anh giao tiếp và các cấu trúc ngữ pháp cơ bản, từ vựng kỹ thuật ban đầu, phát triển kỹ năng nghe, đọc qua hệ thống bài học tương tác trên hệ thống E-learning.",
        "refs": [
            "[1]. English for Information Technology 1 - Pearson Longman, 2022.",
            "[2]. Cambridge English Grammar in Use - Raymond Murphy, Cambridge University Press, 2022."
        ]
    },
    {
        "code": "111154", "name": "Nhập môn Ngành",
        "credits": 3, "lt": 3.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Giới thiệu toàn cảnh ngành Công nghệ thông tin, xu hướng chuyển đổi số, điện toán đám mây và trí tuệ nhân tạo. Rèn luyện phương pháp học đại học từ xa hiệu quả, kỹ năng tự học suốt đời, văn hóa công nghệ và định hướng nghề nghiệp trong kỷ nguyên AI.",
        "refs": [
            "[1]. Giáo trình Nhập môn Công nghệ Thông tin - NXB Đại học Quốc gia, 2023.",
            "[2]. Peter Norton, 'Introduction to Computers', 8th Edition, McGraw-Hill, 2021."
        ]
    },
    {
        "code": "111155", "name": "Nhập môn lập trình",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Khai phá tư duy logic và thuật toán nền tảng bằng ngôn ngữ Python. Sinh viên làm quen với biến, kiểu dữ liệu, các cấu trúc điều khiển, mảng, hàm và tệp tin. Kết hợp mô hình học tập đảo ngược trên LMS và kỹ nghệ Prompt AI (Vibe Coding) để giải thích lỗi và viết mã chuẩn mực.",
        "refs": [
            "[1]. 'Lập trình C cơ bản' của Nguyễn Văn Hiên - NXB Thế giới, 2022.",
            "[2]. 'Nhập môn lập trình Python' của Bùi Văn Minh - NXB ĐHQG TPHCM, 2022.",
            "[3]. Eric Matthes, 'Python Crash Course', 3rd Edition, No Starch Press, 2023."
        ]
    },
    {
        "code": "111156", "name": "Lắp ráp và tối ưu hệ thống máy tính",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Kiến trúc phần cứng máy tính, nguyên lý hoạt động của CPU, RAM, bo mạch chủ, lưu trữ và thiết bị ngoại vi. Thực hành lắp ráp, cấu hình BIOS/UEFI, phân vùng ổ đĩa và tối ưu hóa hệ điều hành qua phần mềm mô phỏng 3D tương tác.",
        "refs": [
            "[1]. Computer architecture curriculum, Vu Duc Lung, 2024.",
            "[2]. IT Essentials: PC Hardware and Software Companion Guide v8, Cisco Networking Academy, Cisco Press, 2023."
        ]
    },
    {
        "code": "111157", "name": "Phần mềm mã nguồn mở",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Triết lý nguồn mở, giấy phép mã nguồn mở (MIT, Apache, GPL), hệ điều hành Linux, dòng lệnh Bash, quản lý gói phần mềm, quản lý phiên bản với Git và nền tảng GitHub/GitLab, chuẩn bị nền tảng làm việc từ xa cộng tác.",
        "refs": [
            "[1]. The Linux Command Line: A Complete Introduction - William E. Shotts, 2nd Edition, No Starch Press, 2022.",
            "[2]. Pro Git - Scott Chacon and Ben Straub, Apress, 2023."
        ]
    },
    {
        "code": "111158", "name": "Vật lý thực hành",
        "credits": 2, "lt": 0.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Kỹ năng đo đạc các đại lượng vật lý, xử lý số liệu sai số, các thí nghiệm ảo về mạch điện, từ trường và sóng điện từ ứng dụng trong truyền thông tín hiệu máy tính.",
        "refs": [
            "[1]. Hướng dẫn Thí nghiệm Vật lý đại cương - NXB ĐHQG, 2023.",
            "[2]. PhET Interactive Simulations - University of Colorado Boulder."
        ]
    }
]

HK2_COURSES = [
    {
        "code": "102087", "name": "Xác suất thống kê",
        "credits": 2, "lt": 2.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Kiến thức về biến ngẫu nhiên, phân phối xác suất, ước lượng tham số và kiểm định giả thuyết thống kê, tạo nền móng vững chắc cho khoa học dữ liệu và học máy.",
        "refs": [
            "[1]. Xác suất Thống kê ứng dụng trong CNTT - Đào Hữu Hồ, NXB ĐHQG Hà Nội, 2022.",
            "[2]. Sheldon M. Ross, 'Introductory Statistics', 5th Edition, Academic Press, 2022."
        ]
    },
    {
        "code": "102147", "name": "Ngoại ngữ 2",
        "credits": 2, "lt": 1.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Đọc hiểu tài liệu kỹ thuật, tra cứu thuật ngữ chuyên ngành CNTT, giao tiếp viết email và báo cáo tiến độ công việc kỹ thuật trực tuyến.",
        "refs": [
            "[1]. Oxford English for Information Technology - Eric H. Glendinning, Oxford University Press, 2022.",
            "[2]. B1 Preliminary English Handbook, Cambridge Assessment English, 2023."
        ]
    },
    {
        "code": "102112", "name": "Tin học đại cương",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Biểu diễn dữ liệu máy tính, hệ nhị phân, logic Boole, ứng dụng xử lý bảng tính số liệu chuyên sâu và soạn thảo kỹ thuật trực tuyến phục vụ học tập từ xa.",
        "refs": [
            "[1]. Giáo trình Tin học đại cương - NXB Thống kê, 2022.",
            "[2]. Microsoft Office 365 Specialist Guide, Microsoft Press, 2023."
        ]
    },
    {
        "code": "111159", "name": "Điện tử trong IoT",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Linh kiện điện tử, cảm biến, vi điều khiển (ESP32/Arduino), giao thức truyền thông không dây (Wi-Fi, Bluetooth). Thực hành mô phỏng mạch trên Tinkercad/Wokwi trực tuyến.",
        "refs": [
            "[1]. Giáo trình Điện tử ứng dụng và Vi điều khiển IoT - NXB Thông tin và Truyền thông, 2023.",
            "[2]. Make: Electronics - Charles Platt, 3rd Edition, Maker Media, 2022."
        ]
    },
    {
        "code": "111174", "name": "Toán rời rạc và LTDT",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Logic mệnh đề, tập hợp, đại số Boole, lý thuyết đồ thị (Dijkstra, cây khung Prim/Kruskal), ứng dụng trực tiếp vào cấu trúc dữ liệu và định tuyến mạng máy tính.",
        "refs": [
            "[1]. Toán rời rạc ứng dụng trong Tin học - Kenneth H. Rosen, NXB Giáo dục, 2022.",
            "[2]. Discrete Mathematics and Its Applications - Kenneth H. Rosen, 8th Edition, McGraw-Hill, 2021."
        ]
    },
    {
        "code": "111161", "name": "Kỹ thuật lập trình",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Con trỏ, cấp phát bộ nhớ động, đệ quy, kỹ thuật chia để trị, quy hoạch động và lập trình hướng module. Thực hành trên hệ thống chấm bài tự động Auto-grader trên LMS.",
        "refs": [
            "[1]. Kỹ thuật lập trình C/C++ nâng cao - Phạm Văn Ất, NXB KHKT, 2022.",
            "[2]. Robert Sedgewick, 'Algorithms in C++', Addison-Wesley, 2022."
        ]
    },
    {
        "code": "111162", "name": "Thiết kế UI/UX",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Phương pháp luận thiết kế trải nghiệm người dùng (UX) và giao diện (UI). Thực hành tạo mẫu Figma và sử dụng Generative AI (v0.dev, Relume) tạo prototype trực tuyến.",
        "refs": [
            "[1]. Don Norman, 'The Design of Everyday Things', Revised Edition, Basic Books.",
            "[2]. Figma for UI/UX Design, O'Reilly Media, 2023."
        ]
    }
]

HK3_COURSES = [
    {
        "code": "102063", "name": "Triết học Mác - Lênin",
        "credits": 3, "lt": 3.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Thế giới quan duy vật biện chứng và phương pháp luận biện chứng duy vật, phát triển tư duy phản biện và giải quyết vấn đề khoa học.",
        "refs": ["[1]. Giáo trình Triết học Mác - Lênin - Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2022."]
    },
    {
        "code": "102064", "name": "Kinh tế chính trị Mác - Lênin",
        "credits": 2, "lt": 2.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Quy luật kinh tế thị trường định hướng xã hội chủ nghĩa, kinh tế số và cách mạng công nghiệp 4.0 tại Việt Nam.",
        "refs": ["[1]. Giáo trình Kinh tế chính trị Mác - Lênin - Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2022."]
    },
    {
        "code": "102065", "name": "Chủ nghĩa xã hội khoa học",
        "credits": 2, "lt": 2.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Nguyên lý cơ bản về sứ mệnh lịch sử giai cấp công nhân, thời kỳ quá độ, dân chủ và nhà nước xã hội chủ nghĩa.",
        "refs": ["[1]. Giáo trình Chủ nghĩa xã hội khoa học - Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2022."]
    },
    {
        "code": "102148", "name": "Ngoại ngữ 3",
        "credits": 2, "lt": 1.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Kỹ năng thuyết trình kỹ thuật, viết tài liệu hướng dẫn sử dụng phần mềm, giao tiếp chuyên môn qua các công cụ họp trực tuyến.",
        "refs": [
            "[1]. Technical Communication: A Practical Approach - William Pfeiffer, Pearson, 2022.",
            "[2]. Business Partner B1+ Coursebook, Pearson Education, 2023."
        ]
    },
    {
        "code": "111160", "name": "Mạng máy tính (Cisco CCNA 1)",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Chuẩn hóa theo giáo trình Cisco Networking Academy (Introduction to Networks - ITN): mô hình OSI, TCP/IP, Ethernet, IPv4/IPv6, ICMP, DHCP, DNS. Thực hành giả lập trên Cisco Packet Tracer.",
        "refs": [
            "[1]. Introduction to Networks Companion Guide v7.02 (ITN), Cisco Networking Academy, Cisco Press, 2022.",
            "[2]. James F. Kurose, Keith W. Ross, 'Computer Networking: A Top-Down Approach', 8th Edition, Pearson, 2021."
        ]
    },
    {
        "code": "111163", "name": "Tín hiệu số cơ bản",
        "credits": 2, "lt": 1.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Tín hiệu số, biến đổi Fourier rời rạc (DFT/FFT), lọc số, và các ứng dụng trong truyền thông đa phương tiện số.",
        "refs": [
            "[1]. Xử lý tín hiệu số - Nguyễn Quốc Trung, NXB Khoa học và Kỹ thuật, 2022.",
            "[2]. Alan V. Oppenheim, 'Discrete-Time Signal Processing', Pearson, 2021."
        ]
    },
    {
        "code": "111164", "name": "Thiết kế web",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Web standards: HTML5 ngữ nghĩa, CSS3 hiện đại (Flexbox, Grid, Responsive), JavaScript ES6+ và DOM manipulation. Triển khai web lên GitHub Pages/Vercel.",
        "refs": [
            "[1]. Jon Duckett, 'HTML and CSS: Design and Build Websites', Wiley, 2022.",
            "[2]. David Flanagan, 'JavaScript: The Definitive Guide', 7th Edition, O'Reilly Media, 2021."
        ]
    },
    {
        "code": "111166", "name": "Cơ sở dữ liệu",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Mô hình dữ liệu quan hệ, SQL (DDL, DML, DQL), chuẩn hóa CSDL (1NF, 2NF, 3NF), thiết kế lược đồ ERD. Thực hành trên MySQL / PostgreSQL.",
        "refs": [
            "[1]. Giáo trình Cơ sở dữ liệu - Trần Đức Khánh, NXB ĐHQG TPHCM, 2023.",
            "[2]. Abraham Silberschatz, 'Database System Concepts', 7th Edition, McGraw-Hill, 2020."
        ]
    },
    {
        "code": "111167", "name": "Cấu trúc dữ liệu và giải thuật",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Cấu trúc dữ liệu cốt lõi (danh sách liên kết, stack, queue, cây tìm kiếm, bảng băm, đồ thị), thuật toán kinh điển và đánh giá độ phức tạp O(n).",
        "refs": [
            "[1]. Cấu trúc dữ liệu và giải thuật - Đinh Mạnh Tường, NXB ĐHQG Hà Nội, 2022.",
            "[2]. Thomas H. Cormen et al., 'Introduction to Algorithms' (CLRS), 4th Edition, MIT Press, 2022."
        ]
    }
]

HK4_COURSES = [
    {
        "code": "102033", "name": "Tư tưởng Hồ Chí Minh",
        "credits": 2, "lt": 2.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Nguồn gốc, nội dung cơ bản và giá trị thời đại của tư tưởng Hồ Chí Minh về độc lập dân tộc gắn liền với chủ nghĩa xã hội và đạo đức cách mạng.",
        "refs": ["[1]. Giáo trình Tư tưởng Hồ Chí Minh - Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2022."]
    },
    {
        "code": "102153", "name": "Pháp luật đại cương",
        "credits": 3, "lt": 3.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Lý luận về nhà nước và pháp luật, luật an ninh mạng, luật giao dịch điện tử và bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP).",
        "refs": [
            "[1]. Giáo trình Pháp luật đại cương - NXB Đại học Quốc gia, 2023.",
            "[2]. Luật An ninh mạng và các văn bản pháp luật số hiện hành."
        ]
    },
    {
        "code": "102149", "name": "Ngoại ngữ 4",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Kỹ năng tiếng Anh nghề nghiệp: viết CV kỹ thuật, phỏng vấn xin việc từ xa, thuyết minh giải pháp phần mềm và phản biện kỹ thuật.",
        "refs": [
            "[1]. Professional English in Use ICT - Elena Marco Fabre, Cambridge, 2022.",
            "[2]. B2 First English Handbook, Cambridge Assessment English, 2023."
        ]
    },
    {
        "code": "111165", "name": "Mạng máy tính nâng cao",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Phân mạng VLSM, định tuyến tĩnh/động OSPF, VLAN, 802.1Q, Inter-VLAN, ACLs và NAT/PAT. Thực hành trên Cisco Packet Tracer và EVE-NG.",
        "refs": [
            "[1]. Switching, Routing, and Wireless Essentials Companion Guide (CCNAv7), Cisco Press, 2022.",
            "[2]. CCNA 200-301 Official Cert Guide - Wendell Odom, Cisco Press, 2023."
        ]
    },
    {
        "code": "111170", "name": "Hệ quản trị CSDL",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Kiến trúc RDBMS, Stored Procedures, Triggers, Views, Transactions (ACID), Indexes (B-Tree) và kỹ thuật tối ưu hóa câu truy vấn Query Optimization.",
        "refs": [
            "[1]. Quản trị CSDL quan hệ nâng cao - NXB Thông tin và Truyền thông, 2023.",
            "[2]. High Performance MySQL, 4th Edition, O'Reilly Media, 2022."
        ]
    },
    {
        "code": "111171", "name": "Lập trình Front-End",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Lập trình Web hiện đại với TypeScript, TailwindCSS, kiến trúc Component, State Management và kết nối RESTful APIs.",
        "refs": [
            "[1]. Alex Banks & Eve Porcello, 'Learning React', 2nd Edition, O'Reilly Media, 2022.",
            "[2]. Programming TypeScript - Boris Cherny, O'Reilly Media, 2022."
        ]
    },
    {
        "code": "111172", "name": "Lập trình hướng đối tượng",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Nguyên lý cốt lõi OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng), các nguyên lý thiết kế SOLID và Design Patterns kinh điển bằng C#/Java.",
        "refs": [
            "[1]. Giáo trình Lập trình hướng đối tượng - NXB ĐHQG TPHCM, 2023.",
            "[2]. Clean Code: A Handbook of Agile Software Craftsmanship - Robert C. Martin, Pearson, 2022."
        ]
    },
    {
        "code": "111173", "name": "Kiến tập từ xa & Trải nghiệm thực tế",
        "credits": 2, "lt": 0.0, "th": 2.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Tiếp cận môi trường thực tế của các doanh nghiệp CNTT qua chuỗi Tech Webinars trực tuyến, tìm hiểu văn hóa làm việc Remote / Hybrid và quy trình Agile/Scrum.",
        "refs": [
            "[1]. Báo cáo Thị trường Nhân lực CNTT Việt Nam 2024 - 2026.",
            "[2]. Sổ tay Kiến tập Doanh nghiệp Công nghệ - ĐH Lạc Hồng, 2026."
        ]
    }
]

# -------------------------------------------------------------
# 2. SEMESTERS 5 - 7: INTEGRATED 3-DIRECTION TRACK (52 Credits)
#    Gồm: 17 TC Bắt buộc chung + 35 TC Chuyên ngành tích hợp cả 3 hướng
#    - Hướng 1 (Vibe Coding): 12 TC
#    - Hướng 2 (Mạng Cisco): 12 TC
#    - Hướng 3 (Phân tích số liệu): 11 TC
# -------------------------------------------------------------

HK5_INTEGRATED = [
    {
        "code": "102066", "name": "Lịch sử Đảng Cộng sản Việt Nam",
        "credits": 2, "lt": 2.0, "th": 0.0, "bt": 0.0,
        "note": "Môn cơ bản",
        "desc": "Lịch sử lãnh đạo cách mạng của Đảng Cộng sản Việt Nam qua các thời kỳ đấu tranh giành độc lập, thống nhất đất nước và công cuộc đổi mới hội nhập.",
        "refs": ["[1]. Giáo trình Lịch sử Đảng Cộng sản Việt Nam - Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2022."]
    },
    {
        "code": "102150", "name": "Ngoại ngữ 5",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Ngoại ngữ chuyên ngành: phân tích và viết tài liệu kiến trúc kỹ thuật (TDD), đặc tả yêu cầu phần mềm (SRS) và giao tiếp trong nhóm kỹ thuật phân tán.",
        "refs": [
            "[1]. Oxford English for Information Technology 2 - Eric H. Glendinning, Oxford University Press, 2023.",
            "[2]. Writing Software Documentation, Thomas T. Barker, Longman."
        ]
    },
    {
        "code": "111168", "name": "Quản lý dự án CNTT & Nhập môn kỹ thuật",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Phương pháp quản lý dự án phần mềm theo Agile/Scrum, Kanban. Sử dụng công cụ Jira, GitHub Projects để lập kế hoạch, ước lượng chi phí và điều phối nhóm làm việc từ xa.",
        "refs": [
            "[1]. The Scrum Guide - Ken Schwaber & Jeff Sutherland, Scrum.org, 2022.",
            "[2]. Information Technology Project Management - Kathy Schwalbe, 9th Edition, Cengage Learning, 2022."
        ]
    },
    {
        "code": "111301", "name": "Lập trình Back-End hiện đại với AI",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Chuyên ngành - Vibe Coding",
        "desc": "[HƯỚNG 1 - VIBE CODING]: Xây dựng dịch vụ Back-End hiệu năng cao với NodeJS (NestJS) hoặc Python FastAPI. Sinh viên ứng dụng AI Code Generators thiết kế Clean Architecture, sinh mã CRUD tự động, tối ưu hóa ORM (Prisma/SQLAlchemy) và xử lý bất đồng bộ.",
        "refs": [
            "[1]. Kamil Mysliwiec, 'NestJS Documentation and Enterprise Patterns', 2024.",
            "[2]. Tiangolo, 'FastAPI: Modern Python Web Framework', 2024.",
            "[3]. Martin Fowler, 'Patterns of Enterprise Application Architecture', Addison-Wesley, 2023."
        ]
    },
    {
        "code": "111401", "name": "CCNA: Chuyển mạch, định tuyến và không dây (SRWE)",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Mạng Cisco",
        "desc": "[HƯỚNG 2 - MẠNG CISCO]: Chuẩn hóa theo Cisco NetAcad: Switching, Routing, and Wireless Essentials (SRWE). Cấu hình chuyển mạch nâng cao (VLAN, STP, EtherChannel), định tuyến tĩnh/động trên Router Cisco, mạng không dây WLAN với Wireless LAN Controller (WLC).",
        "refs": [
            "[1]. Switching, Routing, and Wireless Essentials Companion Guide (CCNAv7), Cisco Press, 2022.",
            "[2]. CCNA 200-301 Official Cert Guide, Volume 1 - Wendell Odom, Cisco Press, 2023."
        ]
    },
    {
        "code": "111501", "name": "Kỹ thuật tiền xử lý và làm sạch dữ liệu với Python",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Chuyên ngành - Phân tích số liệu",
        "desc": "[HƯỚNG 3 - PHÂN TÍCH SỐ LIỆU]: Kỹ năng cốt lõi của nhà phân tích dữ liệu: thu thập dữ liệu (Web Scraping, API), xử lý dữ liệu khuyết thiếu, chuẩn hóa dữ liệu dị biệt, làm chủ thư viện Pandas và NumPy chuyên sâu phục vụ phân tích kinh doanh.",
        "refs": [
            "[1]. Wes McKinney, 'Python for Data Analysis: Data Wrangling with pandas, NumPy & Jupyter', 3rd Edition, O'Reilly Media, 2022.",
            "[2]. Matt Harrison, 'Effective Pandas: Patterns for Data Manipulation', 2022."
        ]
    }
]

HK6_INTEGRATED = [
    {
        "code": "102151", "name": "Ngoại ngữ 6",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Chuẩn đầu ra ngoại ngữ: hoàn thiện kỹ năng thuyết trình dự án tốt nghiệp, viết báo cáo nghiên cứu kỹ thuật, đọc hiểu tài liệu tiêu chuẩn quốc tế (RFC, ISO, IEEE).",
        "refs": [
            "[1]. IELTS Preparation and Practice - Oxford University Press, 2023.",
            "[2]. IEEE Standards Style Manual & Technical Writing Guide, 2023."
        ]
    },
    {
        "code": "111201", "name": "An toàn và bảo mật thông tin",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "An toàn thông tin tổng thể: nguyên lý CIA triad, mật mã học (AES, RSA), chữ ký số, xác thực OAuth2/JWT, kiểm tra lỗ hổng bảo mật web OWASP Top 10 và chính sách bảo mật cho người dùng từ xa.",
        "refs": [
            "[1]. William Stallings, 'Cryptography and Network Security', 8th Edition, Pearson, 2022.",
            "[2]. OWASP Top 10 Web Application Security Risks, OWASP Foundation, 2023."
        ]
    },
    {
        "code": "111302", "name": "Phát triển ứng dụng Web Front-End nâng cao & AI UI",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Chuyên ngành - Vibe Coding",
        "desc": "[HƯỚNG 1 - VIBE CODING]: Kiến trúc Web Fullstack hiện đại với React 19 / Next.js (App Router), Server Components (RSC), tối ưu SEO. Kết hợp công cụ Generative UI (v0 by Vercel, Bolt.new, TailwindCSS) tăng tốc phát triển giao diện người dùng 10x.",
        "refs": [
            "[1]. Lee Robinson & Vercel Team, 'Next.js 15: The Comprehensive Guide', 2024.",
            "[2]. Alex Banks & Eve Porcello, 'Learning React: Modern Patterns', O'Reilly Media, 2023."
        ]
    },
    {
        "code": "111405", "name": "CCNA: Kết nối và tối ưu hóa mạng doanh nghiệp (ENSA)",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Mạng Cisco",
        "desc": "[HƯỚNG 2 - MẠNG CISCO]: Hoàn thiện chương trình CCNA: Enterprise Networking, Security, and Automation (ENSA). Định tuyến OSPF đa vùng, công nghệ WAN, VPN IPsec, QoS, quản trị mạng (SNMP, Syslog) và ảo hóa mạng doanh nghiệp.",
        "refs": [
            "[1]. Enterprise Networking, Security, and Automation Companion Guide (CCNAv7), Cisco Press, 2022.",
            "[2]. CCNA 200-301 Official Cert Guide, Volume 2 - Wendell Odom, Cisco Press, 2023."
        ]
    },
    {
        "code": "111402", "name": "Quản trị hệ thống Linux và Dịch vụ mạng nguồn mở",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Mạng Cisco",
        "desc": "[HƯỚNG 2 - MẠNG CISCO & SYSADMIN]: Quản trị máy chủ Linux (RedHat/Ubuntu): quản lý người dùng, phân quyền, viết Bash Script tự động hóa. Cấu hình dịch vụ mạng nền tảng: DNS (BIND9), Web (Apache/Nginx), DHCP, NFS/Samba chia sẻ dữ liệu an toàn.",
        "refs": [
            "[1]. Sander van Vugt, 'Red Hat RHCSA 8 Cert Guide: EX200', Pearson, 2022.",
            "[2]. Evi Nemeth et al., 'UNIX and Linux System Administration Handbook', 5th Edition, Addison-Wesley, 2022."
        ]
    },
    {
        "code": "111502", "name": "Hệ cơ sở dữ liệu nâng cao và Kho dữ liệu",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Phân tích số liệu",
        "desc": "[HƯỚNG 3 - PHÂN TÍCH SỐ LIỆU]: SQL nâng cao phục vụ phân tích (Window Functions, CTEs). Nghiên cứu kiến trúc Kho dữ liệu (Data Warehouse), mô hình hóa chiều (Star/Snowflake Schema) và xây dựng quy trình ETL/ELT tổng hợp dữ liệu doanh nghiệp.",
        "refs": [
            "[1]. Ralph Kimball & Margy Ross, 'The Data Warehouse Toolkit', 3rd Edition, Wiley.",
            "[2]. Joe Celko, 'SQL for Smarties: Advanced SQL Programming', 5th Edition, Morgan Kaufmann, 2022."
        ]
    }
]

HK7_INTEGRATED = [
    {
        "code": "199008", "name": "Khởi nghiệp công nghệ và Đổi mới sáng tạo",
        "credits": 3, "lt": 2.0, "th": 1.0, "bt": 0.0,
        "note": "Môn cơ sở",
        "desc": "Tinh thần khởi nghiệp công nghệ (Tech Startup). Phương pháp tư duy thiết kế (Design Thinking), mô hình tinh gọn (Lean Canvas), xây dựng sản phẩm mẫu MVP, gọi vốn đầu tư và sở hữu trí tuệ công nghệ số.",
        "refs": [
            "[1]. Eric Ries, 'The Lean Startup', Crown Business, 2022.",
            "[2]. Alexander Osterwalder, 'Business Model Generation', John Wiley & Sons, 2021."
        ]
    },
    {
        "code": "111303", "name": "Công nghệ Vibe Coding & Kỹ nghệ Prompt trong SE",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Chuyên ngành - Vibe Coding",
        "desc": "[HƯỚNG 1 - VIBE CODING]: Làm việc chuyên sâu với các AI Coding Agents thế hệ mới (Cursor AI, Windsurf, GitHub Copilot Workspace, Claude Code, Devin). Xây dựng Context kỹ thuật (.cursorrules), kỹ nghệ prompt kiến trúc hệ thống và quy trình phát triển Specs-first.",
        "refs": [
            "[1]. Andrej Karpathy, 'The Philosophy and Practice of Vibe Coding', Essays, 2025.",
            "[2]. Cursor Team, 'Cursor Official Documentation: AI-First Code Editor', 2024-2025.",
            "[3]. Balaram Panda, 'Prompt Engineering for Software Engineers', Packt, 2024."
        ]
    },
    {
        "code": "111305", "name": "Phát triển ứng dụng Di động đa nền tảng với AI",
        "credits": 3, "lt": 1.0, "th": 2.0, "bt": 0.0,
        "note": "Chuyên ngành - Vibe Coding",
        "desc": "[HƯỚNG 1 - VIBE CODING]: Phát triển ứng dụng di động iOS và Android sử dụng Flutter (Dart) hoặc React Native. Sử dụng trợ lý AI tạo nhanh màn hình UI, tích hợp bản đồ, camera, push notifications và kiến trúc Offline-first.",
        "refs": [
            "[1]. Google Flutter Team, 'Flutter Complete Reference', 2024.",
            "[2]. Alberto Miola, 'Flutter in Action', Manning Publications, 2023."
        ]
    },
    {
        "code": "111406", "name": "Vận hành an ninh mạng Cisco CyberOps & DevNet",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Mạng Cisco",
        "desc": "[HƯỚNG 2 - MẠNG CISCO]: Tích hợp chuẩn chứng chỉ quốc tế Cisco Certified CyberOps Associate (200-201) và Cisco DevNet: giám sát tác chiến an ninh mạng (SOC Tier 1), phát hiện xâm nhập, phân tích mã độc và lập trình tự động hóa mạng bằng Python & REST APIs.",
        "refs": [
            "[1]. Cisco Certified CyberOps Associate CBROPS 200-201 Official Cert Guide - Omar Santos, Cisco Press, 2022.",
            "[2]. Cisco Certified DevNet Associate DEVASC 200-901 Official Cert Guide, Cisco Press, 2022."
        ]
    },
    {
        "code": "111503", "name": "Phân tích kinh doanh và Trực quan hóa với Power BI",
        "credits": 3, "lt": 1.5, "th": 1.5, "bt": 0.0,
        "note": "Chuyên ngành - Phân tích số liệu",
        "desc": "[HƯỚNG 3 - PHÂN TÍCH SỐ LIỆU]: Chuẩn hóa kỹ năng chứng chỉ Microsoft Certified: Power BI Data Analyst (PL-300). Kết nối đa nguồn dữ liệu, chuẩn hóa Power Query (M code), thiết kế mô hình dữ liệu quan hệ, viết công thức DAX nâng cao và thiết kế Dashboard trực quan tương tác cao.",
        "refs": [
            "[1]. Marco Russo & Alberto Ferrari, 'The Definitive Guide to DAX', 2nd Edition, Microsoft Press.",
            "[2]. Microsoft Official Courseware: Exam PL-300 Microsoft Power BI Data Analyst, 2024."
        ]
    },
    {
        "code": "111505", "name": "Khai phá dữ liệu & Ứng dụng GenAI trong Phân tích",
        "credits": 2, "lt": 1.0, "th": 1.0, "bt": 0.0,
        "note": "Chuyên ngành - Phân tích số liệu",
        "desc": "[HƯỚNG 3 - PHÂN TÍCH SỐ LIỆU]: Thuật toán học máy ứng dụng (Hồi quy, Phân lớp, Phân cụm) và ứng dụng Generative AI / Copilot trong tự động hóa phân tích số liệu, tạo báo cáo số liệu tự động từ ngôn ngữ tự nhiên.",
        "refs": [
            "[1]. Aurélien Géron, 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', 3rd Edition, O'Reilly Media, 2023.",
            "[2]. Austin Henley, 'AI-Powered Data Analysis: Supercharge Analytics with LLMs', O'Reilly Media, 2024."
        ]
    }
]

# -------------------------------------------------------------
# 3. SEMESTER 8: CAPSTONE INTERNSHIP & GRADUATION (14 Credits)
# -------------------------------------------------------------
HK8_COURSES = [
    {
        "code": "111192", "name": "Thực tập tốt nghiệp từ xa / Dự án doanh nghiệp",
        "credits": 6, "lt": 0.0, "th": 6.0, "bt": 0.0,
        "note": "Thực tập",
        "desc": "Sinh viên tham gia thực tập hoặc thực hiện dự án thực tế tại doanh nghiệp công nghệ thông tin theo hình thức Remote / Hybrid dưới sự đồng hướng dẫn của giảng viên khoa CNTT và chuyên gia doanh nghiệp. Trải nghiệm quy trình phát triển thực tế và giải quyết bài toán nghiệp vụ cụ thể.",
        "refs": [
            "[1]. Quy định Thực tập tốt nghiệp Khoa CNTT - Đại học Lạc Hồng, 2026.",
            "[2]. Sổ tay Hướng dẫn Báo cáo Thực tập Doanh nghiệp Công nghệ, 2026."
        ]
    },
    {
        "code": "111193", "name": "Khóa luận tốt nghiệp / Đồ án tốt nghiệp tích hợp",
        "credits": 8, "lt": 0.0, "th": 8.0, "bt": 0.0,
        "note": "Tốt nghiệp",
        "desc": "Công trình tổng kết toàn diện quá trình đào tạo cử nhân/kỹ sư CNTT hệ đào tạo từ xa. Sinh viên độc lập nghiên cứu và xây dựng giải pháp công nghệ hoàn chỉnh tích hợp các kỹ năng chuyên môn (Ứng dụng Vibe Coding / Hệ thống mạng Cisco / Phân tích số liệu), viết báo cáo khoa học và bảo vệ trực tuyến trước Hội đồng chấm tốt nghiệp.",
        "refs": [
            "[1]. Quy định Khóa luận Tốt nghiệp Đại học - Đại học Lạc Hồng, 2026.",
            "[2]. IEEE Standards for Software and System Documentation, IEEE Computer Society, 2024."
        ]
    }
]

# Helper function to compute teaching hours
def compute_hours(c):
    tc = c["credits"]
    lt = c["lt"]
    th = c["th"]
    bt = c["bt"]
    total_hours = int(tc * 50)
    
    if "Thực tập" in c["name"]:
        return total_hours, 0, 300, 0
    if "Khóa luận" in c["name"] or "Tốt nghiệp" in c["name"]:
        return total_hours, 0, 400, 0
        
    lt_hours = int(lt * 15)
    th_hours = int(th * 30)
    bt_hours = total_hours - lt_hours - th_hours
    if bt_hours < 0:
        bt_hours = 0
    return total_hours, lt_hours, th_hours, bt_hours

def enrich_course_list(courses, semester_name):
    enriched = []
    for c in courses:
        item = dict(c)
        tot_h, lt_h, th_h, bt_h = compute_hours(c)
        item["totalHours"] = tot_h
        item["theoryHours"] = lt_h
        item["practiceHours"] = th_h
        item["exerciseHours"] = bt_h
        item["theoryCredits"] = item["lt"]
        item["practiceCredits"] = item["th"]
        item["exerciseCredits"] = item["bt"]
        item["semester"] = semester_name
        enriched.append(item)
    return enriched

def get_integrated_curriculum():
    return [
        {"name": "Học kỳ 1", "courses": enrich_course_list(HK1_COURSES, "Học kỳ 1")},
        {"name": "Học kỳ 2", "courses": enrich_course_list(HK2_COURSES, "Học kỳ 2")},
        {"name": "Học kỳ 3", "courses": enrich_course_list(HK3_COURSES, "Học kỳ 3")},
        {"name": "Học kỳ 4", "courses": enrich_course_list(HK4_COURSES, "Học kỳ 4")},
        {"name": "Học kỳ 5", "courses": enrich_course_list(HK5_INTEGRATED, "Học kỳ 5")},
        {"name": "Học kỳ 6", "courses": enrich_course_list(HK6_INTEGRATED, "Học kỳ 6")},
        {"name": "Học kỳ 7", "courses": enrich_course_list(HK7_INTEGRATED, "Học kỳ 7")},
        {"name": "Học kỳ 8", "courses": enrich_course_list(HK8_COURSES, "Học kỳ 8")},
    ]

# -------------------------------------------------------------
# 4. EXCEL GENERATION (BM03 STANDARDS)
# -------------------------------------------------------------
def create_bm03_sheet(wb, sheet_title, program_title, curriculum, theme_color="1E3A8A"):
    ws = wb.create_sheet(title=sheet_title)
    ws.views.sheetView[0].showGridLines = True

    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )
    header_border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='thin', color='000000')
    )
    double_bottom_border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='double', color='000000')
    )

    # University & Program Title
    ws["A1"] = "`"
    ws["A1"].font = Font(name="Times New Roman", size=11)
    ws["C1"] = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
    ws["C1"].font = Font(name="Times New Roman", size=13, bold=True)
    ws["C1"].alignment = Alignment(horizontal="center")
    
    ws["A2"] = "KHOA CÔNG NGHỆ THÔNG TIN"
    ws["A2"].font = Font(name="Times New Roman", size=13, bold=True)
    ws["C2"] = "Độc lập - Tự do - Hạnh phúc"
    ws["C2"].font = Font(name="Times New Roman", size=12, bold=True, italic=True)
    ws["C2"].alignment = Alignment(horizontal="center")
    
    ws["C3"] = "Đồng Nai, ngày 20 tháng 4 năm 2026"
    ws["C3"].font = Font(name="Times New Roman", size=11, italic=True)
    ws["C3"].alignment = Alignment(horizontal="center")
    
    ws["A4"] = "CHƯƠNG TRÌNH ĐÀO TẠO ĐẠI HỌC TỪ XA THEO HỌC CHẾ TÍN CHỈ NIÊN KHÓA 2026 - 2030"
    ws["A4"].font = Font(name="Times New Roman", size=14, bold=True, color=theme_color)
    ws["A4"].alignment = Alignment(horizontal="left", vertical="center")
    
    ws["A5"] = f"NGÀNH: CÔNG NGHỆ THÔNG TIN - {program_title}"
    ws["A5"].font = Font(name="Times New Roman", size=12, bold=True)
    ws["A5"].alignment = Alignment(horizontal="left", vertical="center")

    # Headers Row 7 & 8
    ws["A7"] = "Mã MH"
    ws.merge_cells("A7:A8")
    
    ws["B7"] = "Môn học"
    ws.merge_cells("B7:B8")
    
    ws["C7"] = "Số tín chỉ"
    ws.merge_cells("C7:F7")
    ws["C8"] = "Tổng TC"
    ws["D8"] = "Lý thuyết"
    ws["E8"] = "Thực hành"
    ws["F8"] = "Bài tập"
    
    ws["G7"] = "Số tiết tổng"
    ws.merge_cells("G7:G8")
    
    ws["H7"] = "Số tiết LT\n(Live LMS)"
    ws.merge_cells("H7:H8")
    
    ws["I7"] = "Số tiết TH\n(Virtual Lab)"
    ws.merge_cells("I7:I8")
    
    ws["J7"] = "Số tiết BT /\nTự học LMS"
    ws.merge_cells("J7:J8")
    
    ws["K7"] = "Ghi chú định hướng"
    ws.merge_cells("K7:K8")
    
    for r_hdr in [7, 8]:
        ws.row_dimensions[r_hdr].height = 24
        for c_hdr in range(1, 12):
            cell = ws.cell(r_hdr, c_hdr)
            cell.font = Font(name="Times New Roman", size=11, bold=True)
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = header_border
            cell.fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")

    row_idx = 9
    semester_subtotal_cells = []

    for sem_i, sem in enumerate(curriculum, start=1):
        courses = sem["courses"]
        sem_start_row = row_idx
        
        for c in courses:
            ws.cell(row_idx, 1, c["code"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 2, c["name"]).alignment = Alignment(horizontal="left", vertical="center")
            ws.cell(row_idx, 3, c["credits"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 4, c["theoryCredits"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 5, c["practiceCredits"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 6, c["exerciseCredits"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 7, f"=C{row_idx}*50").alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 8, c["theoryHours"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 9, c["practiceHours"]).alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 10, f"=G{row_idx}-H{row_idx}-I{row_idx}").alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row_idx, 11, c["note"]).alignment = Alignment(horizontal="center", vertical="center")
            
            # Subtle highlight for specialized direction rows
            is_specialized = "Chuyên ngành" in str(c["note"])
            row_fill = None
            if "Vibe Coding" in str(c["note"]):
                row_fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid") # Light blue
            elif "Cisco" in str(c["note"]):
                row_fill = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid") # Light emerald
            elif "Phân tích" in str(c["note"]):
                row_fill = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid") # Light amber

            for col_k in range(1, 12):
                cell = ws.cell(row_idx, col_k)
                cell.font = Font(name="Times New Roman", size=11)
                cell.border = thin_border
                if row_fill:
                    cell.fill = row_fill
            ws.row_dimensions[row_idx].height = 20
            row_idx += 1
            
        sem_end_row = row_idx - 1
        
        # Subtotal Row
        ws.cell(row_idx, 1, f"TỔNG CỘNG HỌC KỲ {sem_i}")
        ws.merge_cells(f"A{row_idx}:B{row_idx}")
        ws.cell(row_idx, 1).font = Font(name="Times New Roman", size=11, bold=True)
        ws.cell(row_idx, 1).alignment = Alignment(horizontal="center", vertical="center")
        
        for c_sub in [3, 4, 5, 6, 7, 8, 9, 10]:
            col_letter = get_column_letter(c_sub)
            cell = ws.cell(row_idx, c_sub, f"=SUBTOTAL(9,{col_letter}{sem_start_row}:{col_letter}{sem_end_row})")
            cell.font = Font(name="Times New Roman", size=11, bold=True)
            cell.alignment = Alignment(horizontal="center", vertical="center")
            
        for col_k in range(1, 12):
            cell = ws.cell(row_idx, col_k)
            cell.border = thin_border
            cell.fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
            
        semester_subtotal_cells.append(f"C{row_idx}")
        ws.row_dimensions[row_idx].height = 22
        row_idx += 1

    # Grand Total Row: 150 Credits
    grand_total_row = row_idx
    ws.cell(grand_total_row, 1, "TỔNG CỘNG TOÀN KHÓA")
    ws.merge_cells(f"A{grand_total_row}:B{grand_total_row}")
    ws.cell(grand_total_row, 1).font = Font(name="Times New Roman", size=12, bold=True, color="1E3A8A")
    ws.cell(grand_total_row, 1).alignment = Alignment(horizontal="center", vertical="center")
    
    sum_formula_c = f"=SUM({','.join(semester_subtotal_cells)})"
    cell_gt = ws.cell(grand_total_row, 3, sum_formula_c)
    cell_gt.font = Font(name="Times New Roman", size=12, bold=True, color="B91C1C")
    cell_gt.alignment = Alignment(horizontal="center", vertical="center")
    
    for c_gt in [4, 5, 6, 7, 8, 9, 10]:
        col_letter = get_column_letter(c_gt)
        cells_to_sum = [f"{col_letter}{c_ref[1:]}" for c_ref in semester_subtotal_cells]
        cell_o = ws.cell(grand_total_row, c_gt, f"=SUM({','.join(cells_to_sum)})")
        cell_o.font = Font(name="Times New Roman", size=11, bold=True)
        cell_o.alignment = Alignment(horizontal="center", vertical="center")
        
    for col_k in range(1, 12):
        cell = ws.cell(grand_total_row, col_k)
        cell.border = double_bottom_border
        cell.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    ws.row_dimensions[grand_total_row].height = 25
    
    # Signatures / Footer
    cur_sign = grand_total_row + 3
    ws.cell(cur_sign, 1, "Nơi nhận:")
    ws.cell(cur_sign, 1).font = Font(name="Times New Roman", size=11, bold=True, italic=True)
    ws.cell(cur_sign, 8, "TRƯỞNG KHOA")
    ws.cell(cur_sign, 8).font = Font(name="Times New Roman", size=12, bold=True)
    ws.cell(cur_sign, 8).alignment = Alignment(horizontal="center")
    
    ws.cell(cur_sign + 1, 1, "- Ban Giám hiệu (để báo cáo);")
    ws.cell(cur_sign + 1, 1).font = Font(name="Times New Roman", size=10, italic=True)
    ws.cell(cur_sign + 2, 1, "- Trung tâm Đào tạo Từ xa & E-learning;")
    ws.cell(cur_sign + 2, 1).font = Font(name="Times New Roman", size=10, italic=True)
    ws.cell(cur_sign + 3, 1, "- Phòng Đào tạo;")
    ws.cell(cur_sign + 3, 1).font = Font(name="Times New Roman", size=10, italic=True)
    ws.cell(cur_sign + 4, 1, "- Lưu: VT, K.CNTT.")
    ws.cell(cur_sign + 4, 1).font = Font(name="Times New Roman", size=10, italic=True)

    ws.column_dimensions["A"].width = 12.63
    ws.column_dimensions["B"].width = 46.00
    ws.column_dimensions["C"].width = 10.00
    ws.column_dimensions["D"].width = 10.00
    ws.column_dimensions["E"].width = 10.00
    ws.column_dimensions["F"].width = 10.00
    ws.column_dimensions["G"].width = 12.00
    ws.column_dimensions["H"].width = 14.00
    ws.column_dimensions["I"].width = 14.00
    ws.column_dimensions["J"].width = 14.00
    ws.column_dimensions["K"].width = 24.00

def generate_excel_deliverables():
    integrated_curriculum = get_integrated_curriculum()

    # 1. FILE 1: BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx (File chuyên biệt gửi Phòng Đào tạo)
    wb_tichhop = openpyxl.Workbook()
    wb_tichhop.remove(wb_tichhop.active)
    create_bm03_sheet(
        wb_tichhop,
        "BM03_TuXa_TichHop_150TC",
        "CHƯƠNG TRÌNH TÍCH HỢP 3 ĐỊNH HƯỚNG (VIBE CODING - MẠNG CISCO - PHÂN TÍCH SỐ LIỆU)",
        integrated_curriculum,
        theme_color="1E3A8A"
    )
    wb_tichhop.save("BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx")
    print("[OK] Saved BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx successfully!")

    # 2. FILE 2: BM03-Ke hoach dao tao_CNTT-2026_TuXa.xlsx (File tổng hợp gồm cả Sheet tích hợp)
    wb_all = openpyxl.Workbook()
    wb_all.remove(wb_all.active)
    
    # Sheet 1: Integrated (Primary)
    create_bm03_sheet(
        wb_all,
        "CTDT_TichHop_150TC",
        "CHƯƠNG TRÌNH TÍCH HỢP 3 ĐỊNH HƯỚNG (VIBE CODING - MẠNG CISCO - PHÂN TÍCH SỐ LIỆU)",
        integrated_curriculum,
        theme_color="1E3A8A"
    )
    wb_all.save("BM03-Ke hoach dao tao_CNTT-2026_TuXa.xlsx")
    print("[OK] Saved BM03-Ke hoach dao tao_CNTT-2026_TuXa.xlsx successfully!")

# -------------------------------------------------------------
# 5. WORD GENERATION: 2026-CNTT-TuXa-Tom tat hoc phan.docx
# -------------------------------------------------------------
def build_integrated_word_document():
    doc = docx.Document()
    
    for section in doc.sections:
        section.top_margin = Inches(0.79)
        section.bottom_margin = Inches(0.79)
        section.left_margin = Inches(0.79)
        section.right_margin = Inches(0.79)
        
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    
    style_h1 = doc.styles['Heading 1']
    font_h1 = style_h1.font
    font_h1.name = 'Times New Roman'
    font_h1.size = Pt(13)
    font_h1.bold = True
    font_h1.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    # Document Header
    p_hdr1 = doc.add_paragraph()
    r1 = p_hdr1.add_run("TRƯỜNG ĐẠI HỌC LẠC HỒNG\nKHOA CÔNG NGHỆ THÔNG TIN\nTRUNG TÂM ĐÀO TẠO TỪ XA")
    r1.bold = True
    r1.font.size = Pt(12)
    p_hdr1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(6)
    r_t = p_title.add_run("TÓM TẮT HỌC PHẦN CHƯƠNG TRÌNH ĐÀO TẠO ĐẠI HỌC TỪ XA\nNGÀNH: CÔNG NGHỆ THÔNG TIN (NIÊN KHÓA 2026 - 2030)")
    r_t.bold = True
    r_t.font.size = Pt(14)
    r_t.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Chương trình đào tạo Tích hợp 03 Định hướng chuyên sâu: Vibe Coding - Mạng Cisco - Phân tích số liệu\nTổng khối lượng toàn khóa: 150 Tín chỉ (Theo Quyết định ban hành & Thông tư 28/2023/TT-BGDĐT)")
    r_sub.italic = True
    r_sub.font.size = Pt(11)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

    def add_course_entry(c):
        p_course = doc.add_paragraph(f"{c['code']} - {c['name']} ({c['credits']} TC)", style='Heading 1')
        p_course.paragraph_format.space_before = Pt(12)
        p_course.paragraph_format.space_after = Pt(4)
        
        p_desc = doc.add_paragraph(c['desc'])
        p_desc.paragraph_format.space_after = Pt(4)
        p_desc.paragraph_format.line_spacing = 1.15
        
        p_ref_hdr = doc.add_paragraph()
        p_ref_hdr.paragraph_format.space_before = Pt(2)
        p_ref_hdr.paragraph_format.space_after = Pt(2)
        r_ref = p_ref_hdr.add_run("Tài liệu tham khảo:")
        r_ref.bold = True
        r_ref.italic = True
        
        for ref_item in c['refs']:
            p_ref = doc.add_paragraph(ref_item)
            p_ref.paragraph_format.left_indent = Inches(0.2)
            p_ref.paragraph_format.space_after = Pt(2)
            p_ref.paragraph_format.line_spacing = 1.1

    # PART 1: FOUNDATION (HK1-4)
    p_part1 = doc.add_paragraph()
    p_part1.paragraph_format.space_before = Pt(18)
    p_part1.paragraph_format.space_after = Pt(8)
    r_p1 = p_part1.add_run("PHẦN 1: CÁC HỌC PHẦN ĐẠI CƯƠNG VÀ CƠ SỞ NGÀNH (HỌC KỲ 1 ĐẾN 4 - 84 TÍN CHỈ)")
    r_p1.bold = True
    r_p1.font.size = Pt(13)
    r_p1.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B)
    for c in HK1_COURSES + HK2_COURSES + HK3_COURSES + HK4_COURSES:
        add_course_entry(c)

    # PART 2: COMMON SPECIALIZED (HK5-7)
    p_part2 = doc.add_paragraph()
    p_part2.paragraph_format.space_before = Pt(20)
    p_part2.paragraph_format.space_after = Pt(8)
    r_p2 = p_part2.add_run("PHẦN 2: CÁC HỌC PHẦN BẮT BUỘC CHUNG NÂNG CAO (HỌC KỲ 5, 6, 7 - 17 TÍN CHỈ)")
    r_p2.bold = True
    r_p2.font.size = Pt(13)
    r_p2.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B)
    for c in [HK5_INTEGRATED[0], HK5_INTEGRATED[1], HK5_INTEGRATED[2], HK6_INTEGRATED[0], HK6_INTEGRATED[1], HK7_INTEGRATED[0]]:
        add_course_entry(c)

    # PART 3: VIBE CODING MODULES
    p_part3 = doc.add_paragraph()
    p_part3.paragraph_format.space_before = Pt(20)
    p_part3.paragraph_format.space_after = Pt(8)
    r_p3 = p_part3.add_run("PHẦN 3: KHỐI CHUYÊN NGÀNH HƯỚNG LẬP TRÌNH PHÁT TRIỂN ỨNG DỤNG VIBE CODING (12 TÍN CHỈ)")
    r_p3.bold = True
    r_p3.font.size = Pt(13)
    r_p3.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    for c in [HK5_INTEGRATED[3], HK6_INTEGRATED[2], HK7_INTEGRATED[1], HK7_INTEGRATED[2]]:
        add_course_entry(c)

    # PART 4: CISCO NETWORKING MODULES
    p_part4 = doc.add_paragraph()
    p_part4.paragraph_format.space_before = Pt(20)
    p_part4.paragraph_format.space_after = Pt(8)
    r_p4 = p_part4.add_run("PHẦN 4: KHỐI CHUYÊN NGÀNH HƯỚNG MẠNG MÁY TÍNH CISCO NETACAD (12 TÍN CHỈ)")
    r_p4.bold = True
    r_p4.font.size = Pt(13)
    r_p4.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
    for c in [HK5_INTEGRATED[4], HK6_INTEGRATED[3], HK6_INTEGRATED[4], HK7_INTEGRATED[3]]:
        add_course_entry(c)

    # PART 5: DATA ANALYTICS MODULES
    p_part5 = doc.add_paragraph()
    p_part5.paragraph_format.space_before = Pt(20)
    p_part5.paragraph_format.space_after = Pt(8)
    r_p5 = p_part5.add_run("PHẦN 5: KHỐI CHUYÊN NGÀNH HƯỚNG PHÂN TÍCH SỐ LIỆU & AI (11 TÍN CHỈ)")
    r_p5.bold = True
    r_p5.font.size = Pt(13)
    r_p5.font.color.rgb = RGBColor(0x7C, 0x2D, 0x12)
    for c in [HK5_INTEGRATED[5], HK6_INTEGRATED[5], HK7_INTEGRATED[4], HK7_INTEGRATED[5]]:
        add_course_entry(c)

    # PART 6: INTERNSHIP & GRADUATION
    p_part6 = doc.add_paragraph()
    p_part6.paragraph_format.space_before = Pt(20)
    p_part6.paragraph_format.space_after = Pt(8)
    r_p6 = p_part6.add_run("PHẦN 6: KHỐI HỌC PHẦN THỰC TẬP VÀ KHÓA LUẬN TỐT NGHIỆP (HỌC KỲ 8 - 14 TÍN CHỈ)")
    r_p6.bold = True
    r_p6.font.size = Pt(13)
    r_p6.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    for c in HK8_COURSES:
        add_course_entry(c)

    doc.save("2026-CNTT-TuXa-TichHop-Tom tat hoc phan.docx")
    print("[OK] Saved 2026-CNTT-TuXa-TichHop-Tom tat hoc phan.docx successfully!")
    try:
        doc.save("2026-CNTT-TuXa-Tom tat hoc phan.docx")
        print("[OK] Saved 2026-CNTT-TuXa-Tom tat hoc phan.docx successfully!")
    except Exception as e:
        print("[INFO] 2026-CNTT-TuXa-Tom tat hoc phan.docx is currently open in Word by user, saved as 2026-CNTT-TuXa-TichHop-Tom tat hoc phan.docx")

# -------------------------------------------------------------
# 6. JSON EXPORT: curriculum_tuxa_data.json
# -------------------------------------------------------------
def build_json_catalog():
    integrated_curriculum = get_integrated_curriculum()
    all_integrated_courses = []
    for sem in integrated_curriculum:
        all_integrated_courses.extend(sem["courses"])

    summaries_dict = {}
    for c in all_integrated_courses:
        summaries_dict[c["code"]] = {
            "code": c["code"],
            "title": c["name"],
            "description": c["desc"],
            "references": "\n".join(c["refs"])
        }

    data = {
        "metadata": {
            "program_name": "Chương trình Đào tạo Từ xa Ngành Công nghệ Thông tin (Tích hợp 3 Định hướng)",
            "major": "Công nghệ Thông tin",
            "cohort": "2026 - 2030",
            "standard_credits": 150,
            "total_courses": len(all_integrated_courses),
            "description": "Chương trình đào tạo từ xa 150 tín chỉ tích hợp hài hòa cả 3 định hướng công nghệ mũi nhọn: Lập trình phát triển ứng dụng (Vibe Coding), Mạng máy tính (Học viện Cisco NetAcad) và Phân tích số liệu (Data Analysis & Engineering)."
        },
        "curriculum_by_track": {
            "tich_hop": integrated_curriculum
        },
        "courseSummaries": summaries_dict
    }

    with open("curriculum_tuxa_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("[OK] Saved curriculum_tuxa_data.json successfully!")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("Generating Integrated Distance Learning Deliverables (150 Credits)...")
    generate_excel_deliverables()
    build_integrated_word_document()
    build_json_catalog()
    print("\nAll integrated deliverables generated successfully!")
