const data = window.CURRICULUM_DATA;
const cloneData = value => JSON.parse(JSON.stringify(value));
const ORIGINAL_CURRICULUM = {
  matrix6: cloneData(data.matrix6 || []),
  matrix24: cloneData(data.matrix24 || []),
  cloMappings: cloneData(data.cloMappings || []),
  courseSummaries: cloneData(data.courseSummaries || {})
};
const PROGRAM_STORAGE_ID = (data.metadata?.program || 'ctdt')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const LOCAL_STORAGE_CURRICULUM_KEY = `curriculum_edits_${PROGRAM_STORAGE_ID}`;
const LEGACY_SUMMARIES_KEY = 'custom_course_summaries_2026';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getCurriculumEdits() {
  try {
    const edits = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CURRICULUM_KEY) || '{}');
    if (edits && typeof edits === 'object' && edits.courses && typeof edits.courses === 'object') return edits;
  } catch (error) {
    console.error('Không đọc được dữ liệu chỉnh sửa CTĐT đã lưu:', error);
  }
  return { version: 1, courses: {} };
}

function persistCurriculumEdits(edits, successMessage = '') {
  edits.version = 1;
  edits.program = data.metadata?.program || '';
  edits.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(LOCAL_STORAGE_CURRICULUM_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error('Không thể lưu dữ liệu chỉnh sửa CTĐT:', error);
    showToast('Không thể lưu chỉnh sửa. Hãy xuất bản sao lưu JSON và kiểm tra dung lượng trình duyệt.', 'error');
    return false;
  }
  if (successMessage) showToast(successMessage, 'success');
  return true;
}

function getCourseSummary(code) {
  return data.courseSummaries[code] || {
    code,
    title: data.matrix6.find(course => course.maMH === code)?.tenMH || code,
    description: '',
    references: ''
  };
}

let currentProgram = 'chinhquy'; // 'chinhquy' | 'tuxa'
let currentTuxaTrack = 'tich_hop'; // 'tich_hop' (Default)
let currentPlanSemester = 'all';
let currentPlanSearch = '';
let courseEditorDirty = false;

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
      badgeEl.textContent = data.metadata.distanceLearningBadge || data.metadata.distanceLearningLabel || 'Đào tạo từ xa';
      badgeEl.className = 'hidden md:inline-flex text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800';
    }
    showToast(`Đã chuyển sang: ${data.metadata.distanceLearningLabel || 'Đào tạo từ xa'}`, 'info');
  } else {
    if (btnCq) {
      btnCq.className = 'px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-sky-600 text-white shadow-md shadow-sky-600/30 flex items-center space-x-1.5';
    }
    if (btnTx) {
      btnTx.className = 'px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5';
    }
    if (badgeEl) {
      badgeEl.textContent = data.metadata.programBadge || data.metadata.program || '';
      badgeEl.className = 'hidden md:inline-flex text-xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800';
    }
    showToast(`Đã chuyển sang: ${data.metadata.modeLabel || data.metadata.program}`, 'info');
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
              <i class="fa-solid fa-layer-group"></i> ${data.metadata.distanceLearningBadge || data.metadata.distanceLearningLabel || 'Hệ đào tạo từ xa'}
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-cubes-stacked text-emerald-400"></i> ${data.metadata.distanceLearningHeading || 'KẾ HOẠCH ĐÀO TẠO TỪ XA'}
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 mt-2 max-w-4xl leading-relaxed">
              ${data.metadata.distanceLearningDescription || ''}
            </p>
          </div>
          <div class="flex items-center space-x-2 flex-wrap gap-2">
            ${data.metadata.downloads?.distanceLearningPlan ? `<a href="${data.metadata.downloads.distanceLearningPlan}" download class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-file-excel"></i>
              <span>Xuất File Excel BM03 Tích Hợp</span>
            </a>` : ''}
            ${data.metadata.downloads?.distanceLearningSummary ? `<a href="${data.metadata.downloads.distanceLearningSummary}" download class="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-file-word"></i>
              <span>Xuất Tóm Tắt Học Phần (.docx)</span>
            </a>` : ''}
          </div>
        </div>
      `;
    } else {
      headerCard.className = 'bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-sky-800/40';
      headerCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-200 border border-sky-400/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              <i class="fa-solid fa-graduation-cap"></i> ${data.metadata.modeLabel || data.metadata.program}
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight">
              ${data.metadata.coursePlanHeading || `KẾ HOẠCH ĐÀO TẠO BM03 - ${data.metadata.program}`}
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 mt-2 max-w-4xl leading-relaxed">
              ${data.metadata.coursePlanDescription || ''}
            </p>
          </div>
          ${data.tuxa ? `<div class="flex items-center space-x-2">
            <button onclick="switchProgramMode('tuxa')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <i class="fa-solid fa-laptop-code"></i>
              <span>Xem ${data.metadata.distanceLearningLabel || 'chương trình từ xa'}</span>
            </button>
          </div>` : ''}
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
    for (let i = 1; i <= (data.metadata.semesterCount || 8); i++) {
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
            TỔNG CỘNG TOÀN KHÓA${data.metadata.semesterCount ? ` ${data.metadata.semesterCount} HỌC KỲ` : ''}: <span class="text-emerald-600 dark:text-emerald-400">${grandTotalCredits} TÍN CHỈ</span>
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Tổng số giờ: <strong>${grandTotalHours} tiết quy chuẩn</strong> (1 TC = ${data.metadata.creditHoursPerCredit || 50} tiết). ${data.metadata.targetCredits ? `Mục tiêu chương trình: ${data.metadata.targetCredits} tín chỉ.` : ''}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <a href="${(data.metadata.downloads || {})[currentProgram === 'tuxa' ? 'distanceLearningPlan' : 'coursePlan'] || '#'}" ${((data.metadata.downloads || {})[currentProgram === 'tuxa' ? 'distanceLearningPlan' : 'coursePlan']) ? 'download' : 'hidden'} class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30">
            <i class="fa-solid fa-download"></i>
            <span>Tải Bảng BM03 ${currentProgram === 'tuxa' ? (data.metadata.distanceLearningPlanLabel || data.metadata.distanceLearningLabel || 'Từ xa') : (data.metadata.coursePlanDownloadLabel || 'Chính quy')}</span>
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
    tr.dataset.courseCode = row.maMH;
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
        <button onclick="event.stopPropagation(); editCourseInWorkbench('${row.maMH}')" title="Chỉnh sửa map, CLO và tóm tắt học phần" class="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  updateMatrix6Totals();
  const counter = document.getElementById('matrix6Counter');
  if (counter) counter.textContent = `${data.matrix6.length} môn học`;
}

function updateMatrix6Totals() {
  const foot = document.getElementById('matrix6TableFoot');
  const body = document.getElementById('matrix6TableBody');
  if (!foot || !body) return;
  const visibleRows = [...body.querySelectorAll('tr[data-course-code]')]
    .filter(row => row.style.display !== 'none');
  const columns = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  const domainCounts = columns.map(column => visibleRows.reduce((count, row) => {
    const course = data.matrix6.find(item => item.maMH === row.dataset.courseCode);
    return count + (course?.[column] && course[column] !== '-' ? 1 : 0);
  }, 0));
  const mappedTotal = domainCounts.reduce((sum, count) => sum + count, 0);
  const lowValueThreshold = getLowPositiveValueThreshold(domainCounts);
  foot.innerHTML = `<tr class="border-t-2 border-slate-300 dark:border-slate-500">
    <td colspan="5" class="py-3 px-4 text-right">Số học phần có giá trị trong từng miền <span class="font-normal text-slate-500">(${visibleRows.length} học phần đang hiển thị)</span><span class="block text-[10px] font-normal text-slate-500">Đỏ: 0 · Cam: nhóm 25% giá trị dương thấp nhất</span></td>
    ${domainCounts.map((count, index) => `<td class="py-3 px-2 text-center ${getTotalEmphasisClass(count, lowValueThreshold)}" title="${getTotalEmphasisTitle(count, lowValueThreshold)}">${count}</td>`).join('')}
    <td colspan="3" class="py-3 px-3 text-center">Tổng lượt ánh xạ: <span class="${mappedTotal === 0 ? getTotalEmphasisClass(mappedTotal, lowValueThreshold) : ''}">${mappedTotal}</span></td>
  </tr>`;
}

function getLowPositiveValueThreshold(values) {
  const positiveValues = values.filter(value => value > 0).sort((a, b) => a - b);
  if (positiveValues.length === 0) return null;
  return positiveValues[Math.ceil(positiveValues.length * 0.25) - 1];
}

function getTotalEmphasisClass(value, lowValueThreshold) {
  if (value === 0) return 'rounded-md bg-rose-200 px-2 py-1 font-black text-rose-900 ring-2 ring-rose-500 dark:bg-rose-900 dark:text-white dark:ring-rose-400';
  if (lowValueThreshold !== null && value <= lowValueThreshold) {
    return 'rounded-md bg-amber-100 px-2 py-1 font-extrabold text-amber-900 ring-2 ring-amber-400 dark:bg-amber-900/70 dark:text-amber-100 dark:ring-amber-500';
  }
  return '';
}

function getTotalEmphasisTitle(value, lowValueThreshold) {
  if (value === 0) return 'Không có học phần ánh xạ vào tiêu chí này';
  if (lowValueThreshold !== null && value <= lowValueThreshold) return 'Thuộc nhóm 25% giá trị dương thấp nhất';
  return '';
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
  updateMatrix6Totals();
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
    tr.dataset.courseCode = row.maMH;

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
        checkHtml = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${cClass} matrix-cell">${isCheck ? '✓' : ''}</span>`;
      }
      
      cellsHtml += `<td class="py-1 px-1 ${bgClass}"><button type="button" onclick="toggleMappedCompetency('${row.maMH}', '${code}')" title="Bật/tắt ${code} cho ${row.maMH}" aria-label="Bật/tắt ánh xạ ${code}" class="min-w-7 min-h-7 rounded hover:ring-2 hover:ring-sky-400">${checkHtml}</button></td>`;
    });

    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
  });
  updateMatrix24Totals();
}

