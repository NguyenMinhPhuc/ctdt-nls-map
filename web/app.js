const data = window.CURRICULUM_DATA;

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

// Domain color mappings
const domainColors = {
  'I': { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300', badge: 'bg-sky-500', hex: '#0284c7' },
  'II': { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300', badge: 'bg-emerald-500', hex: '#10b981' },
  'III': { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300', badge: 'bg-purple-500', hex: '#8b5cf6' },
  'IV': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300', badge: 'bg-amber-500', hex: '#f59e0b' },
  'V': { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300', badge: 'bg-pink-500', hex: '#ec4899' },
  'VI': { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300', badge: 'bg-rose-500', hex: '#ef4444' }
};

// Level badge generator
function getLevelBadge(levelStr) {
  if (!levelStr || levelStr === '-') return '<span class="text-slate-400 font-normal">-</span>';
  let clean = levelStr.replace('(1 CLO)', '').replace('(2 CLO)', '').replace('(3 CLO)', '').trim();
  let clos = '';
  if (levelStr.includes('CLO')) {
    clos = `<span class="ml-1 text-[10px] opacity-80">${levelStr.substring(levelStr.indexOf('('))}</span>`;
  }
  
  if (clean.includes('Mức 5')) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Mức 5${clos}</span>`;
  } else if (clean.includes('Mức 4')) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Mức 4${clos}</span>`;
  } else if (clean.includes('Mức 3')) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">Mức 3${clos}</span>`;
  } else if (clean.includes('Mức 2')) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Mức 2${clos}</span>`;
  } else {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">${levelStr}</span>`;
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    icon.className = 'fa-solid fa-moon text-base';
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    icon.className = 'fa-solid fa-sun text-base';
    localStorage.setItem('theme', 'dark');
  }
  if (typeof initCharts === 'function') {
    initCharts(true);
  }
}

// Initialize Theme
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = 'fa-solid fa-sun text-base';
}

// Switch Tabs
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.className = 'tab-btn px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white/60 dark:hover:bg-slate-700/60';
  });

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.className = 'tab-btn active-tab px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (tabId === 'dashboard') {
    setTimeout(() => {
      Object.values(chartInstances).forEach(c => c && c.resize && c.resize());
    }, 100);
  }
}

