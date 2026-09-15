# -*- coding: utf-8 -*-
"""
Script to patch index.html and app.js with the Program Switcher UI
featuring the UNIFIED INTEGRATED 150-CREDIT DISTANCE LEARNING CURRICULUM
(Tích hợp cả 3 hướng: Vibe Coding, Mạng Cisco, Phân tích số liệu).
"""

import re
import os
import json

def update_frontend():
    # 1. READ FRESH COPIES OR BASES
    with open('curriculum_tuxa_data.json', 'r', encoding='utf-8') as f_tx:
        tuxa_data = json.load(f_tx)

    # 2. UPDATE APP.JS
    with open('app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    # Define clean state and switcher block
    state_block = """
let currentProgram = 'chinhquy'; // 'chinhquy' | 'tuxa'
let currentTuxaTrack = 'tich_hop'; // 'tich_hop' (Default)
let currentPlanSemester = 'all';
let currentPlanSearch = '';

function getActiveSummaries() {
  if (currentProgram === 'tuxa' && data.tuxa && data.tuxa.courseSummaries) {
    return data.tuxa.courseSummaries;
  }
  return data.courseSummaries || {};
}

function getActiveCoursePlan() {
  if (currentProgram === 'tuxa' && data.tuxa && data.tuxa.curriculum_by_track) {
    const trackSems = data.tuxa.curriculum_by_track[currentTuxaTrack] || data.tuxa.curriculum_by_track['tich_hop'] || [];
    const planMap = {};
    trackSems.forEach(s => {
      s.courses.forEach(c => {
        planMap[c.code] = c;
      });
    });
    return planMap;
  }
  return data.coursePlan || {};
}

function switchProgramMode(mode) {
  currentProgram = mode;
  const btnCq = document.getElementById('btn-prog-chinhquy');
  const btnTx = document.getElementById('btn-prog-tuxa');
  const badgeEl = document.getElementById('header-program-badge');

  if (mode === 'tuxa') {
    if (btnCq) {
      btnCq.className = 'px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5';
    }
    if (btnTx) {
      btnTx.className = 'px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-emerald-600 text-white shadow-md shadow-emerald-600/30 flex items-center space-x-1.5';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Hệ ĐTTX Tích Hợp - 150 TC';
      badgeEl.className = 'hidden md:inline-flex text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800';
    }
    showToast('Đã chuyển sang: Hệ ĐTTX Tích hợp 3 Hướng (150 Tín chỉ)', 'info');
  } else {
    if (btnCq) {
      btnCq.className = 'px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-sky-600 text-white shadow-md shadow-sky-600/30 flex items-center space-x-1.5';
    }
    if (btnTx) {
      btnTx.className = 'px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Khóa 2026 - 2030';
      badgeEl.className = 'hidden md:inline-flex text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800';
    }
    showToast('Đã chuyển sang: Hệ Chính quy (Khóa 2026 - 2030)', 'info');
  }

  selectedSummaryCode = null;
  renderBM03PlanTable();
  renderSummaryList();
}

function filterBM03Semester(sem) {
  currentPlanSemester = sem;
  renderBM03PlanTable();
}

function filterBM03Search(query) {
  currentPlanSearch = query.toLowerCase().trim();
  renderBM03PlanTable();
}

function renderBM03PlanTable() {
  const container = document.getElementById('bm03PlanTableContainer');
  const headerCard = document.getElementById('bm03-plan-header-card');
  if (!container) return;

  // Header Card
  if (headerCard) {
    if (currentProgram === 'tuxa') {
      headerCard.className = 'bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-white/10';
      headerCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              <i class="fa-solid fa-layer-group"></i> Hệ Đào Tạo Từ Xa (ĐTTX) - Chuẩn 150 Tín Chỉ
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-cubes-stacked text-emerald-400"></i> KẾ HOẠCH ĐÀO TẠO BM03 TÍCH HỢP 3 HƯỚNG CHUYÊN SÂU
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 mt-2 max-w-4xl leading-relaxed">
              Chương trình đào tạo từ xa 150 tín chỉ tích hợp trọn vẹn cả 3 mũi nhọn công nghệ: 
              <strong class="text-sky-300">Lập trình phát triển ứng dụng (Vibe Coding)</strong>, 
              <strong class="text-emerald-300">Mạng máy tính (Cisco NetAcad CCNA & CyberOps & DevNet)</strong> và 
              <strong class="text-amber-300">Phân tích số liệu (Data Warehouse, Power BI PL-300 & GenAI)</strong>.
            </p>
          </div>
          <div class="flex items-center space-x-2 flex-wrap gap-2">
            <a href="BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx" download class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-file-excel"></i>
              <span>Xuất File Excel BM03 Tích Hợp</span>
            </a>
            <a href="2026-CNTT-TuXa-TichHop-Tom tat hoc phan.docx" download class="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-file-word"></i>
              <span>Xuất Tóm Tắt Học Phần (.docx)</span>
            </a>
          </div>
        </div>
      `;
    } else {
      headerCard.className = 'bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-sky-800/40';
      headerCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-200 border border-sky-400/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              <i class="fa-solid fa-graduation-cap"></i> Hệ Chính Quy Khóa 2026 - 2030
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight">
              KẾ HOẠCH ĐÀO TẠO BM03 CHUẨN - NGÀNH CÔNG NGHỆ THÔNG TIN
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 mt-2 max-w-4xl leading-relaxed">
              Toàn bộ kế hoạch đào tạo 8 học kỳ theo học chế tín chỉ niên khóa 2026 - 2030 theo biểu mẫu BM03 quy định của Trường Đại học Lạc Hồng.
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="switchProgramMode('tuxa')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-laptop-code"></i>
              <span>Xem CTDT Từ Xa Tích Hợp (150 TC)</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Get Semesters Data
  let semestersList = [];

  if (currentProgram === 'tuxa' && data.tuxa && data.tuxa.curriculum_by_track) {
    semestersList = data.tuxa.curriculum_by_track['tich_hop'] || [];
  } else if (data.coursePlan) {
    const grouped = {};
    for (let i = 1; i <= 8; i++) {
      grouped[`Học kỳ ${i}`] = [];
    }
    Object.values(data.coursePlan).forEach(c => {
      const sem = c.semester || 'Học kỳ 1';
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push(c);
    });
    semestersList = Object.keys(grouped).map(k => ({
      name: k,
      courses: grouped[k]
    }));
  }

  if (currentPlanSemester !== 'all') {
    semestersList = semestersList.filter(s => s.name === currentPlanSemester);
  }

  if (semestersList.length === 0) {
    container.innerHTML = '<div class="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">Không tìm thấy dữ liệu học phần phù hợp.</div>';
    return;
  }

  let html = '';
  let grandTotalCredits = 0;
  let grandTotalHours = 0;

  semestersList.forEach((sem, s_idx) => {
    let courses = sem.courses || [];
    
    if (currentPlanSearch) {
      courses = courses.filter(c => 
        (c.code && c.code.toLowerCase().includes(currentPlanSearch)) ||
        (c.name && c.name.toLowerCase().includes(currentPlanSearch)) ||
        (c.note && c.note.toLowerCase().includes(currentPlanSearch))
      );
    }

    if (courses.length === 0 && currentPlanSearch) return;

    let semCredits = 0;
    let semLtHours = 0;
    let semThHours = 0;
    let semBtHours = 0;
    let semTotalHours = 0;

    courses.forEach(c => {
      semCredits += Number(c.credits) || 0;
      semLtHours += Number(c.theoryHours) || 0;
      semThHours += Number(c.practiceHours) || 0;
      semBtHours += Number(c.exerciseHours) || 0;
      semTotalHours += Number(c.totalHours) || 0;
    });

    grandTotalCredits += semCredits;
    grandTotalHours += semTotalHours;

    html += `
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Semester Header -->
        <div class="bg-slate-100 dark:bg-slate-750 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full ${currentProgram === 'tuxa' ? 'bg-emerald-500' : 'bg-sky-500'}"></span>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base uppercase tracking-tight">
              ${sem.name}
            </h3>
            <span class="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
              ${courses.length} học phần
            </span>
          </div>
          <div class="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-3">
            <span>Tổng TC: <strong class="text-sky-600 dark:text-sky-400 font-black text-sm">${semCredits} TC</strong></span>
            <span>Tổng số tiết: <strong class="text-emerald-600 dark:text-emerald-400 font-black text-sm">${semTotalHours}h</strong></span>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-[11px] font-bold uppercase">
              <tr>
                <th class="py-2.5 px-3 text-center w-24 border-r border-slate-200 dark:border-slate-600">Mã MH</th>
                <th class="py-2.5 px-4 border-r border-slate-200 dark:border-slate-600 min-w-[240px]">Tên Môn Học</th>
                <th class="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-600" title="Tổng số tín chỉ">Tổng TC</th>
                <th class="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-600" title="Tín chỉ Lý thuyết">TC LT</th>
                <th class="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-600" title="Tín chỉ Thực hành">TC TH</th>
                <th class="py-2.5 px-2 text-center border-r border-slate-200 dark:border-slate-600" title="Tín chỉ Bài tập">TC BT</th>
                <th class="py-2.5 px-2.5 text-center font-bold bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600">Tổng Tiết</th>
                <th class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${currentProgram === 'tuxa' ? 'LT (Live LMS)' : 'LT Lên lớp'}</th>
                <th class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${currentProgram === 'tuxa' ? 'TH (Virtual Lab)' : 'TH Lên lớp'}</th>
                <th class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${currentProgram === 'tuxa' ? 'BT / Tự học LMS' : 'BT / Tự học'}</th>
                <th class="py-2.5 px-3 text-center border-r border-slate-200 dark:border-slate-600">Ghi chú định hướng</th>
                <th class="py-2.5 px-2 text-center w-16">Chi tiết</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
    `;

    courses.forEach(c => {
      let badgeHtml = '';
      const noteStr = c.note || 'Cơ sở';
      if (noteStr.includes('Vibe Coding')) {
        badgeHtml = '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800"><i class="fa-solid fa-laptop-code mr-1"></i>Vibe Coding</span>';
      } else if (noteStr.includes('Mạng Cisco')) {
        badgeHtml = '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"><i class="fa-solid fa-network-wired mr-1"></i>Mạng Cisco</span>';
      } else if (noteStr.includes('Phân tích')) {
        badgeHtml = '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"><i class="fa-solid fa-chart-line mr-1"></i>Phân tích số liệu</span>';
      } else if (noteStr.includes('Thực tập') || noteStr.includes('Tốt nghiệp')) {
        badgeHtml = `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">${noteStr}</span>`;
      } else {
        badgeHtml = `<span class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${noteStr}</span>`;
      }

      html += `
        <tr class="hover:bg-sky-50/50 dark:hover:bg-slate-700/40 transition-colors">
          <td class="py-2 px-3 font-mono font-bold text-center text-sky-600 dark:text-sky-400 border-r border-slate-100 dark:border-slate-700">${c.code}</td>
          <td class="py-2 px-4 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-700">${c.name}</td>
          <td class="py-2 px-2 font-bold text-center text-sky-700 dark:text-sky-300 border-r border-slate-100 dark:border-slate-700">${c.credits}</td>
          <td class="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">${c.theoryCredits !== undefined ? c.theoryCredits : (c.lt || 0)}</td>
          <td class="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">${c.practiceCredits !== undefined ? c.practiceCredits : (c.th || 0)}</td>
          <td class="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">${c.exerciseCredits !== undefined ? c.exerciseCredits : (c.bt || 0)}</td>
          <td class="py-2 px-2.5 font-bold text-center bg-slate-50/60 dark:bg-slate-750 border-r border-slate-100 dark:border-slate-700">${c.totalHours}</td>
          <td class="py-2 px-2.5 text-center border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">${c.theoryHours}</td>
          <td class="py-2 px-2.5 text-center border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">${c.practiceHours}</td>
          <td class="py-2 px-2.5 text-center border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">${c.exerciseHours}</td>
          <td class="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-700">
            ${badgeHtml}
          </td>
          <td class="py-2 px-2 text-center">
            <button onclick="showCourseModal('${c.code}')" title="Xem đề cương chi tiết" class="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded transition-colors">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          </td>
        </tr>
      `;
    });

    // Subtotal Row
    html += `
            </tbody>
            <tfoot class="bg-slate-50 dark:bg-slate-700/80 font-bold border-t-2 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
              <tr>
                <td colspan="2" class="py-2.5 px-4 text-center border-r border-slate-200 dark:border-slate-600 font-bold uppercase tracking-wider text-xs">
                  TỔNG CỘNG ${sem.name}
                </td>
                <td class="py-2.5 px-2 text-center text-sky-700 dark:text-sky-300 font-black border-r border-slate-200 dark:border-slate-600">${semCredits}</td>
                <td colspan="3" class="border-r border-slate-200 dark:border-slate-600"></td>
                <td class="py-2.5 px-2.5 text-center font-black bg-slate-100 dark:bg-slate-650 border-r border-slate-200 dark:border-slate-600">${semTotalHours}</td>
                <td class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${semLtHours}</td>
                <td class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${semThHours}</td>
                <td class="py-2.5 px-2.5 text-center border-r border-slate-200 dark:border-slate-600">${semBtHours}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  });

  if (currentPlanSemester === 'all' && !currentPlanSearch) {
    html += `
      <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-sky-950/40 rounded-2xl p-6 border-2 border-emerald-300 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span class="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">Tổng kết kế hoạch đào tạo toàn khóa</span>
          <h4 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
            TỔNG CỘNG TOÀN KHÓA 8 HỌC KỲ: <span class="text-emerald-600 dark:text-emerald-400">${grandTotalCredits} TÍN CHỈ</span>
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Tổng số giờ: <strong>${grandTotalHours} tiết quy chuẩn</strong> (1 TC = 50 tiết). Đảm bảo chuẩn 150 tín chỉ theo quy định của Bộ Giáo dục & Đào tạo.
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <a href="${currentProgram === 'tuxa' ? 'BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx' : 'BM03-Ke hoach dao tao_CNTT-2026_guiDaotao.xlsx'}" download class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30">
            <i class="fa-solid fa-download"></i>
            <span>Tải Bảng BM03 ${currentProgram === 'tuxa' ? 'Từ Xa Tích Hợp' : 'Chính Quy'}</span>
          </a>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}
"""

    # Replace the previous state block in app.js
    idx_start = app_js.find("let currentProgram = 'chinhquy';")
    if idx_start != -1:
        idx_end = app_js.find("// Domain color mappings", idx_start)
        if idx_end != -1:
            app_js = app_js[:idx_start] + state_block.strip() + "\n\n" + app_js[idx_end:]
            print("[OK] Replaced state and switcher block in app.js")

    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(app_js)
    print("[OK] Saved updated app.js")

    # 3. UPDATE INDEX.HTML
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Clean up selector bar in index.html to reflect Integrated program
    new_selector_bar = """    <!-- PROGRAM SELECTOR & DOWNLOAD BAR (CHÍNH QUY & TỪ XA TÍCH HỢP) -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-t border-b border-slate-700/80 px-4 sm:px-6 lg:px-8 py-2.5 text-white no-print">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        <!-- Left: Program mode toggle -->
        <div class="flex items-center space-x-2.5 flex-wrap gap-2">
          <span class="text-xs uppercase font-bold text-sky-400 tracking-wider flex items-center">
            <i class="fa-solid fa-layer-group mr-1.5 text-sky-400"></i> Chương trình đào tạo:
          </span>
          <div class="inline-flex bg-slate-950/90 p-1 rounded-lg border border-slate-700 shadow-inner">
            <button id="btn-prog-chinhquy" onclick="switchProgramMode('chinhquy')" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-sky-600 text-white shadow-md shadow-sky-600/30 flex items-center space-x-1.5">
              <i class="fa-solid fa-graduation-cap"></i>
              <span>Hệ Chính Quy (2026 - 2030)</span>
            </button>
            <button id="btn-prog-tuxa" onclick="switchProgramMode('tuxa')" class="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5">
              <i class="fa-solid fa-cubes-stacked"></i>
              <span>Hệ Từ Xa Tích Hợp 3 Hướng (150 TC)</span>
            </button>
          </div>
        </div>

        <!-- Right: Direct File Download Buttons -->
        <div class="flex items-center space-x-2 flex-wrap gap-2">
          <a href="BM03-Ke hoach dao tao_CNTT-2026_TuXa_TichHop.xlsx" download class="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/50 transition-all shadow-sm">
            <i class="fa-solid fa-file-excel"></i>
            <span>Tải BM03 Từ Xa Tích Hợp (.xlsx)</span>
          </a>
          <a href="2026-CNTT-TuXa-TichHop-Tom tat hoc phan.docx" download class="inline-flex items-center space-x-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-500/50 transition-all shadow-sm">
            <i class="fa-solid fa-file-word"></i>
            <span>Tải Tóm Tắt Học Phần (.docx)</span>
          </a>
        </div>

      </div>
    </div>"""

    # Replace existing selector bar in index.html
    bar_start = html.find('<!-- PROGRAM SELECTOR & DOWNLOAD BAR')
    if bar_start != -1:
        bar_end = html.find('<!-- Navigation Tabs Bar -->')
        if bar_end != -1:
            html = html[:bar_start] + new_selector_bar + "\n\n    " + html[bar_end:]
            print("[OK] Updated selector bar in index.html")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[OK] Saved updated index.html")

if __name__ == "__main__":
    update_frontend()
    print("Now syncing index.html bundle via build_data...")
    import build_data
    build_data.build_data()
    print("All frontend updates synced successfully!")