function updateMatrix24Totals() {
  const foot = document.getElementById('matrix24TableFoot');
  const body = document.getElementById('matrix24TableBody');
  if (!foot || !body) return;
  const visibleRows = [...body.querySelectorAll('tr[data-course-code]')]
    .filter(row => row.style.display !== 'none');
  const counts = data.nltpCodes.map(code => visibleRows.reduce((count, row) => {
    const course = data.matrix24.find(item => item.maMH === row.dataset.courseCode);
    return count + (course?.mapping?.[code] ? 1 : 0);
  }, 0));
  const lowValueThreshold = getLowPositiveValueThreshold(counts);
  foot.innerHTML = `<tr class="border-t-2 border-slate-300 dark:border-slate-500">
    <td colspan="3" class="py-3 px-3 text-right">Số học phần có ánh xạ <span class="font-normal text-slate-500">(${visibleRows.length} học phần đang hiển thị)</span><span class="block text-[10px] font-normal text-slate-500">Đỏ: 0 · Cam: nhóm 25% giá trị dương thấp nhất</span></td>
    ${counts.map(count => `<td class="py-3 px-1 text-center"><span class="${getTotalEmphasisClass(count, lowValueThreshold)}" title="${getTotalEmphasisTitle(count, lowValueThreshold)}">${count}</span></td>`).join('')}
  </tr>`;
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
  updateMatrix24Totals();
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
      <td class="py-2.5 px-2 text-center"><button onclick="editCourseInWorkbench('${m.maMH}')" class="rounded px-2 py-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300" title="Chỉnh sửa CLO và map"><i class="fa-solid fa-pen-to-square"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
  const counter = document.getElementById('cloCounter');
  if (counter) counter.textContent = `${data.cloMappings.length} dòng ánh xạ`;
}