// Render Dashboard Overview Table
function renderOverviewTable() {
  const tbody = document.getElementById('overview-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const domainDescriptions = {
    'I': { target: 'Mức 3 - Mức 4', desc: 'Đạt yêu cầu - Phủ rộng (CSDL, Khai phá dữ liệu, Phân tích dữ liệu)' },
    'II': { target: 'Mức 3 - Mức 4', desc: 'Đạt yêu cầu - Phủ tốt qua kỹ năng làm việc nhóm, báo cáo kỹ thuật' },
    'III': { target: 'Mức 4 - Mức 5', desc: 'Đạt yêu cầu - Phủ cốt lõi (Lập trình chuyên sâu, Web, UI/UX, Mã nguồn mở)' },
    'IV': { target: 'Mức 3 - Mức 4', desc: 'Đạt yêu cầu - Phủ hạ tầng mạng, bảo mật hệ thống, an toàn dữ liệu' },
    'V': { target: 'Mức 4 - Mức 5', desc: 'Đạt yêu cầu - Phủ toàn diện quy trình kỹ thuật, giải pháp công nghệ & dự án' },
    'VI': { target: 'Mức 4 - Mức 5', desc: 'Đạt yêu cầu - Phủ tiên tiến các công nghệ AI, Machine Learning, Vibe Coding & GenAI' }
  };

  const counts = {};
  Object.keys(data.domains).forEach(d => counts[d] = { courses: 0, clos: 0 });

  data.matrix6.forEach(c => {
    ['I', 'II', 'III', 'IV', 'V', 'VI'].forEach((d, idx) => {
      const val = c[`m${idx+1}`];
      if (val && val !== '-') {
        counts[d].courses++;
      }
    });
  });

  data.cloMappings.forEach(m => {
    if (counts[m.mienNLS]) {
      counts[m.mienNLS].clos++;
    }
  });

  Object.entries(data.domains).forEach(([code, name]) => {
    const cStat = counts[code] || { courses: 0, clos: 0 };
    const meta = domainDescriptions[code] || { target: 'Mức 3 - Mức 4', desc: 'Đạt chuẩn yêu cầu' };
    const color = domainColors[code] || domainColors['I'];

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors';
    tr.innerHTML = `
      <td class="py-3.5 px-4 text-center font-bold">
        <span class="inline-block w-8 h-8 rounded-lg leading-8 text-center text-xs font-bold text-white ${color.badge}">${code}</span>
      </td>
      <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
        ${name}
      </td>
      <td class="py-3.5 px-4 text-center font-semibold text-sky-600 dark:text-sky-400">
        ${cStat.courses} môn
      </td>
      <td class="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
        ${cStat.clos} CLO
      </td>
      <td class="py-3.5 px-4 text-center">
        <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          ${meta.target}
        </span>
      </td>
      <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
        ${meta.desc}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Matrix 6 Table
function renderMatrix6Table() {
  const tbody = document.getElementById('matrix6TableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.matrix6.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-sky-50/60 dark:hover:bg-sky-950/20 transition-colors cursor-pointer group';
    tr.onclick = () => openCourseModal(row.maMH);
    tr.dataset.block = row.khoiKT;
    tr.dataset.search = (row.maMH + ' ' + row.tenMH + ' ' + row.khoiKT).toLowerCase();

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center text-slate-400 font-mono sticky-col-1 bg-white dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-slate-800">${idx + 1}</td>
      <td class="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 sticky-col-2 bg-white dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-slate-800">${row.maMH}</td>
      <td class="py-2.5 px-4 font-medium text-slate-900 dark:text-white sticky-col-3 bg-white dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-slate-800">
        ${row.tenMH}
        ${row.hasSummary ? '<i class="fa-solid fa-file-lines ml-1 text-slate-300 text-xs" title="Có đề cương chi tiết"></i>' : ''}
      </td>
      <td class="py-2.5 px-2 text-center font-semibold text-slate-700 dark:text-slate-300" title="Tổng ${row.totalHours || (row.soTC * 50)} tiết (LT: ${row.theoryHours ?? 0} tiết, TH: ${row.practiceHours ?? 0} tiết, BT: ${row.exerciseHours ?? 0} tiết)">
        ${row.soTC}
        <span class="block text-[10px] font-normal text-slate-400 dark:text-slate-500 font-mono">${row.theoryHours !== undefined && row.theoryHours !== null ? `${row.theoryHours}LT/${row.practiceHours}TH` : ''}</span>
      </td>
      <td class="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">${row.khoiKT}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m1)}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m2)}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m3)}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m4)}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m5)}</td>
      <td class="py-2 px-3 text-center">${getLevelBadge(row.m6)}</td>
      <td class="py-2.5 px-3 text-center text-xs font-mono text-slate-500 dark:text-slate-400">${row.cacMien}</td>
      <td class="py-2.5 px-3 text-center">${getLevelBadge(row.mucDoMax)}</td>
      <td class="py-2.5 px-3 text-center">
        <button class="p-1.5 text-sky-500 hover:text-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-md">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const counter = document.getElementById('matrix6Counter');
  if (counter) counter.textContent = `${data.matrix6.length} môn học`;
}

// Filter Matrix 6
function filterMatrix6() {
  const search = document.getElementById('matrix6Search').value.toLowerCase().trim();
  const block = document.getElementById('matrix6FilterBlock').value;
  const rows = document.querySelectorAll('#matrix6TableBody tr');
  let visible = 0;

  rows.forEach(r => {
    const matchSearch = !search || r.dataset.search.includes(search);
    const matchBlock = !block || r.dataset.block.includes(block);
    if (matchSearch && matchBlock) {
      r.style.display = '';
      visible++;
    } else {
      r.style.display = 'none';
    }
  });
  const counter = document.getElementById('matrix6Counter');
  if (counter) counter.textContent = `${visible} / ${data.matrix6.length} môn học`;
}

// Render Matrix 24 Table
function renderMatrix24Table() {
  const tbody = document.getElementById('matrix24TableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const codes = data.nltpCodes;

  data.matrix24.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-sky-50/60 dark:hover:bg-sky-950/20 transition-colors divide-x divide-slate-100 dark:divide-slate-800 text-center';
    tr.dataset.search = (row.maMH + ' ' + row.tenMH + ' ' + row.khoiKT).toLowerCase();

    let cellsHtml = `
      <td class="py-2 px-2 text-slate-400 font-mono sticky-col-1 bg-white dark:bg-slate-800">${idx + 1}</td>
      <td class="py-2 px-2 font-mono font-bold text-sky-600 dark:text-sky-400 sticky-col-2 bg-white dark:bg-slate-800 cursor-pointer" onclick="openCourseModal('${row.maMH}')">${row.maMH}</td>
      <td class="py-2 px-3 text-left font-medium text-slate-900 dark:text-white sticky-col-3 bg-white dark:bg-slate-800 cursor-pointer" onclick="openCourseModal('${row.maMH}')">${row.tenMH}</td>
    `;

    codes.forEach(code => {
      const isCheck = row.mapping[code];
      let domainPrefix = code.charAt(0);
      let bgClass = 'bg-white dark:bg-slate-800';
      let checkHtml = '<span class="text-slate-200 dark:text-slate-700">·</span>';
      
      if (isCheck) {
        let colorMap = {
          '1': 'text-sky-600 bg-sky-100 dark:bg-sky-950 dark:text-sky-400',
          '2': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400',
          '3': 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
          '4': 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
          '5': 'text-pink-600 bg-pink-100 dark:bg-pink-950 dark:text-pink-400',
          '6': 'text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-400'
        };
        const cClass = colorMap[domainPrefix] || 'text-sky-600 bg-sky-100';
        checkHtml = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${cClass} matrix-cell" title="${code}: Ánh xạ đạt chuẩn">✓</span>`;
      }
      
      cellsHtml += `<td class="py-1 px-1 ${bgClass}">${checkHtml}</td>`;
    });

    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
  });
}

// Filter Matrix 24
function filterMatrix24() {
  const search = document.getElementById('matrix24Search').value.toLowerCase().trim();
  const rows = document.querySelectorAll('#matrix24TableBody tr');
  rows.forEach(r => {
    if (!search || r.dataset.search.includes(search)) {
      r.style.display = '';
    } else {
      r.style.display = 'none';
    }
  });
}

