/**
 * Advanced Multi-Category Retail Dataset Provider
 * Power BI & Excel Dataset Export Suite
 * Sales Forecasting Application - Sarika Kumari (Codec Technologies)
 */

const DefaultDataset = (function() {
    
    const CATEGORY_PROFILES = {
        electronics: {
            name: "Electronics & Tech",
            baseSales: 4500.0,
            trendSlope: 4.8,
            avgUnitPrice: 320.0,
            weekendMultiplier: 1.18,
            holidayMultiplier: 1.85,
            promoSensitivity: 1.35
        },
        apparel: {
            name: "Apparel & Fashion",
            baseSales: 2100.0,
            trendSlope: 2.4,
            avgUnitPrice: 65.0,
            weekendMultiplier: 1.38,
            holidayMultiplier: 1.60,
            promoSensitivity: 1.50
        },
        home: {
            name: "Home & Living",
            baseSales: 3200.0,
            trendSlope: 3.1,
            avgUnitPrice: 140.0,
            weekendMultiplier: 1.12,
            holidayMultiplier: 1.40,
            promoSensitivity: 1.20
        },
        beauty: {
            name: "Beauty & Personal Care",
            baseSales: 1600.0,
            trendSlope: 2.8,
            avgUnitPrice: 38.0,
            weekendMultiplier: 1.25,
            holidayMultiplier: 1.50,
            promoSensitivity: 1.45
        }
    };

    function generateRetailData(categoryKey = "electronics", days = 730, startDateStr = "2024-01-01") {
        const profile = CATEGORY_PROFILES[categoryKey] || CATEGORY_PROFILES.electronics;
        const data = [];
        let startDate = new Date(startDateStr);

        for (let i = 0; i < days; i++) {
            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            let dateStr = currentDate.toISOString().split('T')[0];
            let month = currentDate.getMonth(); // 0-11
            let dayOfWeek = currentDate.getDay(); // 0=Sun, ..., 6=Sat
            let dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

            let trend = profile.baseSales + (i * profile.trendSlope);

            let weeklyMult = 1.0;
            if (dayOfWeek === 5) weeklyMult = profile.weekendMultiplier * 0.95;
            else if (dayOfWeek === 6) weeklyMult = profile.weekendMultiplier;
            else if (dayOfWeek === 0) weeklyMult = profile.weekendMultiplier * 0.90;
            else if (dayOfWeek === 1) weeklyMult = 0.85;

            let yearlyMult = 1.0 + 0.22 * Math.sin(2 * Math.PI * (dayOfYear - 75) / 365.25);
            if (categoryKey === "apparel") {
                yearlyMult += 0.15 * Math.cos(4 * Math.PI * dayOfYear / 365.25);
            }

            let holidayMult = 1.0;
            if (month === 10 && currentDate.getDate() >= 20) {
                holidayMult = profile.holidayMultiplier * 0.90;
            } else if (month === 11 && currentDate.getDate() >= 10) {
                holidayMult = profile.holidayMultiplier;
            } else if (month === 0 && currentDate.getDate() <= 5) {
                holidayMult = 1.25;
            }

            let isPromo = (i % 7 === 2 || (i % 13 === 0 && i > 0)) ? 1 : 0;
            let promoDiscount = isPromo ? (10 + (i % 4) * 5) : 0;
            let promoMult = isPromo ? (1 + (promoDiscount / 100) * (profile.promoSensitivity - 1.0) * 2.5) : 1.0;

            let pseudoRandom = Math.sin(i * 9999 + 123) * 0.04;
            let noise = 1.0 + pseudoRandom;

            let finalSales = Math.round(trend * weeklyMult * yearlyMult * holidayMult * promoMult * noise * 100) / 100;
            let unitPrice = profile.avgUnitPrice + Math.sin(i * 0.1) * (profile.avgUnitPrice * 0.05);
            let unitsSold = Math.max(1, Math.round(finalSales / unitPrice));

            data.push({
                date: dateStr,
                sales: finalSales,
                units_sold: unitsSold,
                is_promo: isPromo,
                promo_discount: promoDiscount,
                category: profile.name,
                category_key: categoryKey,
                day_name: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                month_name: currentDate.toLocaleDateString('en-US', { month: 'short' })
            });
        }

        return data;
    }

    function resampleData(data, granularity = "daily") {
        if (granularity === "daily" || !data || data.length === 0) return data;

        const grouped = {};
        data.forEach(item => {
            let dt = new Date(item.date);
            let key = item.date;

            if (granularity === "weekly") {
                let firstDayOfYear = new Date(dt.getFullYear(), 0, 1);
                let pastDaysOfYear = (dt - firstDayOfYear) / 86400000;
                let weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                key = `${dt.getFullYear()}-W${weekNum < 10 ? '0' + weekNum : weekNum}`;
            } else if (granularity === "monthly") {
                key = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
            }

            if (!grouped[key]) {
                grouped[key] = {
                    date: item.date,
                    group_key: key,
                    sales: 0,
                    units_sold: 0,
                    is_promo: 0,
                    promo_discount: 0,
                    category: item.category,
                    count: 0
                };
            }

            grouped[key].sales += item.sales;
            grouped[key].units_sold += item.units_sold;
            grouped[key].is_promo += item.is_promo;
            grouped[key].count += 1;
        });

        return Object.values(grouped).map(g => ({
            date: g.date,
            group_key: g.group_key,
            sales: Math.round(g.sales * 100) / 100,
            units_sold: g.units_sold,
            is_promo: g.is_promo > 0 ? 1 : 0,
            count: g.count
        }));
    }

    function exportToCSV(data) {
        if (!data || !data.length) return "";
        const headers = Object.keys(data[0]);
        const csvRows = [
            "# Power BI & Excel Dataset Export - Sales Forecasting Intelligence",
            "# Author: Sarika Kumari (MCA - Codec Technologies / IILM University)",
            "# Data Schema: Date, Sales, Units_Sold, Is_Promo, Category",
            headers.join(",")
        ];

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                return typeof val === 'string' ? `"${val}"` : val;
            });
            csvRows.push(values.join(","));
        }
        return csvRows.join("\n");
    }

    function parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "" && !line.startsWith("#"));
        if (lines.length < 2) return null;

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("time") || h.includes("day"));
        const salesIdx = headers.findIndex(h => h.includes("sale") || h.includes("revenue") || h.includes("val") || h.includes("amount"));
        const promoIdx = headers.findIndex(h => h.includes("promo") || h.includes("discount") || h.includes("event"));
        const unitsIdx = headers.findIndex(h => h.includes("unit") || h.includes("qty") || h.includes("quantity"));

        if (dateIdx === -1 || salesIdx === -1) {
            throw new Error("CSV must contain columns for 'Date' and 'Sales' (or Revenue/Amount).");
        }

        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length <= Math.max(dateIdx, salesIdx)) continue;

            const rawDate = cols[dateIdx];
            const rawSales = parseFloat(cols[salesIdx]);

            if (!rawDate || isNaN(rawSales)) continue;

            const isPromo = promoIdx !== -1 ? (parseInt(cols[promoIdx]) || (cols[promoIdx].toLowerCase() === 'true' ? 1 : 0)) : 0;
            const unitsSold = unitsIdx !== -1 ? parseInt(cols[unitsIdx]) || Math.round(rawSales / 40) : Math.round(rawSales / 40);

            result.push({
                date: rawDate,
                sales: Math.round(rawSales * 100) / 100,
                units_sold: unitsSold,
                is_promo: isPromo,
                promo_discount: isPromo ? 15 : 0,
                category: "Custom Upload"
            });
        }

        return result;
    }

    return {
        CATEGORY_PROFILES,
        getSampleData: generateRetailData,
        resampleData: resampleData,
        exportToCSV: exportToCSV,
        parseCSV: parseCSV
    };
})();