function renderCoursePiMatrix() {
  const table = document.getElementById('coursePiMatrix');
  if (!table) return;

  const groups = new Map();
  const mappedClosByCourse = new Map();
  data.cloMappings.forEach(mapping => {
    const courseCode = String(mapping.maMH || '').trim();
    const clo = String(mapping.clo || '').trim();
    const pi = String(mapping.pi || '').trim();
    if (!courseCode || !clo || !pi) return;

    if (!mappedClosByCourse.has(courseCode)) mappedClosByCourse.set(courseCode, new Set());
    mappedClosByCourse.get(courseCode).add(clo);

    const piMatch = pi.match(/^PI\s*(\d+)\s*\.\s*(\d+)$/i);
    const piLabel = piMatch ? `PI ${piMatch[1]}.${piMatch[2]}` : pi;
    const ploMatch = piLabel.match(/(\d+)\s*\./);
    const plo = ploMatch ? `PLO ${ploMatch[1]}` : 'PLO chưa xác định';
    if (!groups.has(plo)) groups.set(plo, new Map());
    const pis = groups.get(plo);
    if (!pis.has(piLabel)) pis.set(piLabel, new Map());
    const courses = pis.get(piLabel);
    if (!courses.has(courseCode)) courses.set(courseCode, new Set());
    courses.get(courseCode).add(clo);
  });

  const compareLabels = (a, b) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });
  const ploGroups = [...groups.entries()].sort(([a], [b]) => compareLabels(a, b));
  const piColumns = ploGroups.flatMap(([plo, pis]) =>
    [...pis.keys()].sort(compareLabels).map(pi => ({ plo, pi }))
  );

  const courses = new Map();
  data.matrix6.forEach(course => {
    courses.set(course.maMH, { code: course.maMH, title: course.tenMH });
  });
  data.cloMappings.forEach(mapping => {
    if (mapping.maMH && !courses.has(mapping.maMH)) {
      courses.set(mapping.maMH, { code: mapping.maMH, title: mapping.tenMH || mapping.maMH });
    }
  });
  const courseRows = [...courses.values()].sort((a, b) => compareLabels(a.code, b.code));
  const courseCloCounts = courseRows.map(course => mappedClosByCourse.get(course.code)?.size || 0);
  const lowCloCountThreshold = getLowPositiveValueThreshold(courseCloCounts);
  const piTotals = new Map(piColumns.map(({ pi }) => [pi, 0]));
  const piCourseCounts = new Map(piColumns.map(({ pi }) => [pi, new Set()]));

  const headerGroups = ploGroups.map(([plo, pis]) => `
    <th colspan="${pis.size}" class="border-l border-slate-300 dark:border-slate-500 py-2 px-3 text-center font-bold">${escapeHtml(plo)}</th>
  `).join('');
  const headerPis = piColumns.map(({ pi }) => `
    <th class="border-l border-slate-200 dark:border-slate-600 py-2 px-3 text-center min-w-[90px] font-semibold">${escapeHtml(pi)}</th>
  `).join('');
  const rowsHtml = courseRows.map((course, index) => {
    const cloCount = mappedClosByCourse.get(course.code)?.size || 0;
    const cells = piColumns.map(({ plo, pi }) => {
      const clos = groups.get(plo)?.get(pi)?.get(course.code);
      if (!clos?.size) return '<td class="border-l border-slate-100 dark:border-slate-700 px-3 py-2 text-center text-slate-300 dark:text-slate-600">—</td>';
      piTotals.set(pi, piTotals.get(pi) + clos.size);
      piCourseCounts.get(pi).add(course.code);
      const labels = [...clos].sort(compareLabels);
      return `<td class="border-l border-slate-100 dark:border-slate-700 px-3 py-2 text-center font-mono font-semibold text-sky-700 dark:text-sky-300">${labels.map(escapeHtml).join('<br>')}</td>`;
    }).join('');
    return `<tr class="hover:bg-sky-50/60 dark:hover:bg-sky-950/20">
      <td class="sticky left-0 z-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-600 px-3 py-2 text-center font-mono text-slate-400">${index + 1}</td>
      <th scope="row" style="left:52px" class="sticky z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-600 px-3 py-2 text-left font-medium">
        <span class="block min-w-[210px]">${escapeHtml(course.title)}</span>
        <span class="font-mono text-[11px] text-slate-400">${escapeHtml(course.code)}</span>
      </th>
      <td class="border-r border-slate-200 dark:border-slate-600 px-3 py-2 text-center font-bold ${getTotalEmphasisClass(cloCount, lowCloCountThreshold)}" title="${escapeHtml(getTotalEmphasisTitle(cloCount, lowCloCountThreshold))}">${cloCount}</td>
      ${cells}
    </tr>`;
  }).join('');

  const columnCount = Math.max(piColumns.length, 1);
  const mappedCourseCount = courseCloCounts.filter(count => count > 0).length;
  const totalCourseCloMappings = courseCloCounts.reduce((total, count) => total + count, 0);
  const totalCloPiMappings = [...piTotals.values()].reduce((total, count) => total + count, 0);
  const ploReviewRows = ploGroups.map(([plo, pis]) => {
    const pisInPlo = [...pis.keys()];
    const ploCloCount = pisInPlo.reduce((total, pi) => total + piTotals.get(pi), 0);
    const ploCourses = new Set(pisInPlo.flatMap(pi => [...piCourseCounts.get(pi)]));
    return { plo, piCount: pis.size, cloCount: ploCloCount, courseCount: ploCourses.size };
  });
  const piReviewRows = piColumns.map(({ plo, pi }) => ({
    plo,
    pi,
    cloCount: piTotals.get(pi),
    courseCount: piCourseCounts.get(pi).size
  }));
  const unMappedCourses = courseRows.filter(course => !mappedClosByCourse.get(course.code)?.size);
  const minPiCount = piReviewRows.length ? Math.min(...piReviewRows.map(item => item.cloCount)) : 0;
  const maxPiCount = piReviewRows.length ? Math.max(...piReviewRows.map(item => item.cloCount)) : 0;
  const leastCoveredPis = piReviewRows.filter(item => item.cloCount === minPiCount).map(item => item.pi);
  const mostCoveredPis = piReviewRows.filter(item => item.cloCount === maxPiCount).map(item => item.pi);

  table.innerHTML = `
    <thead class="sticky top-0 z-20 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
      <tr>
        <th rowspan="2" class="sticky left-0 z-30 bg-slate-100 dark:bg-slate-700 border-r border-b border-slate-300 dark:border-slate-500 px-3 py-2 text-center min-w-[52px]">STT</th>
        <th rowspan="2" style="left:52px" class="sticky z-30 bg-slate-100 dark:bg-slate-700 border-r border-b border-slate-300 dark:border-slate-500 px-3 py-2 text-left min-w-[230px]">Môn học</th>
        <th rowspan="2" class="border-r border-b border-slate-300 dark:border-slate-500 px-3 py-2 text-center min-w-[100px]">Số CLO đã map</th>
        ${headerGroups || `<th rowspan="2" class="border-b border-slate-300 dark:border-slate-500 px-3 py-2 text-center">Chưa có PI</th>`}
      </tr>
      <tr>${headerPis}</tr>
    </thead>
    <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
      ${rowsHtml || `<tr><td colspan="${columnCount + 2}" class="px-4 py-8 text-center text-slate-500">Chưa có học phần để hiển thị.</td></tr>`}
    </tbody>
    <tfoot class="sticky bottom-0 z-20 bg-slate-100 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-100">
      <tr class="border-t-2 border-slate-300 dark:border-slate-500">
        <th scope="row" colspan="3" class="sticky left-0 z-10 bg-slate-100 dark:bg-slate-700 px-3 py-3 text-right">Số CLO đã map theo PI</th>
        ${piColumns.map(({ pi }) => `<td class="border-l border-slate-200 dark:border-slate-600 px-3 py-3 text-center">${piTotals.get(pi)}</td>`).join('')}
        ${piColumns.length ? '' : '<td class="px-3 py-3 text-center">0</td>'}
      </tr>
    </tfoot>
  `;

  const review = document.getElementById('coursePiReview');
  if (!review) return;
  const coveragePercent = courseRows.length ? Math.round(mappedCourseCount / courseRows.length * 100) : 0;
  const piRowsHtml = piReviewRows.map(item => {
    const share = totalCloPiMappings ? (item.cloCount / totalCloPiMappings * 100).toFixed(1) : '0.0';
    const isLow = item.cloCount > 0 && item.cloCount === minPiCount && minPiCount < maxPiCount;
    return `<tr class="border-b border-slate-100 dark:border-slate-700">
      <td class="px-3 py-2">${escapeHtml(item.plo)}</td>
      <th scope="row" class="px-3 py-2 text-left font-mono">${escapeHtml(item.pi)}</th>
      <td class="px-3 py-2 text-center ${isLow ? 'font-bold text-amber-700 dark:text-amber-300' : ''}">${item.cloCount}</td>
      <td class="px-3 py-2 text-center">${item.courseCount}</td>
      <td class="px-3 py-2 text-right">${share}%</td>
    </tr>`;
  }).join('');
  review.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-magnifying-glass-chart mt-0.5 text-indigo-600 dark:text-indigo-400"></i>
        <div>
          <h2 class="font-bold text-slate-900 dark:text-white">Rà soát mức độ ánh xạ chuẩn đầu ra CTĐT</h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Tổng hợp mức độ phân bố CLO theo PI từ dữ liệu đang nạp; đây là chỉ báo rà soát, không thay thế chuẩn PLO/PI chính thức của chương trình.</p>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div class="rounded-lg bg-sky-50 dark:bg-sky-950/40 p-3"><span class="text-xs text-slate-600 dark:text-slate-300">Môn có CLO đã map</span><strong class="mt-1 block text-xl text-sky-700 dark:text-sky-300">${mappedCourseCount} / ${courseRows.length}</strong><span class="text-[11px] text-slate-500">${coveragePercent}% số môn</span></div>
        <div class="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3"><span class="text-xs text-slate-600 dark:text-slate-300">CLO duy nhất theo môn</span><strong class="mt-1 block text-xl text-emerald-700 dark:text-emerald-300">${totalCourseCloMappings}</strong></div>
        <div class="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-3"><span class="text-xs text-slate-600 dark:text-slate-300">Lượt ánh xạ CLO–PI</span><strong class="mt-1 block text-xl text-indigo-700 dark:text-indigo-300">${totalCloPiMappings}</strong></div>
        <div class="rounded-lg bg-violet-50 dark:bg-violet-950/40 p-3"><span class="text-xs text-slate-600 dark:text-slate-300">PI có dữ liệu ánh xạ</span><strong class="mt-1 block text-xl text-violet-700 dark:text-violet-300">${piColumns.length}</strong><span class="text-[11px] text-slate-500">thuộc ${ploGroups.length} PLO</span></div>
      </div>
      <div class="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-100 dark:bg-slate-700"><tr><th class="px-3 py-2 text-left">PLO</th><th class="px-3 py-2 text-center">Số PI</th><th class="px-3 py-2 text-center">Lượt CLO–PI</th><th class="px-3 py-2 text-center">Số môn có map</th></tr></thead>
            <tbody>${ploReviewRows.map(item => `<tr class="border-b border-slate-100 dark:border-slate-700"><th scope="row" class="px-3 py-2 text-left">${escapeHtml(item.plo)}</th><td class="px-3 py-2 text-center">${item.piCount}</td><td class="px-3 py-2 text-center">${item.cloCount}</td><td class="px-3 py-2 text-center">${item.courseCount}</td></tr>`).join('') || '<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">Chưa có PI để tổng hợp.</td></tr>'}</tbody>
          </table>
        </div>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 max-h-[360px]">
          <table class="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead class="sticky top-0 bg-slate-100 dark:bg-slate-700"><tr><th class="px-3 py-2 text-left">PLO</th><th class="px-3 py-2 text-left">PI</th><th class="px-3 py-2 text-center">CLO map</th><th class="px-3 py-2 text-center">Số môn</th><th class="px-3 py-2 text-right">Tỷ trọng</th></tr></thead>
            <tbody>${piRowsHtml || '<tr><td colspan="5" class="px-3 py-4 text-center text-slate-500">Chưa có PI để tổng hợp.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="mt-4 rounded-lg ${unMappedCourses.length ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'} p-3 text-xs">
        ${unMappedCourses.length
          ? `<strong>Cần rà soát ${unMappedCourses.length} môn chưa có CLO được map:</strong> ${unMappedCourses.map(course => `${escapeHtml(course.code)} – ${escapeHtml(course.title)}`).join('; ')}.`
          : '<strong>Không có môn nào thiếu CLO đã map</strong> trong dữ liệu hiện tại.'}
        ${piReviewRows.length && minPiCount < maxPiCount ? `<span class="mt-1 block">PI có lượt map thấp nhất: <strong>${leastCoveredPis.map(escapeHtml).join(', ')}</strong> (${minPiCount}); cao nhất: <strong>${mostCoveredPis.map(escapeHtml).join(', ')}</strong> (${maxPiCount}). Nên đối chiếu với mức độ quan trọng và kế hoạch đánh giá của từng PLO.</span>` : ''}
        <span class="mt-1 block text-[11px] opacity-80">Các PI chưa xuất hiện trong nguồn ánh xạ không thể được xác định nếu danh mục PI chuẩn chưa được cung cấp riêng.</span>
      </div>
    </div>
  `;
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

function initCustomSummaries() {
  if (!window.ORIGINAL_COURSE_SUMMARIES && typeof data !== 'undefined' && data.courseSummaries) {
    window.ORIGINAL_COURSE_SUMMARIES = cloneData(ORIGINAL_CURRICULUM.courseSummaries);
  }

  const edits = getCurriculumEdits();
  let migratedLegacySummaries = false;
  if (Object.keys(edits.courses).length === 0 && PROGRAM_STORAGE_ID.includes('cong_nghe_thong_tin')) {
    try {
      const legacySummaries = JSON.parse(localStorage.getItem(LEGACY_SUMMARIES_KEY) || '{}');
      Object.entries(legacySummaries).forEach(([code, summary]) => {
        edits.courses[code] = { ...(edits.courses[code] || {}), summary: summary };
        migratedLegacySummaries = true;
      });
    } catch (error) {
      console.error('Không đọc được bản tóm tắt học phần cũ:', error);
    }
  }

  Object.entries(edits.courses).forEach(([code, courseEdit]) => {
    const map6 = data.matrix6.find(course => course.maMH === code);
    const map24 = data.matrix24.find(course => course.maMH === code);
    if (map6 && courseEdit.matrix6) Object.assign(map6, courseEdit.matrix6);
    if (map24 && courseEdit.competencies) Object.assign(map24.mapping, courseEdit.competencies);
    if (courseEdit.cloMappings) {
      data.cloMappings = data.cloMappings.filter(mapping => mapping.maMH !== code).concat(cloneData(courseEdit.cloMappings));
    }
    if (courseEdit.summary) {
      const summary = getCourseSummary(code);
      Object.assign(summary, courseEdit.summary);
      data.courseSummaries[code] = summary;
      if (map6) {
        map6.summary = summary.description || '';
        map6.references = summary.references || '';
        map6.hasSummary = Boolean(map6.summary || map6.references);
      }
    }
  });

  if (migratedLegacySummaries && persistCurriculumEdits(edits)) {
    try {
      localStorage.removeItem(LEGACY_SUMMARIES_KEY);
    } catch (error) {
      console.error('Không thể xóa bản tóm tắt học phần cũ sau khi chuyển đổi:', error);
    }
  }
  data.cloMappings.sort((a, b) => String(a.maMH).localeCompare(String(b.maMH)) || String(a.clo).localeCompare(String(b.clo)));
}

function getCustomSummaries() {
  return Object.fromEntries(Object.entries(getCurriculumEdits().courses)
    .filter(([, edit]) => edit.summary)
    .map(([code, edit]) => [code, edit.summary]));
}

function getCourseAnalysis(code) {
  const map6 = data.matrix6.find(course => course.maMH === code);
  const map24 = data.matrix24.find(course => course.maMH === code);
  const clos = data.cloMappings.filter(mapping => mapping.maMH === code);
  const mappedDomains = ['I', 'II', 'III', 'IV', 'V', 'VI']
    .filter((domain, index) => map6?.[`m${index + 1}`] && map6[`m${index + 1}`] !== '-');
  const selectedCompetencies = data.competencies
    .filter(competency => map24?.mapping?.[competency.code]);
  const competencyDomains = [...new Set(selectedCompetencies.map(item => item.domainCode))];
  const cloDomains = [...new Set(clos.map(mapping => mapping.mienNLS))];
  const selectedCodes = new Set(selectedCompetencies.map(item => item.code));
  const cloCodes = new Set(clos.map(mapping => mapping.maNLTP));
  const summary = getCourseSummary(code);
  const issues = [];

  if (mappedDomains.length === 0) issues.push('Chưa ánh xạ miền NLS ở ma trận 6 miền.');
  mappedDomains.filter(domain => !cloDomains.includes(domain))
    .forEach(domain => issues.push(`Miền ${domain} trong ma trận 6 miền chưa có CLO tương ứng.`));
  cloDomains.filter(domain => !mappedDomains.includes(domain))
    .forEach(domain => issues.push(`CLO thuộc miền ${domain} nhưng ma trận 6 miền chưa đánh dấu.`));
  selectedCompetencies.filter(item => !cloCodes.has(item.code))
    .forEach(item => issues.push(`NLTP ${item.code} đã chọn nhưng chưa được gắn với CLO.`));
  clos.filter(mapping => mapping.maNLTP && !selectedCodes.has(mapping.maNLTP))
    .forEach(mapping => issues.push(`${mapping.clo || 'CLO'} ánh xạ NLTP ${mapping.maNLTP} nhưng ma trận 24 chưa chọn.`));
  clos.filter(mapping => {
    const competency = data.competencies.find(item => item.code === mapping.maNLTP);
    return competency && competency.domainCode !== mapping.mienNLS;
  }).forEach(mapping => issues.push(`${mapping.clo || 'CLO'} có miền NLS không khớp với NLTP ${mapping.maNLTP}.`));
  const cloIds = clos.map(mapping => mapping.clo).filter(Boolean);
  if (new Set(cloIds).size !== cloIds.length) issues.push('Có mã CLO bị trùng trong học phần.');
  if (!String(summary.description || '').trim()) issues.push('Chưa có mục tiêu/tóm tắt học phần.');

  return {
    code,
    title: map6?.tenMH || clos[0]?.tenMH || code,
    map6: mappedDomains,
    map24: selectedCompetencies,
    cloDomains,
    cloCount: clos.length,
    summary,
    issues
  };
}

function refreshAfterCurriculumEdit() {
  refreshDashboardSummary();
  renderOverviewTable();
  renderMatrix6Table();
  renderMatrix24Table();
  renderCLOTable();
  renderCoursePiMatrix();
  renderEvidenceCards();
  renderSummaryList();
  if (selectedSummaryCode && getActiveSummaries()[selectedSummaryCode]) {
    selectSummaryCourse(selectedSummaryCode, false);
  }
  renderCourseAnalysisIssues();
  initCharts(true);
}

function renderCLOEditorRow(mapping = {}) {
  const domainOptions = Object.entries(data.domains).map(([code, name]) =>
    `<option value="${escapeHtml(code)}" ${mapping.mienNLS === code ? 'selected' : ''}>${escapeHtml(code)} - ${escapeHtml(name)}</option>`
  ).join('');
  const competencyOptions = data.competencies.map(item =>
    `<option value="${escapeHtml(item.code)}" ${mapping.maNLTP === item.code ? 'selected' : ''}>${escapeHtml(item.code)} - ${escapeHtml(item.name)}</option>`
  ).join('');
  const levelOptions = Array.from({ length: 6 }, (_, index) => `Mức ${index + 1}`).map(level =>
    `<option value="${level}" ${mapping.mucDoNLS === level ? 'selected' : ''}>${level}</option>`
  ).join('');
  return `
    <article class="clo-editor-row rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2" data-original-clo="${escapeHtml(mapping.clo || '')}">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label class="text-[11px] font-semibold">Miền NLS
          <select data-clo-field="mienNLS" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">${domainOptions}</select>
        </label>
        <label class="text-[11px] font-semibold">NLTP
          <select data-clo-field="maNLTP" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">${competencyOptions}</select>
        </label>
        <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
          <label class="text-[11px] font-semibold">Mã CLO
            <input data-clo-field="clo" value="${escapeHtml(mapping.clo || '')}" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
          </label>
          <label class="text-[11px] font-semibold">Mức NLS
            <select data-clo-field="mucDoNLS" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">${levelOptions}</select>
          </label>
          <button type="button" onclick="removeCLOEditorRow(this)" class="mt-5 px-2 text-rose-600" title="Xóa dòng CLO"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <label class="block text-[11px] font-semibold">Nội dung chuẩn đầu ra
        <textarea data-clo-field="noiDungCLO" rows="2" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">${escapeHtml(mapping.noiDungCLO || '')}</textarea>
      </label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label class="text-[11px] font-semibold">PI
          <input data-clo-field="pi" value="${escapeHtml(mapping.pi || '')}" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
        </label>
        <label class="text-[11px] font-semibold">Phương pháp đánh giá
          <input data-clo-field="danhGia" value="${escapeHtml(mapping.danhGia || '')}" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
        </label>
      </div>
      <label class="block text-[11px] font-semibold">Ghi chú
        <input data-clo-field="ghiChu" value="${escapeHtml(mapping.ghiChu || '')}" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
      </label>
    </article>
  `;
}

function renderCurriculumEditor() {
  const select = document.getElementById('editCourseSelect');
  const editor = document.getElementById('curriculumCourseEditor');
  if (!select || !editor) return;
  const courses = data.matrix6;
  const selectedCode = select.value || courses[0]?.maMH;
  if (!selectedCode) {
    editor.innerHTML = '<p class="text-sm text-slate-500">Chưa có học phần để chỉnh sửa.</p>';
    return;
  }
  if (!select.options.length) {
    select.innerHTML = courses.map(course =>
      `<option value="${escapeHtml(course.maMH)}">${escapeHtml(course.maMH)} — ${escapeHtml(course.tenMH)}</option>`
    ).join('');
  }
  select.value = selectedCode;
  select.dataset.previousValue = selectedCode;
  const map6 = courses.find(course => course.maMH === selectedCode);
  const map24 = data.matrix24.find(course => course.maMH === selectedCode);
  const summary = getCourseSummary(selectedCode);
  const clos = data.cloMappings.filter(mapping => mapping.maMH === selectedCode);
  const analysis = getCourseAnalysis(selectedCode);
  const levels = ['-', 'Mức 1', 'Mức 2', 'Mức 3', 'Mức 4', 'Mức 5', 'Mức 6'];
  const domainsHtml = Object.entries(data.domains).map(([domain, name], index) => {
    const level = String(map6?.[`m${index + 1}`] || '-').match(/Mức\s+\d+/)?.[0] || '-';
    return `
      <label class="block text-xs font-semibold">${escapeHtml(domain)} · ${escapeHtml(name)}
        <select data-map-domain="${index + 1}" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
          ${levels.map(option => `<option value="${option}" ${option === level ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      </label>
    `;
  }).join('');
  const competenciesHtml = data.competencies.map(item => `
    <label class="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 p-2 text-xs">
      <input type="checkbox" data-editor-competency="${escapeHtml(item.code)}" ${map24?.mapping?.[item.code] ? 'checked' : ''} class="mt-0.5 accent-sky-600">
      <span><strong>${escapeHtml(item.code)}</strong> · ${escapeHtml(item.name)}</span>
    </label>
  `).join('');

  editor.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div><h3 class="text-lg font-bold">${escapeHtml(map6?.tenMH || selectedCode)}</h3>
          <p class="text-xs text-slate-500">${escapeHtml(selectedCode)} · ${escapeHtml(map6?.khoiKT || '')} · ${map6?.soTC ?? ''} TC</p></div>
        <span class="rounded-full px-3 py-1 text-xs ${analysis.issues.length ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${analysis.issues.length ? `${analysis.issues.length} lưu ý cần rà soát` : 'Chưa phát hiện lệch theo các kiểm tra cơ bản'}</span>
      </div>
      <section class="space-y-2">
        <h4 class="font-bold text-sm">Ma trận 6 miền — mức độ dự kiến</h4>
        <p class="text-xs text-slate-500">Chọn “-” nếu học phần không đóng góp vào miền đó. Mức độ là đánh giá của người biên soạn, không phải kết luận tự động.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${domainsHtml}</div>
      </section>
      <section class="space-y-2">
        <h4 class="font-bold text-sm">Ma trận 24 năng lực thành phần</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${competenciesHtml}</div>
      </section>
      <section class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div><h4 class="font-bold text-sm">Chuẩn đầu ra CLO, PI và đánh giá</h4><p class="text-xs text-slate-500">Chỉnh nội dung và liên kết CLO ↔ miền/NLTP. Thêm hoặc xóa CLO theo đề cương đã rà soát.</p></div>
          <button type="button" onclick="addCLOEditorRow()" class="rounded-lg bg-sky-100 text-sky-800 px-3 py-2 text-xs font-semibold"><i class="fa-solid fa-plus mr-1"></i>Thêm CLO</button>
        </div>
        <div id="courseCLOEditor" class="space-y-3">${clos.map(mapping => renderCLOEditorRow(mapping)).join('') || '<p id="emptyCLOMessage" class="text-xs text-slate-500">Chưa có CLO ánh xạ.</p>'}</div>
      </section>
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <label class="text-xs font-bold">Mục tiêu / tóm tắt học phần
          <textarea id="editCourseSummary" rows="6" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-xs font-normal">${escapeHtml(summary.description || '')}</textarea>
        </label>
        <label class="text-xs font-bold">Tài liệu tham khảo
          <textarea id="editCourseReferences" rows="6" class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-xs font-normal">${escapeHtml(summary.references || '')}</textarea>
        </label>
      </section>
      <div class="flex justify-end">
        <div class="flex items-center gap-3">
          <span id="courseEditorDirtyLabel" class="text-xs text-slate-500">Đã lưu hoặc chưa có thay đổi</span>
          <button type="button" onclick="saveCurriculumCourseEdits()" class="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-bold"><i class="fa-solid fa-floppy-disk mr-2"></i>Lưu và phân tích lại</button>
        </div>
      </div>
    </div>
  `;
  courseEditorDirty = false;
  editor.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', markCourseEditorDirty);
    input.addEventListener('change', markCourseEditorDirty);
  });
  renderCourseAnalysisIssues(analysis);
}

function markCourseEditorDirty() {
  courseEditorDirty = true;
  const label = document.getElementById('courseEditorDirtyLabel');
  if (label) {
    label.textContent = 'Có thay đổi chưa lưu';
    label.className = 'text-xs font-bold text-amber-700';
  }
}

function changeEditorCourse(select) {
  if (courseEditorDirty && !confirm('Bạn có thay đổi chưa lưu. Bỏ các thay đổi đó và chuyển học phần?')) {
    select.value = select.dataset.previousValue || data.matrix6[0]?.maMH || '';
    return;
  }
  select.dataset.previousValue = select.value;
  renderCurriculumEditor();
}

function getIssueReviewAction(issue) {
  if (issue.includes('Chưa ánh xạ miền NLS')) {
    return 'Đối chiếu nội dung học phần và CLO với ma trận 6 miền; chọn miền phù hợp hoặc ghi nhận rõ học phần không đóng góp trực tiếp.';
  }
  if (issue.includes('chưa có CLO tương ứng') || issue.includes('ma trận 6 miền chưa đánh dấu')) {
    return 'So sánh miền đang đánh dấu ở ma trận 6 miền với miền NLS của từng CLO; cập nhật một trong hai phía nếu chưa khớp.';
  }
  if (issue.includes('đã chọn nhưng chưa được gắn với CLO')) {
    return 'Tìm hoặc bổ sung CLO thể hiện NLTP này; nếu không có đóng góp trong học phần, bỏ chọn NLTP ở ma trận 24.';
  }
  if (issue.includes('ma trận 24 chưa chọn')) {
    return 'Kiểm tra NLTP ghi trong CLO và dấu chọn tại ma trận 24; bật NLTP nếu CLO có đánh giá năng lực này, hoặc điều chỉnh liên kết CLO.';
  }
  if (issue.includes('miền NLS không khớp với NLTP')) {
    return 'Kiểm tra mã NLTP trong khung năng lực và miền NLS của CLO; chọn lại miền hoặc NLTP đúng.';
  }
  if (issue.includes('mã CLO bị trùng')) {
    return 'Đảm bảo mỗi CLO trong học phần có một mã duy nhất và cập nhật các PI/đánh giá theo mã đã sửa.';
  }
  if (issue.includes('Chưa có mục tiêu/tóm tắt')) {
    return 'Bổ sung mục tiêu hoặc tóm tắt học phần từ đề cương đã được bộ môn thống nhất.';
  }
  return 'Đối chiếu thông tin học phần trong ma trận và đề cương nguồn, sau đó cập nhật dữ liệu nếu cần.';
}

function openCourseAnalysisIssue(code) {
  const select = document.getElementById('editCourseSelect');
  if (!select) return;
  if (courseEditorDirty && select.value !== code && !confirm('Bạn có thay đổi chưa lưu. Bỏ các thay đổi đó và mở học phần được chọn?')) return;
  select.value = code;
  select.dataset.previousValue = code;
  renderCurriculumEditor();
  switchTab('curriculumEdits');
  document.getElementById('courseAnalysisResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCourseAnalysisIssues(analysis = null) {
  const target = document.getElementById('courseAnalysisResults');
  if (!target) return;
  const summaries = data.matrix6.map(course => getCourseAnalysis(course.maMH));
  const allIssues = summaries.flatMap(item => item.issues.map(issue => ({ ...item, issue })));
  const issueCount = allIssues.length;
  const active = analysis || summaries.find(item => item.code === document.getElementById('editCourseSelect')?.value);
  const recommendations = data.evidences.filter(item => item.maHP === active?.code);
  const issueList = active?.issues.length
    ? `<ol class="mt-3 space-y-3">${active.issues.map((issue, index) => `
      <li class="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20 p-3">
        <p class="font-bold text-amber-950 dark:text-amber-100">${index + 1}. ${escapeHtml(issue)}</p>
        <p class="mt-1 text-slate-600 dark:text-slate-300"><strong>Việc cần đối chiếu:</strong> ${escapeHtml(getIssueReviewAction(issue))}</p>
      </li>`).join('')}</ol>`
    : '<p class="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">Chưa phát hiện điểm lệch trong các quy tắc kiểm tra cấu trúc cơ bản. Đây không phải kết luận học thuật; bộ môn vẫn cần xem xét CLO có phù hợp nội dung và cách đánh giá hay không.</p>';
  const curriculumIssueDetails = allIssues.length ? `
    <details id="allCurriculumIssues" class="mt-3 rounded-xl border border-amber-200 dark:border-amber-900">
      <summary class="cursor-pointer list-none p-4 font-bold text-amber-900 dark:text-amber-200">
        <i class="fa-solid fa-list-check mr-2"></i>Xem chi tiết ${issueCount} mục cần rà soát trên toàn CTĐT
        <span class="ml-2 text-xs font-normal text-slate-500">Mỗi dòng nêu học phần, vấn đề và việc cần đối chiếu</span>
      </summary>
      <div class="overflow-x-auto border-t border-amber-200 dark:border-amber-900">
        <table class="w-full min-w-[700px] text-left">
          <thead class="bg-amber-50 dark:bg-amber-950/40">
            <tr><th class="p-3">#</th><th class="p-3">Học phần</th><th class="p-3">Lưu ý phát hiện</th><th class="p-3">Việc cần đối chiếu</th><th class="p-3">Thao tác</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            ${allIssues.map((item, index) => `<tr>
              <td class="p-3 align-top">${index + 1}</td>
              <td class="p-3 align-top"><strong>${escapeHtml(item.code)}</strong><br>${escapeHtml(item.title)}</td>
              <td class="p-3 align-top">${escapeHtml(item.issue)}</td>
              <td class="p-3 align-top">${escapeHtml(getIssueReviewAction(item.issue))}</td>
              <td class="p-3 align-top"><button type="button" onclick="openCourseAnalysisIssue('${escapeHtml(item.code)}')" class="whitespace-nowrap rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700">Mở học phần</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </details>` : `
    <details id="allCurriculumIssues" class="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-900">
      <summary class="cursor-pointer list-none p-4 font-bold text-emerald-800 dark:text-emerald-200">Toàn CTĐT chưa có lưu ý cấu trúc tự động</summary>
      <p class="border-t border-emerald-200 p-4">Các phép kiểm tra cấu trúc không phát hiện vấn đề. Vẫn cần thẩm định học thuật đối với mức độ đóng góp, nội dung CLO và phương pháp đánh giá.</p>
    </details>`;
  const recommendationHtml = recommendations.length ? `
    <div class="mt-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-3">
      <strong>Gợi ý NLS có sẵn trong dữ liệu nguồn (tham khảo)</strong>
      ${recommendations.map(item => `<p class="mt-2"><strong>${escapeHtml(item.mienCanBoSung)} · ${escapeHtml(item.maNLTP)}</strong><br>${escapeHtml(item.noiDungCanBoSung)}<br><span class="text-slate-500">Hoạt động: ${escapeHtml(item.hoatDongDayHoc)} · Minh chứng: ${escapeHtml(item.cachLayMinhChung)}</span></p>`).join('')}
    </div>` : '';
  target.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="rounded-xl bg-sky-50 dark:bg-sky-950/40 p-3"><span class="text-xs">Miền NLS đang phủ</span><strong class="block text-xl">${new Set(data.matrix6.flatMap(course => getCourseAnalysis(course.maMH).map6)).size} / ${Object.keys(data.domains).length}</strong></div>
      <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3"><span class="text-xs">NLTP có ít nhất một học phần</span><strong class="block text-xl">${new Set(data.matrix24.flatMap(course => Object.entries(course.mapping || {}).filter(([, selected]) => selected).map(([code]) => code))).size} / ${data.competencies.length}</strong></div>
      <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3"><span class="text-xs">Số CLO đã ánh xạ</span><strong class="block text-xl">${data.cloMappings.length}</strong></div>
      <button type="button" onclick="document.getElementById('allCurriculumIssues')?.scrollIntoView({behavior:'smooth',block:'start'}); document.getElementById('allCurriculumIssues')?.setAttribute('open','')" class="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-left hover:ring-2 hover:ring-amber-300">
        <span class="text-xs">Mục cần rà soát trên toàn CTĐT</span><strong class="block text-xl">${issueCount}</strong><span class="text-[11px] underline">Xem danh sách chi tiết</span>
      </button>
    </div>
    <div class="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-xs">
      <strong>${escapeHtml(active?.code || '')} · ${escapeHtml(active?.title || '')}: ${active?.issues.length || 0} lưu ý</strong>
      <p class="mt-1 text-slate-500">Danh sách dưới đây nêu lý do cảnh báo và gợi ý cụ thể để đối chiếu. Cảnh báo là kiểm tra cấu trúc tự động, không đồng nghĩa dữ liệu chắc chắn sai.</p>
      ${issueList}
      ${recommendationHtml}
    </div>
    ${curriculumIssueDetails}
  `;
}

