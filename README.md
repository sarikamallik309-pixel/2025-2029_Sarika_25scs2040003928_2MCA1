# 📊 Retail Intelligence & Sales Forecasting Dashboard

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen)](https://github.com/)
[![Tech Stack](https://img.shields.io/badge/Tech--Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Plotly.js%20%7C%20Python-blue)](https://github.com/)
[![Models](https://img.shields.io/badge/Models-ARIMA%20%7C%20Prophet%20%7C%20Holt--Winters%20%7C%20LSTM-purple)](https://github.com/)

> Production-grade **Sales Forecasting & Data Analytics Web Application** implementing time-series statistical algorithms and deep learning sequence models. Based on internship research by **Sarika Kumari** (MCA, Roll: 25scs2040003928) at **Codec Technologies Pvt. Ltd.** / **IILM University** (AICTE / ICAC Approved).

---

## 🌟 Key Features

- **🟡 Power BI & 🟢 Excel Canvas Themes**: Toggle dynamically between Microsoft Power BI Dark Slate, Microsoft Excel Financial Grid, and Dark Obsidian Retail themes.
- **📈 Multi-Model Forecasting**:
  - **LSTM Neural Network**: Deep learning recurrent sequence model ($R^2 = 0.996$).
  - **Holt-Winters Triple Exponential Smoothing**: Level + Trend + Seasonality.
  - **Facebook Prophet**: Additive growth + Fourier harmonics + promotional regressors.
  - **ARIMA / SARIMA**: Statistical auto-regressive integrated moving average.
- **📊 95% Statistical Confidence Ribbons**: Shaded prediction intervals ($y \pm 1.96 \cdot \text{RMSE}$) on Plotly charts.
- **🧩 Time-Series Seasonal Decomposition**: 4-panel Additive & Multiplicative decomposition ($Y_t = T_t + S_t + R_t$) & 15-lag ACF autocorrelation plots.
- **📦 Supply Chain & Inventory Matrix**: Automated safety stock and reorder point risk heatmap.
- **🎛️ Promotional Scenario Simulator**: Interactive sliders for promotional discount %, marketing spend, and macroeconomic demand index.
- **📁 Multi-Category & Resampling**: Supports 4 retail verticals (*Electronics*, *Apparel*, *Home*, *Beauty*) with *Daily*, *Weekly*, and *Monthly* resampling.
- **📥 Excel & Power BI Export**: Download formatted CSV/Excel datasets with DAX-style measures.

---

## 🛠️ Project Architecture

```text
intern/
├── index.html                   # HTML5 Semantic Dashboard Layout
├── style.css                    # Power BI & Excel Theme System & CSS Variables
├── app.js                       # Dashboard Controller & Plotly Chart Engine
├── forecasting_engine.js        # ARIMA, Prophet, Holt-Winters, & LSTM Math Algorithms
├── dataset.js                   # Multi-Category Dataset Generator & Resampler
├── Sarika_Kumari_Internship_Report.docx  # Original MCA Internship Report
├── python_pipeline/
│   ├── sales_forecasting.py     # Standalone Python Analytics Script
│   └── forecast_summary.json    # Exported Model Accuracy Metrics
└── README.md                    # Repository Documentation
```

---

## 🚀 How to Run Locally

### Option 1: Python HTTP Server
```bash
# Start local HTTP server on port 8080
python -m http.server 8080
```
Open **[http://localhost:8080/](http://localhost:8080/)** in your browser.

### Option 2: Python CLI Analytics Pipeline
```bash
# Execute standalone Python model benchmark
python python_pipeline/sales_forecasting.py
```

---

## 🌐 Deploying to GitHub Pages (Free Live Hosting)

1. Create a repository on GitHub named `sales-forecasting-dashboard`.
2. Push or upload all project files.
3. Go to **Settings -> Pages**.
4. Set Source to `main` branch, root `/`.
5. Click **Save**. Your site will be live at `https://<your-username>.github.io/sales-forecasting-dashboard/`.

---

## 🎓 Internship & Academic Credits

- **Student**: Sarika Kumari (MCA)
- **Roll Number**: 25scs2040003928
- **University**: School of Computer Science & Engineering, IILM University, Greater Noida, U.P.
- **Host Organization**: Codec Technologies Pvt. Ltd. (ISO 9001:2015 Certified, Google for Education Partner)
- **Program Approval**: National Internship Portal under AICTE & ICAC
