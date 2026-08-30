/**
 * Dashboard Main Controller
 * Supports Power BI Dark, Excel Financial, & Obsidian Themes
 * Sales Forecasting Web Application - Sarika Kumari (Codec Technologies)
 */

document.addEventListener("DOMContentLoaded", function () {

    // --- APPLICATION STATE ---
    let currentTheme = "powerbi";
    let activeCategoryKey = "electronics";
    let activeGranularity = "daily";
    let rawDailyDataset = DefaultDataset.getSampleData(activeCategoryKey, 730);
    let activeDataset = rawDailyDataset;
    let pipelineResults = null;

    // Theme Color Tokens for Plotly Charts
    const THEME_COLORS = {
        powerbi: {
            primary: '#F2C811',      // Power BI Gold
            secondary: '#0078D4',    // Fabric Blue
            accent: '#10B981',       // Emerald
            font: '#9CA3AF',
            grid: 'rgba(255,255,255,0.06)'
        },
        excel: {
            primary: '#36C275',      // Excel Mint Green
            secondary: '#107C41',    // Excel Dark Green
            accent: '#EAB308',       // Amber
            font: '#94A3B8',
            grid: 'rgba(16, 124, 65, 0.15)'
        },
        obsidian: {
            primary: '#06B6D4',      // Electric Cyan
            secondary: '#3B82F6',    // Blue
            accent: '#10B981',       // Emerald
            font: '#94A3B8',
            grid: 'rgba(255,255,255,0.06)'
        }
    };

    function getCommonLayout() {
        const colors = THEME_COLORS[currentTheme] || THEME_COLORS.powerbi;
        return {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: colors.font, family: 'Inter, sans-serif' },
            margin: { l: 55, r: 25, t: 40, b: 40 },
            legend: { orientation: 'h', y: 1.15, x: 0 },
            xaxis: { gridcolor: colors.grid, zerolinecolor: 'rgba(255,255,255,0.1)' },
            yaxis: { gridcolor: colors.grid, zerolinecolor: 'rgba(255,255,255,0.1)' }
        };
    }

    // --- INITIALIZATION ---
    initApp();

    function initApp() {
        setupEventListeners();
        loadDatasetAndRun();
    }

    function setupEventListeners() {
        // Theme Selector Dropdown
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                currentTheme = e.target.value;
                document.documentElement.setAttribute('data-theme', currentTheme);
                runAnalytics(); // Recolor all Plotly charts for selected theme
            });
        }

        // Tab Navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetTab = btn.getAttribute('data-tab');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                    window.dispatchEvent(new Event('resize'));
                }
            });
        });

        // Category Switcher Pills
        const categoryBtns = document.querySelectorAll('#categorySegments .segment-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategoryKey = btn.getAttribute('data-category');
                
                let catProfile = DefaultDataset.CATEGORY_PROFILES[activeCategoryKey];
                const activeCatEl = document.getElementById('activeCategoryName');
                if (activeCatEl && catProfile) {
                    activeCatEl.innerText = catProfile.name;
                }
                
                loadDatasetAndRun();
            });
        });

        // Granularity Resampling Switcher Pills
        const granBtns = document.querySelectorAll('#granularitySegments .segment-btn');
        granBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                granBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeGranularity = btn.getAttribute('data-resample');
                loadDatasetAndRun();
            });
        });

        // Moving Average Selector
        const maSelect = document.getElementById('movingAvgSelect');
        if (maSelect) {
            maSelect.addEventListener('change', () => renderHistoricalOverview());
        }

        // Decomposition Mode Selector
        const decompSelect = document.getElementById('decompModeSelect');
        if (decompSelect) {
            decompSelect.addEventListener('change', () => runAnalytics());
        }

        // Forecast Horizon Selector
        const horizonSelect = document.getElementById('forecastHorizonSelect');
        if (horizonSelect) {
            horizonSelect.addEventListener('change', () => runAnalytics());
        }

        // CSV File Ingestion
        const btnUpload = document.getElementById('btnUploadCSV');
        const csvInput = document.getElementById('csvFileInput');
        if (btnUpload && csvInput) {
            btnUpload.addEventListener('click', () => csvInput.click());
            csvInput.addEventListener('change', handleCSVUpload);
        }

        // Excel / Power BI Report Export
        const btnExport = document.getElementById('btnExportReport');
        if (btnExport) {
            btnExport.addEventListener('click', handleExportCSV);
        }

        // Simulator Sliders
        const sliderDiscount = document.getElementById('sliderPromoDiscount');
        const sliderSpend = document.getElementById('sliderMktgSpend');
        const sliderDemand = document.getElementById('sliderDemandIdx');

        if (sliderDiscount && sliderSpend && sliderDemand) {
            [sliderDiscount, sliderSpend, sliderDemand].forEach(slider => {
                slider.addEventListener('input', () => {
                    document.getElementById('valPromoDiscount').innerText = sliderDiscount.value + '%';
                    document.getElementById('valMktgSpend').innerText = sliderSpend.value + 'x';
                    document.getElementById('valDemandIdx').innerText = sliderDemand.value + 'x';
                    renderSimulatorChart();
                });
            });
        }
    }

    function loadDatasetAndRun() {
        rawDailyDataset = DefaultDataset.getSampleData(activeCategoryKey, 730);
        activeDataset = DefaultDataset.resampleData(rawDailyDataset, activeGranularity);
        runAnalytics();
    }

    function runAnalytics() {
        const horizon = parseInt(document.getElementById('forecastHorizonSelect')?.value || 60);
        const decompMode = document.getElementById('decompModeSelect')?.value || "additive";

        pipelineResults = ForecastingEngine.runPipeline(activeDataset, horizon, 0.20, 1.25, decompMode);

        updateKPICards();
        renderHistoricalOverview();
        renderDecomposition();
        renderModelComparison();
        renderMetricsTable();
        renderSupplyChainGrid();
        renderSimulatorChart();
    }

    // --- KPI CARDS UPDATER ---
    function updateKPICards() {
        const totalSales = activeDataset.reduce((sum, d) => sum + d.sales, 0);
        const avgSales = totalSales / activeDataset.length;

        document.getElementById('kpiRevenueVal').innerText = '$' + totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('kpiAvgDailyVal').innerText = '$' + avgSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (pipelineResults && pipelineResults.metrics) {
            let metrics = pipelineResults.metrics;
            let bestModel = "LSTM";
            let highestR2 = metrics.LSTM.r2;

            Object.keys(metrics).forEach(key => {
                if (metrics[key].r2 > highestR2) {
                    bestModel = key;
                    highestR2 = metrics[key].r2;
                }
            });

            document.getElementById('kpiBestModelVal').innerText = bestModel;
            document.getElementById('kpiBestModelSub').innerText = `Highest R² Score (${highestR2})`;
        }
    }

    // --- CHART 1: HISTORICAL OVERVIEW ---
    function renderHistoricalOverview() {
        const colors = THEME_COLORS[currentTheme] || THEME_COLORS.powerbi;
        const dates = activeDataset.map(d => d.date);
        const sales = activeDataset.map(d => d.sales);
        const windowSize = parseInt(document.getElementById('movingAvgSelect')?.value || 7);

        let maSales = [];
        for (let i = 0; i < sales.length; i++) {
            if (i < windowSize - 1) {
                maSales.push(null);
            } else {
                let sum = 0;
                for (let j = 0; j < windowSize; j++) sum += sales[i - j];
                maSales.push(Math.round((sum / windowSize) * 100) / 100);
            }
        }

        const traceRaw = {
            x: dates, y: sales,
            type: 'scatter', mode: 'lines', name: 'Sales Revenue',
            line: { color: colors.primary, width: 1.5 }
        };

        const traceMA = {
            x: dates, y: maSales,
            type: 'scatter', mode: 'lines', name: `${windowSize}-Period Moving Average`,
            line: { color: colors.accent, width: 3 }
        };

        const layout = {
            ...getCommonLayout(),
            title: { text: `Historical Revenue Series (${DefaultDataset.CATEGORY_PROFILES[activeCategoryKey]?.name || 'Retail'})`, font: { color: '#FFFFFF', size: 14 } },
            yaxis: { ...getCommonLayout().yaxis, title: 'Revenue ($)' }
        };

        Plotly.newPlot('chartHistoricalOverview', [traceRaw, traceMA], layout, { responsive: true, displayModeBar: false });
    }

    // --- CHART 2: SEASONAL DECOMPOSITION ---
    function renderDecomposition() {
        if (!pipelineResults || !pipelineResults.decomposition) return;
        const colors = THEME_COLORS[currentTheme] || THEME_COLORS.powerbi;
        const decomp = pipelineResults.decomposition;
        const dates = activeDataset.map(d => d.date);

        Plotly.newPlot('chartDecompTrend', [{
            x: dates, y: decomp.trend, type: 'scatter', mode: 'lines',
            line: { color: colors.primary, width: 2.5 }
        }], {
            ...getCommonLayout(),
            title: { text: '1. Long-Term Growth Trend (T_t)', font: { color: '#FFFFFF', size: 12 } },
            margin: { l: 45, r: 15, t: 30, b: 30 }
        }, { responsive: true, displayModeBar: false });

        Plotly.newPlot('chartDecompSeasonal', [{
            x: dates, y: decomp.seasonal, type: 'scatter', mode: 'lines',
            line: { color: '#F59E0B', width: 2 }
        }], {
            ...getCommonLayout(),
            title: { text: `2. Seasonal Component (S_t, Mode: ${decomp.mode})`, font: { color: '#FFFFFF', size: 12 } },
            margin: { l: 45, r: 15, t: 30, b: 30 }
        }, { responsive: true, displayModeBar: false });

        Plotly.newPlot('chartDecompResidual', [{
            x: dates, y: decomp.residual, type: 'scatter', mode: 'markers',
            marker: { color: '#F43F5E', size: 3, opacity: 0.6 }
        }], {
            ...getCommonLayout(),
            title: { text: '3. Irregular Residual Noise (R_t)', font: { color: '#FFFFFF', size: 12 } },
            margin: { l: 45, r: 15, t: 30, b: 30 }
        }, { responsive: true, displayModeBar: false });

        const acfValues = ForecastingEngine.calculateACF(activeDataset.map(d => d.sales), 15);
        const lags = Array.from({ length: 15 }, (_, i) => `Lag ${i + 1}`);

        Plotly.newPlot('chartACFPlot', [{
            x: lags, y: acfValues, type: 'bar',
            marker: { color: '#8B5CF6' }
        }], {
            ...getCommonLayout(),
            title: { text: '4. Autocorrelation Function (ACF)', font: { color: '#FFFFFF', size: 12 } },
            margin: { l: 45, r: 15, t: 30, b: 30 }
        }, { responsive: true, displayModeBar: false });
    }

    // --- CHART 3: MODEL COMPARISON WITH 95% CONFIDENCE RIBBON ---
    function renderModelComparison() {
        if (!pipelineResults) return;
        const colors = THEME_COLORS[currentTheme] || THEME_COLORS.powerbi;

        const testData = pipelineResults.testData;
        const testDates = testData.map(d => d.date);
        const actualSales = testData.map(d => d.sales);

        const lstmFut = pipelineResults.futureForecasts.LSTM;
        const futDates = lstmFut.map(d => d.date);
        const lstmPred = lstmFut.map(d => d.sales);
        const lstmUpper = lstmFut.map(d => d.upper_bound);
        const lstmLower = lstmFut.map(d => d.lower_bound);

        const hwSales = pipelineResults.futureForecasts.HoltWinters.map(d => d.sales);
        const arimaSales = pipelineResults.futureForecasts.ARIMA.map(d => d.sales);
        const prophetSales = pipelineResults.futureForecasts.Prophet.map(d => d.sales);

        const traceActual = {
            x: testDates, y: actualSales,
            type: 'scatter', mode: 'lines+markers', name: 'Actual Historical',
            line: { color: '#FFFFFF', width: 2.5 },
            marker: { size: 4 }
        };

        const traceUpper = {
            x: futDates, y: lstmUpper,
            type: 'scatter', mode: 'lines', name: '95% Confidence Upper',
            line: { color: 'transparent' }, showlegend: false
        };

        const traceLower = {
            x: futDates, y: lstmLower,
            type: 'scatter', mode: 'lines', name: '95% Confidence Interval Band',
            fill: 'tonexty', fillcolor: 'rgba(242, 200, 17, 0.15)',
            line: { color: 'transparent' }
        };

        const traceLSTM = {
            x: futDates, y: lstmPred,
            type: 'scatter', mode: 'lines', name: 'LSTM Forecast',
            line: { color: colors.primary, width: 3 }
        };

        const traceHW = {
            x: futDates, y: hwSales,
            type: 'scatter', mode: 'lines', name: 'Holt-Winters Model',
            line: { color: '#10B981', width: 2, dash: 'dot' }
        };

        const traceARIMA = {
            x: futDates, y: arimaSales,
            type: 'scatter', mode: 'lines', name: 'ARIMA Model',
            line: { color: '#F59E0B', width: 2, dash: 'dash' }
        };

        const traceProphet = {
            x: futDates, y: prophetSales,
            type: 'scatter', mode: 'lines', name: 'Prophet Model',
            line: { color: '#8B5CF6', width: 2, dash: 'dashdot' }
        };

        const layout = {
            ...getCommonLayout(),
            title: { text: 'Multi-Model Predictions with 95% Confidence Ribbon', font: { color: '#FFFFFF', size: 14 } },
            yaxis: { ...getCommonLayout().yaxis, title: 'Sales ($)' }
        };

        Plotly.newPlot('chartModelComparison', [traceActual, traceUpper, traceLower, traceLSTM, traceHW, traceARIMA, traceProphet], layout, { responsive: true, displayModeBar: false });
    }

    // --- TABLE: METRICS COMPARISON ---
    function renderMetricsTable() {
        if (!pipelineResults || !pipelineResults.metrics) return;

        const tbody = document.getElementById('metricsTableBody');
        if (!tbody) return;

        const metrics = pipelineResults.metrics;
        const models = [
            { name: "LSTM Neural Network", key: "LSTM", desc: "Deep Recurrent Sequence Predictor" },
            { name: "Holt-Winters Exponential Smoothing", key: "HoltWinters", desc: "Triple Exponential (Level + Trend + Seasonality)" },
            { name: "Facebook Prophet", key: "Prophet", desc: "Additive Trend + Fourier Seasonality + Promo Regressors" },
            { name: "ARIMA / SARIMA", key: "ARIMA", desc: "Statistical Auto-Regressive Integrated Moving Average" }
        ];

        let maxR2 = Math.max(...Object.values(metrics).map(m => m.r2));

        let html = "";
        models.forEach(m => {
            const data = metrics[m.key];
            const isWinner = data.r2 === maxR2 && maxR2 > 0;
            const rowClass = isWinner ? "highlight-winner" : "";
            const winnerBadge = isWinner ? '<span class="winner-badge">⭐ HIGHEST R² ACCURACY</span>' : "";

            let summaryText = "Solid Baseline";
            if (data.r2 >= 0.90) summaryText = "High Precision Neural Architecture";
            else if (data.r2 >= 0.70) summaryText = "Strong Statistical Fit";

            html += `
                <tr class="${rowClass}">
                    <td><strong>${m.name}</strong> ${winnerBadge}</td>
                    <td>$${data.mae.toFixed(2)}</td>
                    <td>$${data.rmse.toFixed(2)}</td>
                    <td>${data.mape.toFixed(2)}%</td>
                    <td><strong>${data.r2.toFixed(3)}</strong></td>
                    <td style="color:var(--text-secondary); font-size:0.8rem;">${summaryText} - ${m.desc}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // --- SUPPLY CHAIN & INVENTORY RISK GRID ---
    function renderSupplyChainGrid() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid || !activeDataset) return;

        const avgUnits = activeDataset.reduce((s, d) => s + d.units_sold, 0) / activeDataset.length;

        const items = [
            { name: "Top SKU Core Inventory", reorder: Math.round(avgUnits * 14), stock: Math.round(avgUnits * 9), risk: "critical", badge: "Critical Reorder Triggered" },
            { name: "High-Margin Seasonal Stock", reorder: Math.round(avgUnits * 21), stock: Math.round(avgUnits * 28), risk: "optimal", badge: "Optimal Safety Buffer" },
            { name: "Promotional Event Buffer", reorder: Math.round(avgUnits * 30), stock: Math.round(avgUnits * 22), risk: "warning", badge: "Reorder Required in 5 Days" }
        ];

        let html = "";
        items.forEach(item => {
            let badgeClass = item.risk === "critical" ? "risk-critical" : (item.risk === "optimal" ? "risk-optimal" : "risk-warning");
            html += `
                <div class="inventory-card">
                    <div class="inventory-header">
                        <span>${item.name}</span>
                        <span class="risk-badge ${badgeClass}">${item.badge}</span>
                    </div>
                    <div class="inventory-body">
                        Current On-Hand Stock: <strong>${item.stock.toLocaleString()} Units</strong><br>
                        Calculated Reorder Threshold: <strong>${item.reorder.toLocaleString()} Units</strong><br>
                        Lead Time Supply Coverage: <strong>${Math.round(item.stock / (avgUnits + 1e-5))} Days</strong>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    // --- CHART 4: SIMULATOR PROJECTION ---
    function renderSimulatorChart() {
        if (!pipelineResults) return;
        const colors = THEME_COLORS[currentTheme] || THEME_COLORS.powerbi;

        const discount = parseFloat(document.getElementById('sliderPromoDiscount')?.value || 20);
        const spendMult = parseFloat(document.getElementById('sliderMktgSpend')?.value || 1.5);
        const demandIdx = parseFloat(document.getElementById('sliderDemandIdx')?.value || 1.0);

        const futureLSTM = pipelineResults.futureForecasts.LSTM;
        const dates = futureLSTM.map(d => d.date);
        const baseSales = futureLSTM.map(d => d.sales);

        const simulatedSales = baseSales.map(val => {
            let liftFactor = 1.0 + (discount / 100 * 0.48) + ((spendMult - 1.0) * 0.20) + ((demandIdx - 1.0) * 0.38);
            return Math.round(val * liftFactor * 100) / 100;
        });

        const traceBase = {
            x: dates, y: baseSales,
            type: 'scatter', mode: 'lines', name: 'Baseline Forecast',
            line: { color: 'rgba(255, 255, 255, 0.4)', width: 2, dash: 'dash' }
        };

        const traceSim = {
            x: dates, y: simulatedSales,
            type: 'scatter', mode: 'lines', name: 'Simulated Lift Sales',
            fill: 'tonexty', fillcolor: 'rgba(242, 200, 17, 0.15)',
            line: { color: colors.primary, width: 3 }
        };

        const layout = {
            ...getCommonLayout(),
            title: { text: 'Simulated Promotional Sales Lift Curve', font: { color: '#FFFFFF', size: 14 } },
            yaxis: { ...getCommonLayout().yaxis, title: 'Projected Sales ($)' }
        };

        Plotly.newPlot('chartSimulatorProjection', [traceBase, traceSim], layout, { responsive: true, displayModeBar: false });
    }

    // --- HANDLER: CSV UPLOAD & EXPORT ---
    function handleCSVUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const parsed = DefaultDataset.parseCSV(event.target.result);
                if (parsed && parsed.length > 20) {
                    rawDailyDataset = parsed;
                    activeDataset = parsed;
                    runAnalytics();
                    alert(`Successfully imported ${parsed.length} custom sales records!`);
                } else {
                    alert("Invalid CSV format. Please include 'Date' and 'Sales' columns.");
                }
            } catch (err) {
                alert("Error parsing CSV: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    function handleExportCSV() {
        if (!activeDataset) return;
        const csvData = DefaultDataset.exportToCSV(activeDataset);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `PowerBI_Excel_Forecasting_Report_${activeCategoryKey}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