// Render CLO Details Table
function renderCLOTable() {
  const tbody = document.getElementById('cloTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.cloMappings.forEach((m, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors';
    tr.dataset.domain = m.mienNLS;
    tr.dataset.level = m.mucDoNLS;
    tr.dataset.search = (m.tenMH + ' ' + m.maMH + ' ' + m.clo + ' ' + m.noiDungCLO + ' ' + m.pi).toLowerCase();

    const color = domainColors[m.mienNLS] || domainColors['I'];

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">${idx + 1}</td>
      <td class="py-2.5 px-3">
        <div class="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-sky-600 flex items-center" onclick="openCourseModal('${m.maMH}')">
          ${m.tenMH}
        </div>
        <div class="text-[11px] text-slate-400 font-mono">${m.maMH} • ${m.khoiKT}</div>
      </td>
      <td class="py-2.5 px-2 text-center font-semibold">${m.soTC}</td>
      <td class="py-2.5 px-2 text-center">
        <span class="inline-block w-6 h-6 rounded-md leading-6 text-center text-xs font-bold text-white ${color.badge}">${m.mienNLS}</span>
      </td>
      <td class="py-2.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">${m.maNLTP}</td>
      <td class="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300 font-medium">${m.tenNLTP}</td>
      <td class="py-2.5 px-2 text-center">${getLevelBadge(m.mucDoNLS)}</td>
      <td class="py-2.5 px-2 text-center font-mono font-bold text-sky-600 dark:text-sky-400">${m.clo}</td>
      <td class="py-2.5 px-4 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">${m.noiDungCLO}</td>
      <td class="py-2.5 px-2 text-center font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">${m.pi}</td>
      <td class="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400">${m.danhGia}</td>
    `;
    tbody.appendChild(tr);
  });
  const counter = document.getElementById('cloCounter');
  if (counter) counter.textContent = `${data.cloMappings.length} dòng ánh xạ`;
}

// Filter CLO Table
function filterCLOTable() {
  const search = document.getElementById('cloSearch').value.toLowerCase().trim();
  const domain = document.getElementById('cloFilterDomain').value;
  const level = document.getElementById('cloFilterLevel').value;
  const rows = document.querySelectorAll('#cloTableBody tr');
  let count = 0;

  rows.forEach(r => {
    const matchSearch = !search || r.dataset.search.includes(search);
    const matchDomain = !domain || r.dataset.domain === domain;
    const matchLevel = !level || r.dataset.level.includes(level);
    if (matchSearch && matchDomain && matchLevel) {
      r.style.display = '';
      count++;
    } else {
      r.style.display = 'none';
    }
  });
  const counter = document.getElementById('cloCounter');
  if (counter) counter.textContent = `${count} / ${data.cloMappings.length} dòng ánh xạ`;
}

// Render Evidence Recommendations
function renderEvidenceCards() {
  const container = document.getElementById('evidenceContainer');
  if (!container) return;
  container.innerHTML = '';

  data.evidences.forEach((ev, idx) => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow evidence-card';
    card.dataset.search = (ev.maHP + ' ' + ev.tenHP + ' ' + ev.noiDungCanBoSung + ' ' + ev.cachLayMinhChung).toLowerCase();

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">${ev.maHP}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${ev.khoiKT}</span>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white text-base mt-1 cursor-pointer hover:text-sky-600" onclick="openCourseModal('${ev.maHP}')">
              ${ev.tenHP}
            </h4>
          </div>
          <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            ${ev.mucDoHuongDen}
          </span>
        </div>

        <!-- Focus domain tags -->
        <div class="my-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs">
          <span class="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Miền NLS cần bổ sung / nâng cấp:</span>
          <div class="font-medium text-purple-600 dark:text-purple-400 whitespace-pre-line">${ev.mienCanBoSung}</div>
          <div class="text-[11px] text-slate-500 font-mono mt-0.5">NLTP: ${ev.maNLTP}</div>
        </div>

        <!-- Content needed -->
        <div class="space-y-2 text-xs text-slate-700 dark:text-slate-300 mt-3">
          <div>
            <span class="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
              <i class="fa-solid fa-circle-plus"></i> Nội dung cần bổ sung:
            </span>
            <div class="whitespace-pre-line bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40 text-slate-700 dark:text-slate-300 leading-relaxed">${ev.noiDungCanBoSung}</div>
          </div>

          <div>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
              <i class="fa-solid fa-chalkboard-user"></i> Hoạt động dạy & học:
            </span>
            <div class="whitespace-pre-line bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 leading-relaxed">${ev.hoatDongDayHoc}</div>
          </div>

          <div>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
              <i class="fa-solid fa-box-archive"></i> Cách thu thập minh chứng:
            </span>
            <div class="whitespace-pre-line bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300 leading-relaxed">${ev.cachLayMinhChung}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
        <button onclick="openCourseModal('${ev.maHP}')" class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 flex items-center gap-1">
          Xem chi tiết môn học <i class="fa-solid fa-angle-right text-xs"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
  const counter = document.getElementById('evidenceCounter');
  if (counter) counter.textContent = `${data.evidences.length} môn học cần giải pháp`;
}

// Filter Evidences
function filterEvidences() {
  const search = document.getElementById('evidenceSearch').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.evidence-card');
  let count = 0;
  cards.forEach(c => {
    if (!search || c.dataset.search.includes(search)) {
      c.style.display = '';
      count++;
    } else {
      c.style.display = 'none';
    }
  });
  const counter = document.getElementById('evidenceCounter');
  if (counter) counter.textContent = `${count} / ${data.evidences.length} môn học cần giải pháp`;
}

// ==========================================
// COURSE SUMMARIES EDITING & DOCX EXPORT
// ==========================================

const LOCAL_STORAGE_SUMMARIES_KEY = 'custom_course_summaries_2026';

function initCustomSummaries() {
  if (!window.ORIGINAL_COURSE_SUMMARIES && typeof data !== 'undefined' && data.courseSummaries) {
    window.ORIGINAL_COURSE_SUMMARIES = JSON.parse(JSON.stringify(data.courseSummaries));
  }
  
  const saved = getCustomSummaries();
  Object.keys(saved).forEach(code => {
    if (data.courseSummaries[code]) {
      if (saved[code].description !== undefined) data.courseSummaries[code].description = saved[code].description;
      if (saved[code].references !== undefined) data.courseSummaries[code].references = saved[code].references;
    }
    const m6 = data.matrix6.find(c => c.maMH === code);
    if (m6) {
      if (saved[code].description !== undefined) m6.summary = saved[code].description;
      if (saved[code].references !== undefined) m6.references = saved[code].references;
    }
  });
}

function getCustomSummaries() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUMMARIES_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const icon = isSuccess ? 'fa-circle-check text-emerald-500' : 'fa-circle-exclamation text-amber-500';
  const borderCol = isSuccess ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800';
  
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border ${borderCol} text-xs font-medium transition-all transform duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      else if (toast.remove) toast.remove();
    }, 300);
  }, 3500);
}

// Render Summaries list & view
let selectedSummaryCode = null;
let isEditingSummaryMode = false;

function renderSummaryList() {
  const listEl = document.getElementById('summaryCoursesList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const activeSummaries = getActiveSummaries();
  const summaryKeys = Object.keys(activeSummaries);
  if (summaryKeys.length === 0) {
    listEl.innerHTML = '<p class="text-xs text-slate-400 p-3">Chưa có dữ liệu tóm tắt</p>';
    return;
  }

  const customEdits = getCustomSummaries();

  summaryKeys.forEach((code, idx) => {
    const activeSummaries = getActiveSummaries();
    const item = activeSummaries[code];
    const isCustomized = !!customEdits[code];
    const btn = document.createElement('button');
    btn.id = `summary-item-${code}`;
    const isActive = selectedSummaryCode ? (selectedSummaryCode === code) : (idx === 0);
    btn.className = `w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn ${isActive ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'}`;
    btn.onclick = () => selectSummaryCourse(code, false);
    btn.dataset.search = (item.code + ' ' + item.title).toLowerCase();

    btn.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-sky-600 dark:text-sky-400">${item.code}</span>
        <div class="flex items-center gap-1.5">
          ${isCustomized ? '<span class="text-[9px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800" title="Đã có chỉnh sửa">Đã sửa</span>' : ''}
          <span class="text-[10px] text-slate-400"><i class="fa-solid fa-chevron-right"></i></span>
        </div>
      </div>
      <div class="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">${item.title}</div>
    `;
    listEl.appendChild(btn);
  });

  if (!selectedSummaryCode && summaryKeys.length > 0) {
    selectSummaryCourse(summaryKeys[0], false);
  }
}

function selectSummaryCourse(code, editMode = false) {
  selectedSummaryCode = code;
  isEditingSummaryMode = editMode;
  const activeSummaries = getActiveSummaries();
    const item = activeSummaries[code];
  const detailEl = document.getElementById('summaryDetailContainer');
  if (!item || !detailEl) return;

  document.querySelectorAll('.summary-list-btn').forEach(b => {
    b.className = 'w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn hover:bg-slate-50 dark:hover:bg-slate-700/60';
  });
  const activeBtn = document.getElementById(`summary-item-${code}`);
  if (activeBtn) {
    activeBtn.className = 'w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800';
  }

  const activePlan = getActiveCoursePlan();
  const plan = activePlan[code] || {};
  const customEdits = getCustomSummaries();
  const isCustomized = !!customEdits[code];

  if (editMode) {
    // EDIT MODE
    detailEl.innerHTML = `
      <div class="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div class="flex items-center space-x-3">
            <span class="font-mono text-sm font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-md border border-sky-200 dark:border-sky-800">${item.code}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${plan.semester || 'Học phần CTDT 2026'} • ${plan.credits || '3'} Tín chỉ${plan.totalHours ? ` • ${plan.totalHours} tiết` : ''}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
            <i class="fa-solid fa-pen"></i> Chế Độ Chỉnh Sửa
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${item.title}</h2>
      </div>

      <div class="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 mb-4 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-circle-info text-blue-500 text-sm"></i>
          <span>Bạn có thể chỉnh sửa mục tiêu và tài liệu tham khảo. Sau khi bấm <strong>"Lưu Thay Đổi"</strong>, dữ liệu sẽ được lưu trên trình duyệt và tự động đưa vào file Word xuất ra.</span>
        </div>
      </div>

      <div class="space-y-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
            <i class="fa-solid fa-align-left text-sky-500"></i> Mục Tiêu & Tóm Tắt Nội Dung Học Phần:
          </label>
          <textarea id="editSummaryDesc" rows="8" class="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed transition-all resize-y" placeholder="Nhập tóm tắt mục tiêu, nội dung kiến thức của học phần...">${item.description || ''}</textarea>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1.5">
            <i class="fa-solid fa-book-bookmark text-emerald-500"></i> Giáo Trình & Tài Liệu Tham Khảo:
            <span class="text-[11px] font-normal text-slate-400">(Trình bày mỗi tài liệu trên một dòng dạng [1]. ...)</span>
          </label>
          <textarea id="editSummaryRefs" rows="6" class="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed transition-all resize-y" placeholder="[1]. Tác giả, Tên tài liệu, NXB, Năm...&#10;[2]. ...">${item.references || ''}</textarea>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 mt-4">
        <div class="flex items-center gap-2">
          <button onclick="saveCurrentSummary('${code}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95">
            <i class="fa-solid fa-floppy-disk"></i> Lưu Thay Đổi
          </button>
          <button onclick="selectSummaryCourse('${code}', false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-all">
            Hủy Bỏ
          </button>
        </div>
        ${isCustomized ? `
          <button onclick="resetCurrentSummary('${code}')" class="px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all">
            <i class="fa-solid fa-rotate-left"></i> Khôi phục về bản gốc
          </button>
        ` : ''}
      </div>
    `;
  } else {
    // VIEW MODE
    detailEl.innerHTML = `
      <div class="border-b border-slate-200 dark:border-slate-700 pb-4 mb-5">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div class="flex items-center space-x-3">
            <span class="font-mono text-sm font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-md border border-sky-200 dark:border-sky-800">${item.code}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${plan.semester || 'Học phần CTDT 2026'} • ${plan.credits || '3'} Tín chỉ${plan.totalHours ? ` • ${plan.totalHours} tiết (LT: ${plan.theoryHours ?? 0} • TH: ${plan.practiceHours ?? 0} • BT: ${plan.exerciseHours ?? 0})` : ''}</span>
          </div>
          <div class="flex items-center gap-2">
            ${isCustomized ? '<span class="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"><i class="fa-solid fa-check"></i> Đã sửa</span>' : ''}
            <button onclick="selectSummaryCourse('${code}', true)" class="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-semibold border border-sky-200 dark:border-sky-800 flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
              <i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa
            </button>
            <button onclick="exportCurrentToDocx('${code}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all" title="Xuất học phần này ra Word">
              <i class="fa-solid fa-file-word text-blue-500"></i> Xuất Word
            </button>
            ${isCustomized ? `
              <button onclick="resetCurrentSummary('${code}')" class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-xs transition-all" title="Khôi phục về nội dung gốc">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            ` : ''}
          </div>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${item.title}</h2>
      </div>

      <div class="space-y-6 flex-1 overflow-y-auto pr-1">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i class="fa-solid fa-align-left text-sky-500"></i> Mục Tiêu & Tóm Tắt Nội Dung Học Phần
            </h4>
            <button onclick="selectSummaryCourse('${code}', true)" class="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 font-medium">
              <i class="fa-solid fa-pen-to-square text-[10px]"></i> Sửa nội dung
            </button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            ${item.description || 'Chưa có mô tả tóm tắt cho học phần này.'}
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i class="fa-solid fa-book-bookmark text-emerald-500"></i> Giáo Trình & Tài Liệu Tham Khảo
            </h4>
            <button onclick="selectSummaryCourse('${code}', true)" class="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <i class="fa-solid fa-pen-to-square text-[10px]"></i> Sửa tài liệu
            </button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line">
            ${item.references || 'Chưa có thông tin giáo trình tài liệu tham khảo.'}
          </div>
        </div>

        <div class="pt-4 flex flex-wrap items-center gap-3">
          <button onclick="selectSummaryCourse('${code}', true)" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all">
            <i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa nội dung học phần
          </button>
          <button onclick="openCourseModal('${item.code}')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all">
            <i class="fa-solid fa-list-check"></i> Xem bảng ánh xạ CLO
          </button>
          <button onclick="exportCurrentToDocx('${code}')" class="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all">
            <i class="fa-solid fa-file-word"></i> Xuất môn này (.docx)
          </button>
        </div>
      </div>
    `;
  }
}

function saveCurrentSummary(code) {
  const descEl = document.getElementById('editSummaryDesc');
  const refsEl = document.getElementById('editSummaryRefs');
  if (!descEl || !refsEl) return;

  const desc = descEl.value.trim();
  const refs = refsEl.value.trim();

  // Save to memory
  if (data.courseSummaries[code]) {
    data.courseSummaries[code].description = desc;
    data.courseSummaries[code].references = refs;
  }
  const m6 = data.matrix6.find(c => c.maMH === code);
  if (m6) {
    m6.summary = desc;
    m6.references = refs;
  }

  // Save to localStorage
  const custom = getCustomSummaries();
  custom[code] = { description: desc, references: refs, updatedAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_STORAGE_SUMMARIES_KEY, JSON.stringify(custom));

  showToast(`Đã lưu thành công tóm tắt & tài liệu học phần ${code}!`, 'success');
  renderSummaryList();
  selectSummaryCourse(code, false);
}

function resetCurrentSummary(code) {
  if (!confirm(`Bạn có chắc muốn khôi phục tóm tắt và tài liệu học phần ${code} về bản gốc ban đầu?`)) return;

  const custom = getCustomSummaries();
  delete custom[code];
  localStorage.setItem(LOCAL_STORAGE_SUMMARIES_KEY, JSON.stringify(custom));

  if (window.ORIGINAL_COURSE_SUMMARIES && window.ORIGINAL_COURSE_SUMMARIES[code]) {
    const orig = window.ORIGINAL_COURSE_SUMMARIES[code];
    if (data.courseSummaries[code]) {
      data.courseSummaries[code].description = orig.description;
      data.courseSummaries[code].references = orig.references;
    }
    const m6 = data.matrix6.find(c => c.maMH === code);
    if (m6) {
      m6.summary = orig.description;
      m6.references = orig.references;
    }
  }

  showToast(`Đã khôi phục nội dung gốc học phần ${code}!`, 'success');
  renderSummaryList();
  selectSummaryCourse(code, false);
}

function resetAllSummaries() {
  if (!confirm('Bạn có chắc chắn muốn khôi phục toàn bộ các môn học về nội dung gốc ban đầu trong file Word đề cương? Mọi nội dung đã chỉnh sửa sẽ bị xóa.')) return;

  localStorage.removeItem(LOCAL_STORAGE_SUMMARIES_KEY);
  if (window.ORIGINAL_COURSE_SUMMARIES) {
    data.courseSummaries = JSON.parse(JSON.stringify(window.ORIGINAL_COURSE_SUMMARIES));
    data.matrix6.forEach(c => {
      if (data.courseSummaries[c.maMH]) {
        c.summary = data.courseSummaries[c.maMH].description;
        c.references = data.courseSummaries[c.maMH].references;
      }
    });
  }

  showToast('Đã khôi phục toàn bộ đề cương các môn về bản gốc ban đầu!', 'success');
  renderSummaryList();
  if (selectedSummaryCode) {
    selectSummaryCourse(selectedSummaryCode, false);
  }
}

// DOCX EXPORT LOGIC MATCHING TEMPLATE
async function exportToDocx(singleCode = null) {
  const docxLib = window.docx;
  if (!docxLib) {
    alert('Thư viện tạo file Word (docx.js) chưa sẵn sàng hoặc kết nối mạng bị gián đoạn. Vui lòng kiểm tra lại mạng hoặc tải lại trang!');
    return;
  }

  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = docxLib;

  // Filter courses to export
  let targetCodes = [];
  if (singleCode) {
    if (getActiveSummaries()[singleCode]) targetCodes.push(singleCode);
  } else {
    targetCodes = Object.keys(getActiveSummaries());
  }

  if (targetCodes.length === 0) {
    alert('Không tìm thấy học phần nào để xuất!');
    return;
  }

  const children = [
    // Header matching 2026-CNTT-Tóm tắt học phần.docx
    new Paragraph({
      children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC LẠC HỒNG', font: 'Times New Roman', size: 26 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: 'KHOA CÔNG NGHỆ THÔNG TIN', bold: true, font: 'Times New Roman', size: 26 })]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'TÓM TẮT HỌC PHẦN', bold: true, font: 'Times New Roman', size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'NGÀNH: CÔNG NGHỆ THÔNG TIN', bold: true, font: 'Times New Roman', size: 26 })]
    }),
    new Paragraph({ text: '' })
  ];

  targetCodes.forEach(code => {
    const activeSummaries = getActiveSummaries();
    const item = activeSummaries[code];
    if (!item) return;

    // Heading 1: <Code> - <Title>
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: `${item.code} - ${item.title}`,
          font: 'Times New Roman',
          size: 26,
          bold: true
        })
      ]
    }));

    // Description paragraphs
    const desc = (item.description || '').trim();
    if (desc) {
      desc.split('\n\n').forEach(para => {
        const pText = para.trim();
        if (pText) {
          children.push(new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: pText,
                font: 'Times New Roman',
                size: 24
              })
            ]
          }));
        }
      });
    }

    // References
    const refs = (item.references || '').trim();
    if (refs) {
      children.push(new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: 'Tài liệu tham khảo:',
            font: 'Times New Roman',
            size: 24,
            bold: true
          })
        ]
      }));

      refs.split('\n').forEach(rLine => {
        const lineText = rLine.trim();
        if (lineText) {
          children.push(new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: lineText,
                font: 'Times New Roman',
                size: 24
              })
            ]
          }));
        }
      });
    }

    // Space after course
    children.push(new Paragraph({ text: '', spacing: { after: 180 } }));
  });

  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
              right: 1440   // 1 inch
            }
          }
        },
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = singleCode ? `2026-CNTT-Tóm tắt học phần_${singleCode}.docx` : '2026-CNTT-Tóm tắt học phần.docx';

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Đã xuất file Word (${fileName}) thành công!`, 'success');
  } catch (err) {
    console.error('Docx generation error:', err);
    alert('Có lỗi khi tạo file Word: ' + err.message);
  }
}

