# -*- coding: utf-8 -*-
"""
Script to fix Chart rendering issues in index.html and app.js:
1. Fix flexbox collapse on canvas parent containers.
2. Add local chart.umd.min.js with CDN fallback so it works 100% offline.
3. Enhance initCharts() with instance tracking, safe destruction, retry if library is loading, and dark mode support.
4. Auto-resize charts when switching to dashboard tab.
"""

import os
import re

def fix_charts():
    # 1. FIX INDEX.HTML
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Replace Chart CDN tag with local + CDN fallback
    old_chart_tag = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'
    new_chart_tag = """<!-- Chart.js with Local Fallback for 100% Offline Support -->
  <script src="chart.umd.min.js"></script>
  <script>
    if (typeof Chart === 'undefined') {
      document.write('<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><\\/script>');
    }
  </script>"""
    if old_chart_tag in html:
        html = html.replace(old_chart_tag, new_chart_tag)
        print("[OK] Replaced Chart.js script tag in index.html")

    # Fix canvas container classes to prevent flex zero-size collapse
    # Radar chart
    html = re.sub(
        r'<div class="[^"]*min-h-\[300px\][^"]*">\s*<canvas id="radarDomainsChart"></canvas>\s*</div>',
        '<div class="relative w-full h-[320px]">\n            <canvas id="radarDomainsChart"></canvas>\n          </div>',
        html
    )
    # Bar domains chart
    html = re.sub(
        r'<div class="[^"]*min-h-\[300px\][^"]*">\s*<canvas id="barDomainsChart"></canvas>\s*</div>',
        '<div class="relative w-full h-[320px]">\n            <canvas id="barDomainsChart"></canvas>\n          </div>',
        html
    )
    # Doughnut blocks chart
    html = re.sub(
        r'<div class="[^"]*h-\[240px\][^"]*">\s*<canvas id="doughnutBlocksChart"></canvas>\s*</div>',
        '<div class="relative w-full h-[260px]">\n            <canvas id="doughnutBlocksChart"></canvas>\n          </div>',
        html
    )
    # Bar levels chart
    html = re.sub(
        r'<div class="[^"]*h-\[240px\][^"]*">\s*<canvas id="barLevelsChart"></canvas>\s*</div>',
        '<div class="relative w-full h-[260px]">\n            <canvas id="barLevelsChart"></canvas>\n          </div>',
        html
    )
    print("[OK] Replaced canvas containers with explicit dimension divs in index.html")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

    # 2. FIX APP.JS
    with open('app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    # Replace toggleDarkMode to trigger chart re-render
    old_toggle_dm = """function toggleDarkMode() {
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
}"""

    new_toggle_dm = """function toggleDarkMode() {
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
}"""
    if old_toggle_dm in app_js:
        app_js = app_js.replace(old_toggle_dm, new_toggle_dm)
        print("[OK] Updated toggleDarkMode in app.js")

    # Update switchTab to resize charts
    old_switch_tab = "window.scrollTo({ top: 0, behavior: 'smooth' });"
    new_switch_tab = """window.scrollTo({ top: 0, behavior: 'smooth' });
  if (tabId === 'dashboard') {
    setTimeout(() => {
      Object.values(chartInstances).forEach(c => c && c.resize && c.resize());
    }, 100);
  }"""
    if old_switch_tab in app_js and "if (tabId === 'dashboard')" not in app_js:
        app_js = app_js.replace(old_switch_tab, new_switch_tab, 1)
        print("[OK] Updated switchTab to resize charts in app.js")

    # Replace initCharts() with robust version
    chart_code_start = app_js.find("// Initialize Charts\nfunction initCharts()")
    chart_code_end = app_js.find("// Modal Close on Esc key or Backdrop click", chart_code_start)

    new_init_charts = """// Initialize Charts
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
"""

    if chart_code_start != -1 and chart_code_end != -1:
        app_js = app_js[:chart_code_start] + new_init_charts.strip() + "\n\n" + app_js[chart_code_end:]
        print("[OK] Replaced initCharts in app.js")

    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(app_js)

    print("Now syncing into index.html via build_data...")
    import build_data
    build_data.build_data()
    print("All chart fixes applied and synced successfully!")

if __name__ == "__main__":
    fix_charts()
