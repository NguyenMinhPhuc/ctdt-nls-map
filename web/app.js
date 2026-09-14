const data = window.CURRICULUM_DATA;
let currentTab = 'dashboard';
let chartsInitialized = false;

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

// Render Summaries list & view
let selectedSummaryCode = null;

function renderSummaryList() {
  const listEl = document.getElementById('summaryCoursesList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const summaryKeys = Object.keys(data.courseSummaries);
  if (summaryKeys.length === 0) {
    listEl.innerHTML = '<p class="text-xs text-slate-400 p-3">Chưa có dữ liệu tóm tắt</p>';
    return;
  }

  summaryKeys.forEach((code, idx) => {
    const item = data.courseSummaries[code];
    const btn = document.createElement('button');
    btn.id = `summary-item-${code}`;
    btn.className = `w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn ${idx === 0 ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'}`;
    btn.onclick = () => selectSummaryCourse(code);
    btn.dataset.search = (item.code + ' ' + item.title).toLowerCase();

    btn.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-sky-600 dark:text-sky-400">${item.code}</span>
        <span class="text-[10px] text-slate-400"><i class="fa-solid fa-chevron-right"></i></span>
      </div>
      <div class="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">${item.title}</div>
    `;
    listEl.appendChild(btn);
  });

  if (summaryKeys.length > 0) {
    selectSummaryCourse(summaryKeys[0]);
  }
}

function selectSummaryCourse(code) {
  selectedSummaryCode = code;
  const item = data.courseSummaries[code];
  const detailEl = document.getElementById('summaryDetailContainer');
  if (!item || !detailEl) return;

  document.querySelectorAll('.summary-list-btn').forEach(b => {
    b.className = 'w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn hover:bg-slate-50 dark:hover:bg-slate-700/60';
  });
  const activeBtn = document.getElementById(`summary-item-${code}`);
  if (activeBtn) {
    activeBtn.className = 'w-full text-left p-3 rounded-lg text-xs transition-all flex flex-col gap-0.5 summary-list-btn bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800';
  }

  const plan = data.coursePlan[code] || {};

  detailEl.innerHTML = `
    <div class="border-b border-slate-200 dark:border-slate-700 pb-4 mb-5">
      <div class="flex items-center space-x-3 mb-2">
        <span class="font-mono text-sm font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-md border border-sky-200 dark:border-sky-800">${item.code}</span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${plan.semester || 'Học phần CTDT 2026'} • ${plan.credits || '3'} Tín chỉ${plan.totalHours ? ` • ${plan.totalHours} tiết (LT: ${plan.theoryHours ?? 0} • TH: ${plan.practiceHours ?? 0} • BT: ${plan.exerciseHours ?? 0})` : ''}</span>
      </div>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${item.title}</h2>
    </div>

    <div class="space-y-6 flex-1">
      <div>
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
          <i class="fa-solid fa-align-left text-sky-500"></i> Mục Tiêu & Tóm Tắt Nội Dung Học Phần
        </h4>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          ${item.description || 'Chưa có mô tả tóm tắt cho học phần này.'}
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
          <i class="fa-solid fa-book-bookmark text-emerald-500"></i> Giáo Trình & Tài Liệu Tham Khảo
        </h4>
        <div class="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line">
          ${item.references || 'Chưa có thông tin giáo trình tài liệu tham khảo.'}
        </div>
      </div>

      <div class="pt-4 flex items-center gap-3">
        <button onclick="openCourseModal('${item.code}')" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2">
          <i class="fa-solid fa-list-check"></i> Xem bảng ánh xạ CLO của môn
        </button>
      </div>
    </div>
  `;
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
function initCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  // 1. Radar Chart
  const radarCtx = document.getElementById('radarDomainsChart');
  if (radarCtx) {
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

    new Chart(radarCtx, {
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
            pointHoverBorderColor: 'rgb(14, 165, 233)'
          },
          {
            label: 'Số môn học phủ',
            data: domainCourses,
            backgroundColor: 'rgba(139, 92, 246, 0.25)',
            borderColor: 'rgb(139, 92, 246)',
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(139, 92, 246)'
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
            grid: { color: 'rgba(148, 163, 184, 0.2)' }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 2. Bar Chart Domains
  const barCtx = document.getElementById('barDomainsChart');
  if (barCtx) {
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

    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: domainLabels,
        datasets: [
          {
            label: 'Số lượng môn học phủ',
            data: domainCourses,
            backgroundColor: '#0284c7',
            borderRadius: 6
          },
          {
            label: 'Số lượng CLO ánh xạ',
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
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 3. Doughnut Blocks
  const doughnutCtx = document.getElementById('doughnutBlocksChart');
  if (doughnutCtx) {
    const blocks = {};
    data.matrix6.forEach(c => {
      const b = c.khoiKT || 'Khác';
      blocks[b] = (blocks[b] || 0) + 1;
    });

    new Chart(doughnutCtx, {
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
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // 4. Bar Levels
  const levelsCtx = document.getElementById('barLevelsChart');
  if (levelsCtx) {
    const levelCounts = { 'Mức 1': 0, 'Mức 2': 0, 'Mức 3': 0, 'Mức 4': 0, 'Mức 5': 0 };
    data.cloMappings.forEach(m => {
      const lvl = m.mucDoNLS;
      if (levelCounts[lvl] !== undefined) levelCounts[lvl]++;
    });

    new Chart(levelsCtx, {
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
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
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
  renderOverviewTable();
  renderMatrix6Table();
  renderMatrix24Table();
  renderCLOTable();
  renderEvidenceCards();
  renderSummaryList();
  renderFrameworkTab();
  initCharts();
});