function exportAllToDocx() {
  exportToDocx(null);
}

function exportCurrentToDocx(code = null) {
  const target = code || selectedSummaryCode;
  if (!target) {
    alert('Vui lòng chọn một môn học để xuất!');
    return;
  }
  exportToDocx(target);
}

function exportSummariesJSON() {
  const custom = getCustomSummaries();
  const exportData = {
    dateExported: new Date().toISOString(),
    totalCourses: Object.keys(data.courseSummaries).length,
    customizedCount: Object.keys(custom).length,
    courseSummaries: data.courseSummaries
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '2026-CNTT-TomTatHocPhan_Backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Đã tải xuống file JSON sao lưu thành công!', 'success');
}

function filterSummaryList() {
  const search = document.getElementById('summaryListSearch').value.toLowerCase().trim();
  const btns = document.querySelectorAll('.summary-list-btn');
  btns.forEach(b => {
    if (!search || b.dataset.search.includes(search)) {
      b.style.display = '';
    } else {
      b.style.display = 'none';
    }
  });
}

// Render Framework Reference Tab
function renderFrameworkTab() {
  const container = document.getElementById('frameworkDomainsList');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(data.domains).forEach(([code, name]) => {
    const color = domainColors[code] || domainColors['I'];
    const comps = data.competencies.filter(c => c.domainCode === code);

    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden';
    
    let compsHtml = comps.map(c => `
      <div class="p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
        <div class="flex items-center space-x-2">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">${c.code}</span>
          <h5 class="font-bold text-slate-900 dark:text-white text-sm">${c.name}</h5>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">${c.desc}</p>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="w-10 h-10 rounded-xl leading-10 text-center font-black text-white text-base ${color.badge} shadow-md">${code}</span>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-base">Miền ${code}: ${name}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">${comps.length} Năng lực thành phần số (NLTP)</p>
          </div>
        </div>
      </div>
      <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        ${compsHtml}
      </div>
    `;
    container.appendChild(card);
  });

  const tbody = document.getElementById('frameworkLevelsTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.levels.forEach(lvl => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">${lvl.capDo}</td>
      <td class="py-3 px-4 text-center">${getLevelBadge(lvl.mucDo)}</td>
      <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${lvl.tenMucDo}</td>
      <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${lvl.moTa}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Modal Course Logic
let currentModalCourse = null;
let currentModalTab = 'info';

function openCourseModal(courseCode) {
  currentModalCourse = courseCode;
  const m6 = data.matrix6.find(c => c.maMH === courseCode) || {};
  const plan = data.coursePlan[courseCode] || {};
  const summary = data.courseSummaries[courseCode] || {};
  const clos = data.cloMappings.filter(c => c.maMH === courseCode);
  const ev = data.evidences.find(e => e.maHP === courseCode);

  document.getElementById('modalCourseCode').textContent = courseCode;
  document.getElementById('modalCourseTitle').textContent = m6.tenMH || plan.name || summary.title || 'Thông tin học phần';
  const totalH = (plan.totalHours !== undefined && plan.totalHours !== null) ? ` • ${plan.totalHours} tiết` : '';
  document.getElementById('modalCourseSubtitle').textContent = `${plan.credits || m6.soTC || '3'} Tín chỉ${totalH} • ${m6.khoiKT || 'Khối kiến thức'} • ${plan.semester || 'CTDT 2026'}`;

  switchModalTab('info');
  document.getElementById('courseModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  document.getElementById('courseModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function switchModalTab(tab) {
  currentModalTab = tab;
  const courseCode = currentModalCourse;
  const m6 = data.matrix6.find(c => c.maMH === courseCode) || {};
  const plan = data.coursePlan[courseCode] || {};
  const summary = data.courseSummaries[courseCode] || {};
  const clos = data.cloMappings.filter(c => c.maMH === courseCode);
  const ev = data.evidences.find(e => e.maHP === courseCode);

  ['info', 'clos', 'evidence'].forEach(t => {
    const btn = document.getElementById(`modal-tab-btn-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'modal-tab-btn py-3 px-4 border-b-2 border-sky-500 text-sky-600 dark:text-sky-400 font-semibold';
      } else {
        btn.className = 'modal-tab-btn py-3 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200';
      }
    }
  });

  const body = document.getElementById('modalBody');
  if (!body) return;

  if (tab === 'info') {
    body.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">Số tín chỉ</span>
          <span class="text-lg font-bold text-slate-800 dark:text-slate-200">${plan.credits !== undefined && plan.credits !== null ? plan.credits : (m6.soTC || '3')} TC</span>
          <span class="text-[10px] text-slate-400 block mt-0.5 font-mono">LT:${plan.theoryCredits ?? 0} • TH:${plan.practiceCredits ?? 0}</span>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">Tổng số tiết</span>
          <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">${plan.totalHours !== undefined && plan.totalHours !== null ? plan.totalHours : 0} tiết</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Toàn khóa</span>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">Lý thuyết lên lớp</span>
          <span class="text-lg font-bold text-sky-600 dark:text-sky-400">${plan.theoryHours !== undefined && plan.theoryHours !== null ? plan.theoryHours : 0} tiết</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">LT trực tiếp</span>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">Thực hành lên lớp</span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400">${plan.practiceHours !== undefined && plan.practiceHours !== null ? plan.practiceHours : 0} tiết</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">TH phòng máy</span>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">BT / Tự học</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400">${plan.exerciseHours !== undefined && plan.exerciseHours !== null ? plan.exerciseHours : 0} tiết</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Bài tập / Tự học</span>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <span class="text-[11px] text-slate-500 block">Mức NLS đạt</span>
          <span class="text-lg font-bold text-purple-600 dark:text-purple-400">${m6.mucDoMax || 'Mức 3'}</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Theo TT 02</span>
        </div>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
          <i class="fa-solid fa-align-left text-sky-500"></i> Mục tiêu & Tóm tắt học phần:
        </h4>
        <div class="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          ${summary.description || 'Học phần được triển khai theo chuẩn chương trình đào tạo kỹ sư Công nghệ thông tin niên khóa 2026.'}
        </div>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
          <i class="fa-solid fa-book-bookmark text-emerald-500"></i> Giáo trình & Tài liệu tham khảo:
        </h4>
        <div class="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line">
          ${summary.references || 'Tài liệu học tập và bài giảng chuẩn của Khoa CNTT - Đại học Lạc Hồng.'}
        </div>
      </div>
    `;
  } else if (tab === 'clos') {
    if (clos.length === 0) {
      body.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <i class="fa-solid fa-circle-question text-3xl mb-2"></i>
          <p>Chưa có dòng ánh xạ CLO chi tiết cho học phần này trong bảng review.</p>
        </div>
      `;
      return;
    }

    let rowsHtml = clos.map((c, i) => `
      <tr class="divide-x divide-slate-200 dark:divide-slate-700 text-xs">
        <td class="p-2 text-center font-mono text-slate-400">${i+1}</td>
        <td class="p-2 text-center font-mono font-bold text-sky-600 dark:text-sky-400">${c.clo}</td>
        <td class="p-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">${c.noiDungCLO}</td>
        <td class="p-2 text-center font-bold text-slate-700 dark:text-slate-300">${c.mienNLS} - ${c.maNLTP}</td>
        <td class="p-2 text-center">${getLevelBadge(c.mucDoNLS)}</td>
        <td class="p-2 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">${c.pi}</td>
        <td class="p-2 text-slate-600 dark:text-slate-400">${c.danhGia}</td>
      </tr>
    `).join('');

    body.innerHTML = `
      <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-600">
            <tr class="divide-x divide-slate-200 dark:divide-slate-600 text-center">
              <th class="p-2 w-10">#</th>
              <th class="p-2 w-16">CLO</th>
              <th class="p-2 text-left min-w-[220px]">Nội dung Chuẩn đầu ra</th>
              <th class="p-2 w-20">NLTP</th>
              <th class="p-2 w-20">Mức</th>
              <th class="p-2 w-14">PI</th>
              <th class="p-2 min-w-[120px]">Đánh giá</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'evidence') {
    if (!ev) {
      body.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <i class="fa-solid fa-check-circle text-3xl mb-2 text-emerald-500"></i>
          <p class="font-semibold text-slate-700 dark:text-slate-300">Học phần này đã đạt chuẩn đầy đủ các tiêu chí NLS hiện tại.</p>
          <p class="text-xs mt-1">Không nằm trong danh mục ưu tiên bổ sung nội dung cấp bách.</p>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="space-y-4 text-xs">
        <div class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
          <span class="font-bold text-amber-900 dark:text-amber-200 block mb-1">Miền NLS cần bổ sung / nâng cấp:</span>
          <p class="text-amber-800 dark:text-amber-300 whitespace-pre-line font-medium">${ev.mienCanBoSung}</p>
          <div class="text-[11px] font-mono text-slate-500 mt-1">NLTP mục tiêu: ${ev.maNLTP} • Hướng đến: <strong>${ev.mucDoHuongDen}</strong></div>
        </div>

        <div class="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
          <span class="font-bold text-rose-900 dark:text-rose-200 block mb-1">Nội dung cần bổ sung vào học phần:</span>
          <p class="text-rose-800 dark:text-rose-300 whitespace-pre-line leading-relaxed">${ev.noiDungCanBoSung}</p>
        </div>

        <div class="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <span class="font-bold text-indigo-900 dark:text-indigo-200 block mb-1">Hoạt động dạy & học đề xuất:</span>
          <p class="text-indigo-800 dark:text-indigo-300 whitespace-pre-line leading-relaxed">${ev.hoatDongDayHoc}</p>
        </div>

        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span class="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">Cách lấy minh chứng đạt chuẩn (Evidence Collection):</span>
          <p class="text-emerald-800 dark:text-emerald-300 whitespace-pre-line leading-relaxed">${ev.cachLayMinhChung}</p>
        </div>
      </div>
    `;
  }
}

// Export CSV with UTF-8 BOM
function exportCurrentData() {
  let csvContent = "\uFEFF";
  if (currentTab === 'cloDetails') {
    csvContent += "STT,Mã Môn Học,Tên Môn Học,Số TC,Khối Kiến Thức,Miền NLS,Mã NLTP,Tên NLTP,Mức Độ NLS,CLO,Nội Dung CLO,PI,Phương Pháp Đánh Giá\n";
    data.cloMappings.forEach((m, idx) => {
      csvContent += `"${idx+1}","${m.maMH}","${m.tenMH}","${m.soTC}","${m.khoiKT}","${m.mienNLS}","${m.maNLTP}","${m.tenNLTP}","${m.mucDoNLS}","${m.clo}","${m.noiDungCLO.replace(/"/g, '""')}","${m.pi}","${m.danhGia.replace(/"/g, '""')}"\n`;
    });
    downloadBlob(csvContent, "Bang_Anh_Xa_Chi_Tiet_CLO_NLS.csv");
  } else if (currentTab === 'evidences') {
    csvContent += "STT,Mã HP,Tên Môn Học,Khối Kiến Thức,Miền NLS Cần Bổ Sung,Mã NLTP,Nội Dung Cần Bổ Sung,Hoạt Động Dạy Học,Cách Lấy Minh Chứng,Mức Độ Hướng Đến\n";
    data.evidences.forEach((ev, idx) => {
      csvContent += `"${idx+1}","${ev.maHP}","${ev.tenHP}","${ev.khoiKT}","${ev.mienCanBoSung.replace(/"/g, '""')}","${ev.maNLTP}","${ev.noiDungCanBoSung.replace(/"/g, '""')}","${ev.hoatDongDayHoc.replace(/"/g, '""')}","${ev.cachLayMinhChung.replace(/"/g, '""')}","${ev.mucDoHuongDen}"\n`;
    });
    downloadBlob(csvContent, "De_Xuat_Bo_Sung_Minh_Chung_NLS.csv");
  } else {
    csvContent += "STT,Mã MH,Tên Môn Học,Số TC,Khối KT,Miền I,Miền II,Miền III,Miền IV,Miền V,Miền VI,Các Miền Phủ,Mức Max\n";
    data.matrix6.forEach((r, idx) => {
      csvContent += `"${idx+1}","${r.maMH}","${r.tenMH}","${r.soTC}","${r.khoiKT}","${r.m1}","${r.m2}","${r.m3}","${r.m4}","${r.m5}","${r.m6}","${r.cacMien}","${r.mucDoMax}"\n`;
    });
    downloadBlob(csvContent, "Ma_Tran_Mon_Hoc_6_Mien_NLS.csv");
  }
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Initialize Charts
let chartInstances = {};
let chartsInitialized = false;

function initCharts(force = false) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js đang được tải, chuẩn bị khởi tạo...');
    if (!window._loadingChartJs) {
      window._loadingChartJs = true;
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      script.onload = () => initCharts(true);
      document.head.appendChild(script);
    }
    setTimeout(() => initCharts(force), 250);
    return;
  }

  if (chartsInitialized && !force) return;
  chartsInitialized = true;

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.2)';

  // 1. Radar Chart
  const radarCanvas = document.getElementById('radarDomainsChart');
  if (radarCanvas) {
    if (chartInstances['radar']) {
      chartInstances['radar'].destroy();
    }
    const domainLabels = ['Miền I: Dữ liệu', 'Miền II: Giao tiếp', 'Miền III: Sáng tạo', 'Miền IV: An toàn', 'Miền V: Vấn đề', 'Miền VI: AI & GenAI'];
    const domainClos = [0, 0, 0, 0, 0, 0];
    const domainCourses = [0, 0, 0, 0, 0, 0];

    data.cloMappings.forEach(m => {
      const map = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5 };
      if (map[m.mienNLS] !== undefined) {
        domainClos[map[m.mienNLS]]++;
      }
    });

    data.matrix6.forEach(c => {
      ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].forEach((k, idx) => {
        if (c[k] && c[k] !== '-') domainCourses[idx]++;
      });
    });

    chartInstances['radar'] = new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels: domainLabels,
        datasets: [
          {
            label: 'Số CLO ánh xạ',
            data: domainClos,
            backgroundColor: 'rgba(14, 165, 233, 0.25)',
            borderColor: 'rgb(14, 165, 233)',
            pointBackgroundColor: 'rgb(14, 165, 233)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(14, 165, 233)',
            borderWidth: 2
          },
          {
            label: 'Số môn học phủ',
            data: domainCourses,
            backgroundColor: 'rgba(139, 92, 246, 0.25)',
            borderColor: 'rgb(139, 92, 246)',
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(139, 92, 246)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            ticks: { display: false },
            grid: { color: gridColor },
            pointLabels: { color: textColor, font: { size: 11, weight: 'bold' } }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: textColor } }
        }
      }
    });
  }

  // 2. Bar Chart Domains
  const barCanvas = document.getElementById('barDomainsChart');
  if (barCanvas) {
    if (chartInstances['barDomains']) {
      chartInstances['barDomains'].destroy();
    }
    const domainLabels = ['Miền I', 'Miền II', 'Miền III', 'Miền IV', 'Miền V', 'Miền VI'];
    const domainClos = [0, 0, 0, 0, 0, 0];
    const domainCourses = [0, 0, 0, 0, 0, 0];

    data.cloMappings.forEach(m => {
      const map = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5 };
      if (map[m.mienNLS] !== undefined) domainClos[map[m.mienNLS]]++;
    });

    data.matrix6.forEach(c => {
      ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].forEach((k, idx) => {
        if (c[k] && c[k] !== '-') domainCourses[idx]++;
      });
    });

    chartInstances['barDomains'] = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: domainLabels,
        datasets: [
          {
            label: 'Số môn học phủ',
            data: domainCourses,
            backgroundColor: '#0284c7',
            borderRadius: 6
          },
          {
            label: 'Số CLO ánh xạ',
            data: domainClos,
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { weight: 'bold' } } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: textColor } }
        }
      }
    });
  }

  // 3. Doughnut Blocks
  const doughnutCanvas = document.getElementById('doughnutBlocksChart');
  if (doughnutCanvas) {
    if (chartInstances['doughnut']) {
      chartInstances['doughnut'].destroy();
    }
    const blocks = {};
    data.matrix6.forEach(c => {
      const b = c.khoiKT || 'Khác';
      blocks[b] = (blocks[b] || 0) + 1;
    });

    chartInstances['doughnut'] = new Chart(doughnutCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(blocks),
        datasets: [{
          data: Object.values(blocks),
          backgroundColor: ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: textColor } }
        }
      }
    });
  }

  // 4. Bar Levels
  const levelsCanvas = document.getElementById('barLevelsChart');
  if (levelsCanvas) {
    if (chartInstances['barLevels']) {
      chartInstances['barLevels'].destroy();
    }
    const levelCounts = { 'Mức 1': 0, 'Mức 2': 0, 'Mức 3': 0, 'Mức 4': 0, 'Mức 5': 0 };
    data.cloMappings.forEach(m => {
      const lvl = m.mucDoNLS;
      if (levelCounts[lvl] !== undefined) levelCounts[lvl]++;
    });

    chartInstances['barLevels'] = new Chart(levelsCanvas, {
      type: 'bar',
      data: {
        labels: Object.keys(levelCounts),
        datasets: [{
          label: 'Số lượng CLO đạt mức',
          data: Object.values(levelCounts),
          backgroundColor: ['#94a3b8', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { weight: 'bold' } } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// Modal Close on Esc key or Backdrop click
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCourseModal();
});
document.getElementById('courseModal').addEventListener('click', (e) => {
  if (e.target.id === 'courseModal') closeCourseModal();
});

// On Load Initialization
window.addEventListener('DOMContentLoaded', () => {
  initCustomSummaries();
  renderBM03PlanTable();
  renderOverviewTable();
  renderMatrix6Table();
  renderMatrix24Table();
  renderCLOTable();
  renderEvidenceCards();
  renderSummaryList();
  renderFrameworkTab();
  initCharts();
});
