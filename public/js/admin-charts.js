(function () {
  const COLORS = {
    bleu: '#0047FF',
    bleuLight: '#3D6FFF',
    jaune: '#FFB800',
    jauneLight: '#FFCA28',
    noir: '#1C1C1C',
    gris: '#D4D4D4'
  };

  const PALETTE = [COLORS.bleu, COLORS.jaune, COLORS.bleuLight, '#6B8FFF', '#E6A800', '#8099FF', '#FFD04D'];

  Chart.defaults.font.family = "'Montserrat', sans-serif";
  Chart.defaults.color = '#7A7A7A';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle';

  function formatDay(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  }

  function initTrafficChart(canvas, data) {
    if (!canvas || !data) return;
    const labels = data.labels.map(formatDay);
    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Pages vues',
            data: data.pageViews,
            borderColor: COLORS.bleu,
            backgroundColor: 'rgba(0, 71, 255, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: COLORS.bleu,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Visiteurs',
            data: data.visitors,
            borderColor: COLORS.jaune,
            backgroundColor: 'rgba(255, 184, 0, 0.06)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: COLORS.jaune,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            backgroundColor: COLORS.noir,
            padding: 12,
            cornerRadius: 8,
            titleFont: { weight: '700' }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { precision: 0 } }
        }
      }
    });
  }

  function initDoughnutChart(canvas, labels, values, cutout) {
    if (!canvas || !labels?.length) return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: cutout || '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 11, weight: '600' } } },
          tooltip: { backgroundColor: COLORS.noir, padding: 12, cornerRadius: 8 }
        }
      }
    });
  }

  function initBarChart(canvas, labels, values, horizontal) {
    if (!canvas || !labels?.length) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: horizontal
            ? labels.map((_, i) => PALETTE[i % PALETTE.length])
            : 'rgba(0, 71, 255, 0.75)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: { legend: { display: false }, tooltip: { backgroundColor: COLORS.noir, padding: 12, cornerRadius: 8 } },
        scales: {
          x: { grid: { display: !horizontal, color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { precision: 0 } },
          y: { grid: { display: horizontal, color: 'rgba(0,0,0,0.05)' }, border: { display: false }, beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  const data = window.__ADMIN_CHARTS__;
  if (!data) return;

  if (data.traffic) initTrafficChart(document.getElementById('chart-traffic'), data.traffic);
  if (data.content) initDoughnutChart(document.getElementById('chart-content'), data.content.labels, data.content.values);
  if (data.sources) initDoughnutChart(document.getElementById('chart-sources'), data.sources.labels, data.sources.values, '60%');
  if (data.devices) initBarChart(document.getElementById('chart-devices'), data.devices.labels, data.devices.values, true);
  if (data.browsers) initBarChart(document.getElementById('chart-browsers'), data.browsers.labels, data.browsers.values, true);
  if (data.pages) initBarChart(document.getElementById('chart-pages'), data.pages.labels, data.pages.values, false);
})();