function refreshDashboardSummary() {
  const courseCount = data.matrix6.length;
  const cloCount = data.cloMappings.length;
  const coveredDomains = new Set(data.matrix6.flatMap(course => getCourseAnalysis(course.maMH).map6)).size;
  const coveredCompetencies = new Set(data.matrix24.flatMap(course =>
    Object.entries(course.mapping || {}).filter(([, mapped]) => mapped).map(([competency]) => competency)
  )).size;
  const title = document.getElementById('dashboard-title');
  const description = document.getElementById('dashboard-description');
  if (title) title.textContent = data.metadata?.program || 'Chương trình đào tạo';
  if (description) {
    description.innerHTML = `Dữ liệu đang có <strong>${courseCount} học phần</strong>, <strong>${cloCount} CLO</strong>, phủ <strong>${coveredDomains}/${Object.keys(data.domains).length} miền NLS</strong> và <strong>${coveredCompetencies}/${data.competencies.length} NLTP</strong>. Số liệu được cập nhật sau mỗi lần lưu chỉnh sửa.`;
  }
  const values = {
    'dashboard-course-count': courseCount,
    'dashboard-clo-count': cloCount,
    'dashboard-domain-count': `${coveredDomains} / ${Object.keys(data.domains).length}`,
    'dashboard-competency-count': `${coveredCompetencies} / ${data.competencies.length}`,
    'dashboard-evidence-count': data.evidences.length
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
  const status = document.getElementById('dashboard-analysis-status');
  if (status) {
    status.innerHTML = `<i class="fa-solid ${coveredDomains === Object.keys(data.domains).length && coveredCompetencies === data.competencies.length ? 'fa-circle-check' : 'fa-triangle-exclamation'} mr-1.5"></i>${coveredDomains === Object.keys(data.domains).length && coveredCompetencies === data.competencies.length ? 'Đã phủ đủ miền/NLTP · cần duyệt chuyên môn' : 'Còn miền/NLTP chưa được phủ'}`;
    status.className = `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${coveredDomains === Object.keys(data.domains).length && coveredCompetencies === data.competencies.length ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'}`;
  }
}

function addCLOEditorRow() {
  const container = document.getElementById('courseCLOEditor');
  document.getElementById('emptyCLOMessage')?.remove();
  if (container) container.insertAdjacentHTML('beforeend', renderCLOEditorRow({ mienNLS: 'I', maNLTP: data.competencies[0]?.code, mucDoNLS: 'Mức 1' }));
  markCourseEditorDirty();
}

function removeCLOEditorRow(button) {
  button.closest('.clo-editor-row')?.remove();
  const container = document.getElementById('courseCLOEditor');
  if (container && !container.querySelector('.clo-editor-row')) {
    container.innerHTML = '<p id="emptyCLOMessage" class="text-xs text-slate-500">Chưa có CLO ánh xạ.</p>';
  }
  markCourseEditorDirty();
}

function saveCurriculumCourseEdits() {
  const code = document.getElementById('editCourseSelect')?.value;
  const map6 = data.matrix6.find(course => course.maMH === code);
  const map24 = data.matrix24.find(course => course.maMH === code);
  if (!code || !map6 || !map24) {
    showToast('Không tìm thấy học phần cần lưu.', 'error');
    return;
  }

  const editedClos = [...document.querySelectorAll('.clo-editor-row')].map(row => {
    const value = field => row.querySelector(`[data-clo-field="${field}"]`)?.value.trim() || '';
    const competency = data.competencies.find(item => item.code === value('maNLTP'));
    return {
      stt: 0, tenMH: map6.tenMH, maMH: code, soTC: map6.soTC, khoiKT: map6.khoiKT,
      mienNLS: value('mienNLS'), maNLTP: value('maNLTP'), tenNLTP: competency?.name || '',
      mucDoNLS: value('mucDoNLS'), clo: value('clo'), noiDungCLO: value('noiDungCLO'),
      pi: value('pi'), danhGia: value('danhGia'),
      ghiChu: value('ghiChu')
    };
  });
  if (editedClos.some(mapping => !mapping.mienNLS || !mapping.maNLTP || !mapping.clo || !mapping.noiDungCLO)) {
    showToast('Mỗi CLO cần có miền NLS, mã NLTP, mã CLO và nội dung.', 'error');
    return;
  }
  const duplicateClos = editedClos.map(mapping => mapping.clo);
  if (new Set(duplicateClos).size !== duplicateClos.length) {
    showToast('Mã CLO đang bị trùng. Hãy kiểm tra trước khi lưu.', 'error');
    return;
  }

  const domainCodes = Object.keys(data.domains);
  const mapChanges = {};
  domainCodes.forEach((domain, index) => {
    const selectedLevel = document.querySelector(`[data-map-domain="${index + 1}"]`)?.value || '-';
    const cloCount = editedClos.filter(mapping => mapping.mienNLS === domain).length;
    mapChanges[`m${index + 1}`] = selectedLevel === '-' ? '-' : `${selectedLevel}${cloCount ? ` (${cloCount} CLO)` : ''}`;
  });
  const numericLevels = Object.values(mapChanges).map(value => Number(value.match(/Mức\s+(\d+)/)?.[1] || 0));
  mapChanges.cacMien = domainCodes.filter((domain, index) => mapChanges[`m${index + 1}`] !== '-').join(', ');
  mapChanges.mucDoMax = `Mức ${Math.max(0, ...numericLevels)}`;
  if (mapChanges.mucDoMax === 'Mức 0') mapChanges.mucDoMax = '-';

  const competencyChanges = {};
  document.querySelectorAll('[data-editor-competency]').forEach(input => {
    competencyChanges[input.dataset.editorCompetency] = input.checked;
  });
  const edits = getCurriculumEdits();
  const previous = edits.courses[code] || {};
  const previousMap6 = cloneData(map6);
  const previousMap24 = cloneData(map24.mapping);
  const previousClos = data.cloMappings.filter(mapping => mapping.maMH === code);
  const previousSummary = data.courseSummaries[code] ? cloneData(data.courseSummaries[code]) : null;
  const summary = {
    code,
    title: map6.tenMH,
    description: document.getElementById('editCourseSummary')?.value.trim() || '',
    references: document.getElementById('editCourseReferences')?.value.trim() || ''
  };
  data.matrix6[data.matrix6.indexOf(map6)] = { ...map6, ...mapChanges, summary: summary.description, references: summary.references, hasSummary: Boolean(summary.description || summary.references) };
  map24.mapping = { ...map24.mapping, ...competencyChanges };
  data.cloMappings = data.cloMappings.filter(mapping => mapping.maMH !== code)
    .concat(editedClos.map((mapping, index) => ({ ...mapping, stt: index + 1 })));
  data.cloMappings.sort((a, b) => String(a.maMH).localeCompare(String(b.maMH)) || String(a.clo).localeCompare(String(b.clo)));
  data.courseSummaries[code] = summary;
  edits.courses[code] = { ...previous, matrix6: mapChanges, competencies: competencyChanges, cloMappings: editedClos, summary };
  if (!persistCurriculumEdits(edits, `Đã lưu và phân tích lại học phần ${code}.`)) {
    Object.assign(map6, previousMap6);
    map24.mapping = previousMap24;
    data.cloMappings = data.cloMappings.filter(mapping => mapping.maMH !== code).concat(previousClos);
    if (previousSummary) data.courseSummaries[code] = previousSummary;
    else delete data.courseSummaries[code];
    return;
  }
  refreshAfterCurriculumEdit();
  renderCurriculumEditor();
}

function editCourseInWorkbench(code) {
  const select = document.getElementById('editCourseSelect');
  if (!select) return;
  if (courseEditorDirty) {
    if (select.value === code) {
      switchTab('curriculumEdits');
      return;
    }
    if (!confirm('Bạn có thay đổi chưa lưu. Bỏ các thay đổi đó và chuyển học phần?')) return;
  }
  select.value = code;
  select.dataset.previousValue = code;
  renderCurriculumEditor();
  switchTab('curriculumEdits');
}

function toggleMappedCompetency(code, competencyCode) {
  const course = data.matrix24.find(item => item.maMH === code);
  if (!course) return;
  course.mapping[competencyCode] = !course.mapping[competencyCode];
  const edits = getCurriculumEdits();
  edits.courses[code] = {
    ...(edits.courses[code] || {}),
    competencies: { ...(edits.courses[code]?.competencies || {}), [competencyCode]: course.mapping[competencyCode] }
  };
  if (!persistCurriculumEdits(edits)) {
    course.mapping[competencyCode] = !course.mapping[competencyCode];
    return;
  }
  const editorCheckbox = [...document.querySelectorAll('[data-editor-competency]')]
    .find(input => input.dataset.editorCompetency === competencyCode);
  if (editorCheckbox && document.getElementById('editCourseSelect')?.value === code) {
    editorCheckbox.checked = course.mapping[competencyCode];
  }
  refreshDashboardSummary();
  renderOverviewTable();
  renderMatrix24Table();
  renderCourseAnalysisIssues();
  initCharts(true);
}

function exportCurriculumEditsJson() {
  const payload = {
    schemaVersion: 1,
    program: data.metadata?.program || '',
    exportedAt: new Date().toISOString(),
    edits: getCurriculumEdits()
  };
  downloadBlob(JSON.stringify(payload, null, 2), `${PROGRAM_STORAGE_ID}_ban_sao_chinh_sua.json`, 'application/json');
}

function importCurriculumEdits(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || ''));
      if (payload.program !== (data.metadata?.program || '') || !payload.edits?.courses) {
        throw new Error('File không đúng ngành hoặc không đúng định dạng bản sao chỉnh sửa.');
      }
      const edits = { version: 1, courses: payload.edits.courses };
      if (!persistCurriculumEdits(edits, 'Đã nhập bản chỉnh sửa.')) return;
      window.location.reload();
    } catch (error) {
      console.error('Không thể nhập bản chỉnh sửa:', error);
      showToast(error.message || 'Không thể đọc file chỉnh sửa.', 'error');
    } finally {
      event.target.value = '';
    }
  };
  reader.onerror = () => showToast('Không thể đọc file đã chọn.', 'error');
  reader.readAsText(file, 'utf-8');
}

function escapeReportText(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function exportCurriculumReport() {
  const sections = data.matrix6.map(course => {
    const code = course.maMH;
    const original6 = ORIGINAL_CURRICULUM.matrix6.find(item => item.maMH === code) || {};
    const original24 = ORIGINAL_CURRICULUM.matrix24.find(item => item.maMH === code) || { mapping: {} };
    const originalCLOs = ORIGINAL_CURRICULUM.cloMappings.filter(item => item.maMH === code);
    const originalSummary = ORIGINAL_CURRICULUM.courseSummaries[code] || {};
    const current = getCourseAnalysis(code);
    const selected = current.map24.map(item => item.code).join(', ') || 'Chưa đánh dấu';
    const originalSelected = data.competencies.filter(item => original24.mapping?.[item.code]).map(item => item.code).join(', ') || 'Chưa đánh dấu';
    const currentCLOs = data.cloMappings.filter(item => item.maMH === code);
    const oldCloById = new Map(originalCLOs.map(item => [item.clo, item]));
    const newCloById = new Map(currentCLOs.map(item => [item.clo, item]));
    const cloIds = [...new Set([...oldCloById.keys(), ...newCloById.keys()])].sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }));
    const cloTable = cloIds.length ? `
      <table><thead><tr><th>CLO</th><th>Miền / NLTP (gốc → mới)</th><th>Mức (gốc → mới)</th><th>Nội dung CLO (gốc → mới)</th><th>PI / Đánh giá</th><th>Trạng thái</th></tr></thead>
      <tbody>${cloIds.map(id => {
        const before = oldCloById.get(id);
        const after = newCloById.get(id);
        return `<tr><td>${escapeHtml(id)}</td>
          <td>${escapeHtml(before ? `${before.mienNLS} / ${before.maNLTP}` : '—')} → ${escapeHtml(after ? `${after.mienNLS} / ${after.maNLTP}` : 'Đã xóa')}</td>
          <td>${escapeHtml(before?.mucDoNLS || '—')} → ${escapeHtml(after?.mucDoNLS || 'Đã xóa')}</td>
          <td><strong>Gốc:</strong><br>${escapeReportText(before?.noiDungCLO || '—')}<hr><strong>Mới:</strong><br>${escapeReportText(after?.noiDungCLO || 'Đã xóa')}</td>
          <td><strong>Gốc:</strong> ${escapeHtml(before?.pi || '—')} · ${escapeReportText(before?.danhGia || '—')}<hr><strong>Mới:</strong> ${escapeHtml(after?.pi || (before ? 'Đã xóa' : '—'))} · ${escapeReportText(after?.danhGia || (before ? 'Đã xóa' : '—'))}</td>
          <td>${!before ? 'Thêm mới' : !after ? 'Đã xóa' : ['mienNLS', 'maNLTP', 'mucDoNLS', 'clo', 'noiDungCLO', 'pi', 'danhGia', 'ghiChu'].every(field => (before[field] || '') === (after[field] || '')) ? 'Không đổi' : 'Đã chỉnh sửa'}</td></tr>`;
      }).join('')}</tbody></table>
    ` : '<p>Chưa khai báo CLO ánh xạ.</p>';
    const beforeDomains = ['I', 'II', 'III', 'IV', 'V', 'VI'].filter((_, index) => original6[`m${index + 1}`] && original6[`m${index + 1}`] !== '-');
    const beforeCompetencies = data.competencies.filter(item => original24.mapping?.[item.code]).map(item => item.code);
    const currentLevels = ['I', 'II', 'III', 'IV', 'V', 'VI'].map((domain, index) =>
      `${domain}: ${String(course[`m${index + 1}`] || '-')}`
    ).join(' · ');
    const originalLevels = ['I', 'II', 'III', 'IV', 'V', 'VI'].map((domain, index) =>
      `${domain}: ${String(original6[`m${index + 1}`] || '-')}`
    ).join(' · ');
    const recommendations = data.evidences.filter(item => item.maHP === code);
    const oldSummaryDescription = originalSummary.description || '';
    const oldSummaryReferences = originalSummary.references || '';
    const issues = current.issues.length ? `<ul>${current.issues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>` : '<p>Không có cảnh báo cấu trúc theo các kiểm tra cơ bản; vẫn cần thẩm định chuyên môn.</p>';
    return `<section class="course">
      <h2>${escapeHtml(code)} — ${escapeHtml(course.tenMH)}</h2>
      <p class="muted">${escapeHtml(course.khoiKT)} · ${course.soTC ?? ''} tín chỉ</p>
      <table><tbody>
        <tr><th>Miền NLS / mức độ</th><td><strong>Gốc:</strong> ${escapeHtml(beforeDomains.join(', ') || 'Chưa đánh dấu')}<br><small>${escapeHtml(originalLevels)}</small><hr><strong>Sau rà soát:</strong> ${escapeHtml(current.map6.join(', ') || 'Chưa đánh dấu')}<br><small>${escapeHtml(currentLevels)}</small></td></tr>
        <tr><th>NLTP</th><td><strong>Gốc:</strong> ${escapeHtml(beforeCompetencies.join(', ') || originalSelected)}<br><strong>Sau rà soát:</strong> ${escapeHtml(current.map24.map(item => item.code).join(', ') || selected)}</td></tr>
        <tr><th>Số CLO ánh xạ</th><td>${originalCLOs.length} → ${currentCLOs.length}</td></tr>
        <tr><th>Mục tiêu / tóm tắt</th><td><strong>Gốc:</strong><br>${escapeReportText(oldSummaryDescription) || '<em>Chưa có</em>'}<hr><strong>Sau rà soát:</strong><br>${escapeReportText(current.summary.description) || '<em>Chưa có</em>'}</td></tr>
        <tr><th>Tài liệu tham khảo</th><td><strong>Gốc:</strong><br>${escapeReportText(oldSummaryReferences) || '<em>Chưa có</em>'}<hr><strong>Sau rà soát:</strong><br>${escapeReportText(current.summary.references) || '<em>Chưa có</em>'}</td></tr>
      </tbody></table>
      <h3>CLO và nội dung đề xuất hiện tại</h3>${cloTable}
      ${recommendations.length ? `<h3>Gợi ý bổ sung từ dữ liệu nguồn (tham khảo)</h3>${recommendations.map(item => `<p><strong>${escapeHtml(item.mienCanBoSung)} · ${escapeHtml(item.maNLTP)}</strong><br>${escapeReportText(item.noiDungCanBoSung)}<br>Hoạt động: ${escapeReportText(item.hoatDongDayHoc)}<br>Minh chứng: ${escapeReportText(item.cachLayMinhChung)}</p>`).join('')}` : ''}
      <h3>Kết quả rà soát tự động · ${current.issues.length} lưu ý</h3>${issues}
      <p class="muted">Bản báo cáo phản ánh dữ liệu đã lưu trên trình duyệt tại thời điểm xuất. Các lưu ý là quy tắc kiểm tra cấu trúc để hỗ trợ rà soát, không thay thế thẩm định học thuật.</p>
    </section>`;
  }).join('');
  const report = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>Báo cáo rà soát CTĐT</title>
    <style>body{font:14px Arial,sans-serif;max-width:1100px;margin:32px auto;color:#1e293b;line-height:1.5}h1{color:#0f3b68}.course{page-break-before:always;margin:32px 0}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left;vertical-align:top}th{background:#f1f5f9;width:190px}.muted{color:#64748b;font-size:12px}hr{border:0;border-top:1px solid #cbd5e1;margin:8px 0}@media print{body{margin:0 auto}.course{page-break-before:always}}</style>
    <body><h1>BÁO CÁO TỔNG HỢP RÀ SOÁT VÀ ĐỀ XUẤT CẬP NHẬT ĐỀ CƯƠNG</h1>
    <p><strong>${escapeHtml(data.metadata?.university || '')} · ${escapeHtml(data.metadata?.faculty || '')}</strong></p>
    <p>${escapeHtml(data.metadata?.program || '')}</p><p>Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}</p>
    <p>Báo cáo thể hiện ánh xạ gốc và dữ liệu sau rà soát, CLO, nội dung học phần và các lưu ý cần chuyên gia xem xét. Mở file bằng trình duyệt, dùng In → Lưu thành PDF để chia sẻ hoặc lưu hồ sơ.</p>
    ${sections}</body></html>`;
  downloadBlob(report, `${PROGRAM_STORAGE_ID}_bao_cao_ra_soat_de_cuong.html`, 'text/html;charset=utf-8');
}

function resetCurriculumEdits() {
  if (!confirm('Khôi phục toàn bộ ma trận, CLO và tóm tắt học phần về dữ liệu ban đầu? Thao tác này xóa các chỉnh sửa đã lưu trên trình duyệt.')) return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_CURRICULUM_KEY);
    localStorage.removeItem(LEGACY_SUMMARIES_KEY);
  } catch (error) {
    console.error('Không thể xóa dữ liệu chỉnh sửa:', error);
    showToast('Không thể khôi phục dữ liệu. Hãy kiểm tra quyền lưu trữ của trình duyệt.', 'error');
    return;
  }
  window.location.reload();
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
  const oldSummary = data.courseSummaries[code] ? cloneData(data.courseSummaries[code]) : null;
  const map6 = data.matrix6.find(c => c.maMH === code);
  const oldMapSummary = map6 ? { summary: map6.summary, references: map6.references, hasSummary: map6.hasSummary } : null;

  // Save to memory
  if (data.courseSummaries[code]) {
    data.courseSummaries[code].description = desc;
    data.courseSummaries[code].references = refs;
  }
  const m6 = data.matrix6.find(c => c.maMH === code);
  if (m6) {
    m6.summary = desc;
    m6.references = refs;
    m6.hasSummary = Boolean(desc || refs);
  }

  // Save to localStorage
  const custom = getCustomSummaries();
  custom[code] = { description: desc, references: refs, updatedAt: new Date().toISOString() };
  const edits = getCurriculumEdits();
  edits.courses[code] = { ...(edits.courses[code] || {}), summary: custom[code] };
  if (!persistCurriculumEdits(edits)) {
    if (oldSummary) data.courseSummaries[code] = oldSummary;
    else delete data.courseSummaries[code];
    if (map6 && oldMapSummary) Object.assign(map6, oldMapSummary);
    return;
  }

  showToast(`Đã lưu thành công tóm tắt & tài liệu học phần ${code}!`, 'success');
  renderSummaryList();
  selectSummaryCourse(code, false);
  refreshAfterCurriculumEdit();
}

function resetCurrentSummary(code) {
  if (!confirm(`Bạn có chắc muốn khôi phục tóm tắt và tài liệu học phần ${code} về bản gốc ban đầu?`)) return;

  const edits = getCurriculumEdits();
  if (edits.courses[code]) {
    delete edits.courses[code].summary;
    if (Object.keys(edits.courses[code]).length === 0) delete edits.courses[code];
  }
  if (!persistCurriculumEdits(edits)) return;

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
      m6.hasSummary = Boolean(m6.summary || m6.references);
    }
  } else {
    delete data.courseSummaries[code];
    const m6 = data.matrix6.find(c => c.maMH === code);
    if (m6) {
      m6.summary = '';
      m6.references = '';
      m6.hasSummary = false;
    }
  }

  showToast(`Đã khôi phục nội dung gốc học phần ${code}!`, 'success');
  renderSummaryList();
  selectSummaryCourse(code, false);
  refreshAfterCurriculumEdit();
}

function resetAllSummaries() {
  if (!confirm('Bạn có chắc chắn muốn khôi phục toàn bộ các môn học về nội dung gốc ban đầu trong file Word đề cương? Mọi nội dung đã chỉnh sửa sẽ bị xóa.')) return;

  const edits = getCurriculumEdits();
  Object.keys(edits.courses).forEach(code => {
    delete edits.courses[code].summary;
    if (Object.keys(edits.courses[code]).length === 0) delete edits.courses[code];
  });
  if (!persistCurriculumEdits(edits)) return;
  try {
    localStorage.removeItem(LEGACY_SUMMARIES_KEY);
  } catch (error) {
    console.error('Không thể xóa bản tóm tắt học phần cũ:', error);
  }
  if (window.ORIGINAL_COURSE_SUMMARIES) {
    data.courseSummaries = cloneData(window.ORIGINAL_COURSE_SUMMARIES);
    data.matrix6.forEach(c => {
      c.summary = data.courseSummaries[c.maMH]?.description || '';
      c.references = data.courseSummaries[c.maMH]?.references || '';
      c.hasSummary = Boolean(c.summary || c.references);
    });
  }

  showToast('Đã khôi phục toàn bộ đề cương các môn về bản gốc ban đầu!', 'success');
  renderSummaryList();
  if (selectedSummaryCode) {
    if (data.courseSummaries[selectedSummaryCode]) selectSummaryCourse(selectedSummaryCode, false);
    else selectedSummaryCode = null;
  }
  refreshAfterCurriculumEdit();
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
    new Paragraph({
      children: [new TextRun({ text: data.metadata.university, font: 'Times New Roman', size: 26 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: data.metadata.faculty, bold: true, font: 'Times New Roman', size: 26 })]
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'TÓM TẮT HỌC PHẦN', bold: true, font: 'Times New Roman', size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.metadata.program, bold: true, font: 'Times New Roman', size: 26 })]
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
    const programFileName = (data.metadata.program || 'CTDT').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    const fileName = singleCode ? `${programFileName}_Tom_tat_hoc_phan_${singleCode}.docx` : `${programFileName}_Tom_tat_hoc_phan.docx`;

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
  a.download = `${data.metadata.program || 'CTDT'}_TomTatHocPhan_Backup.json`;
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
          ${summary.references || `Tài liệu học tập và bài giảng chuẩn của ${data.metadata.faculty} - ${data.metadata.university}.`}
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

function downloadBlob(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
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
  const metadata = data.metadata || {};
  document.title = `Bản Đồ CTĐT ${metadata.program || ''} & Khung Năng Lực Số`;
  const universityEl = document.getElementById('header-university');
  const facultyEl = document.getElementById('header-faculty');
  const badgeEl = document.getElementById('header-program-badge');
  const modeLabel = document.getElementById('btn-prog-chinhquy-label');
  const distanceModeLabel = document.getElementById('btn-prog-tuxa-label');
  if (universityEl) universityEl.textContent = metadata.university || '';
  if (facultyEl) facultyEl.textContent = metadata.faculty || '';
  if (badgeEl) badgeEl.textContent = metadata.programBadge || metadata.program || '';
  if (modeLabel) modeLabel.textContent = metadata.modeLabel || metadata.program || 'Chương trình chính quy';
  if (distanceModeLabel) distanceModeLabel.textContent = metadata.distanceLearningLabel || 'Chương trình từ xa';

  const hasDistanceLearning = Boolean(data.tuxa);
  const distanceButton = document.getElementById('btn-prog-tuxa');
  const distanceDownloads = document.getElementById('distance-learning-downloads');
  const distancePlanLink = document.getElementById('distance-learning-plan-link');
  const distanceSummaryLink = document.getElementById('distance-learning-summary-link');
  const distancePlanLabel = document.getElementById('distance-learning-plan-label');
  const distanceSummaryLabel = document.getElementById('distance-learning-summary-label');
  if (distanceButton) distanceButton.hidden = !hasDistanceLearning;
  if (distanceDownloads) distanceDownloads.hidden = !hasDistanceLearning;
  if (distancePlanLink && metadata.downloads?.distanceLearningPlan) {
    distancePlanLink.href = metadata.downloads.distanceLearningPlan;
  }
  if (distanceSummaryLink && metadata.downloads?.distanceLearningSummary) {
    distanceSummaryLink.href = metadata.downloads.distanceLearningSummary;
  }
  if (distancePlanLabel && metadata.distanceLearningPlanLabel) {
    distancePlanLabel.textContent = `Tải BM03 ${metadata.distanceLearningPlanLabel} (.xlsx)`;
  }
  if (distanceSummaryLabel && metadata.distanceLearningSummaryLabel) {
    distanceSummaryLabel.textContent = metadata.distanceLearningSummaryLabel;
  }

  initCustomSummaries();
  renderCurriculumEditor();
  renderBM03PlanTable();
  renderOverviewTable();
  renderMatrix6Table();
  renderMatrix24Table();
  renderCLOTable();
  renderCoursePiMatrix();
  renderEvidenceCards();
  renderSummaryList();
  renderFrameworkTab();
  initCharts();
});

window.addEventListener('beforeunload', event => {
  if (!courseEditorDirty) return;
  event.preventDefault();
  event.returnValue = '';
});
