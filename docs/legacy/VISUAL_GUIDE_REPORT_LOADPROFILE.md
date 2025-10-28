# 📊 VISUAL GUIDE - Report & Load Profile Features

## 🎨 UI LAYOUT PREVIEW

### Report Page (`/dashboard/report`)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Laporan Energi Real-Time                    🟢 Connected    │
│  Analisis konsumsi energi, biaya, dan performa sistem           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Pilih Periode:                                                  │
│ [1 Jam] [6 Jam] [24 Jam ✓] [7 Hari] [30 Hari]                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Summary Statistics:                                              │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│ │ ⚡ Total Energy│ │ 💡 Avg Power   │ │ 📈 Peak Power  │       │
│ │  45.8 kWh      │ │  42.3 kW       │ │  50.0 kW       │       │
│ └────────────────┘ └────────────────┘ └────────────────┘       │
│ ┌────────────────┐                                              │
│ │ 💰 Total Cost  │                                              │
│ │  Rp 500.000    │                                              │
│ └────────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Daya Konsumsi Real-Time (Area Chart)                            │
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│
│                    📊 Animated Chart                             │
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐
│ Tegangan & Arus (Composed) │ │ Distribusi Biaya (Pie)     │
│  📊 Dual-axis Chart        │ │  🥧 Donut Distribution     │
└────────────────────────────┘ └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Semua Metrik (Line Chart)                                       │
│  📈 3-series line graph with legend                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📥 Ekspor Data:                                                 │
│ [📄 Ekspor CSV] [📋 Ekspor JSON] [📑 Print/PDF]               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📋 Detail Data (20 Latest):                                     │
│ ┌──────────┬────────────┬──────────┬────────────┬────────────┐ │
│ │ Waktu    │ Daya (W)   │ Volt (V) │ Arus (A)   │ Biaya (Rp) │ │
│ ├──────────┼────────────┼──────────┼────────────┼────────────┤ │
│ │ 12:45:30 │ 45800.50   │ 380.25   │ 125.45     │ 5000       │ │
│ │ 12:44:15 │ 44200.75   │ 379.80   │ 124.30     │ 4850       │ │
│ │ ...      │ ...        │ ...      │ ...        │ ...        │ │
│ └──────────┴────────────┴──────────┴────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### Load Profile Page (`/dashboard/load-profile`)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Analisis Profil Beban Real-Time           🟢 Connected      │
│  Analisis pola konsumsi energi dan periode puncak               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Periode Analisis:                                               │
│ [24 Jam ✓] [7 Hari] [30 Hari]                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ 📊 Daya Puncak           │ │ 📈 Daya Rata-Rata        │
│   50000 W                │ │   42300 W                │
│   pada 14:25:30          │ │   rata-rata periode      │
└──────────────────────────┘ └──────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────┐
│ ⚡ Faktor Beban          │ │ 🔥 Kejadian Puncak       │
│   84.6%                  │ │   24 kali (>80%)         │
│   rata/puncak            │ │   dalam periode ini      │
└──────────────────────────┘ └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🔄 Kurva Beban Realtime (Area Chart)                            │
│  📊 Real-time animated load curve                               │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐
│ ⏰ Distribusi Jam Kerja     │ │ 📍 Klasifikasi Beban       │
│  (Bar Chart)               │ │  (Scatter Plot)            │
│  Average power per hour    │ │  Color-coded distribution  │
└────────────────────────────┘ └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🔌 Metrik Gabungan (Line Chart)                                 │
│  Daya vs Arus dengan dual-axis                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📋 Klasifikasi Beban:                                           │
│ [🔴 Sangat Tinggi]  [🟠 Tinggi]  [🟡 Sedang]  [🟢 Rendah]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Periode Puncak Terdeteksi:                                   │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────────────┐│
│ │ Waktu    │ Daya(W)  │ Volt(V)  │ Arus(A)  │ Klasifikasi      ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────────────┤│
│ │ 14:25:30 │ 48500    │ 382      │ 128      │ 🔴 Sangat Tinggi ││
│ │ 14:24:15 │ 47200    │ 381      │ 126      │ 🔴 Sangat Tinggi ││
│ │ 14:23:00 │ 45800    │ 380      │ 125      │ 🟠 Tinggi        ││
│ └──────────┴──────────┴──────────┴──────────┴──────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 💡 Insights & Rekomendasi:                                      │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│ │ Efisiensi      │ │ Pola Konsumsi  │ │ Rekomendasi    │       │
│ │ Beban          │ │                │ │                │       │
│ │ Faktor beban   │ │ Ditemukan 24   │ │ ✅ Sistem      │       │
│ │ 84.6% menunjuk │ │ periode puncak │ │ berjalan baik  │       │
│ │ kan penggunaan │ │ dalam periode  │ │ pada periode   │       │
│ │ energi efisien │ │ ini. Pertahank │ │ ini            │       │
│ └────────────────┘ └────────────────┘ └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 COLOR SCHEME

### Primary Colors
```
┌────────────────────┐
│ #0a0e27 (Navy)     │  Background
└────────────────────┘

┌────────────────────┐
│ #00d4ff (Cyan)     │  Primary accent
└────────────────────┘

┌────────────────────┐
│ #00ff88 (Green)    │  Success/Good
└────────────────────┘

┌────────────────────┐
│ #ffaa00 (Orange)   │  Warning/Caution
└────────────────────┘

┌────────────────────┐
│ #ff6b6b (Red)      │  Error/Bad
└────────────────────┘
```

### Load Classification Colors (LoadProfile)
```
🔴 Very High:  #ff6b6b (>= 80%)
🟠 High:       #ffaa00 (60-79%)
🟡 Medium:     #ffc300 (40-59%)
🟢 Low:        #00ff88 (< 40%)
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Desktop (1024px+)
```
┌─────────┬─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │ Card 4  │
├─────────┴─────────┼─────────┴─────────┤
│    Chart 1 (50%)   │    Chart 2 (50%)   │
├─────────┬─────────┼─────────┬─────────┤
│    Chart 3 (50%)   │    Chart 4 (50%)   │
└─────────┴─────────┴─────────┴─────────┘
```

### Tablet (768px - 1023px)
```
┌──────────┬──────────┐
│ Card 1   │ Card 2   │
├──────────┼──────────┤
│ Card 3   │ Card 4   │
├──────────────────────┤
│  Chart 1 (100%)      │
├──────────────────────┤
│  Chart 2 (100%)      │
├──────────────────────┤
│  Chart 3 (100%)      │
├──────────────────────┤
│  Chart 4 (100%)      │
└──────────────────────┘
```

### Mobile (320px - 767px)
```
┌────────────┐
│  Card 1    │
├────────────┤
│  Card 2    │
├────────────┤
│  Card 3    │
├────────────┤
│  Card 4    │
├────────────┤
│ Chart 1    │
├────────────┤
│ Chart 2    │
├────────────┤
│ Chart 3    │
├────────────┤
│ Chart 4    │
├────────────┤
│  Table     │
└────────────┘
```

---

## 🔄 REAL-TIME ANIMATION SEQUENCE

### Data Update Flow (Every 1-2 seconds)

```
1. Server emits 'ampere-data-update'
        ↓
2. Socket listener receives data
        ↓
3. React state updates
        ↓
4. Components re-render
        ↓
5. Charts animate new data point
   └─ Smooth 500ms animation
        ↓
6. Stats update
        ↓
7. Summary recalculate
        ↓
8. UI reflects new state
        ↓
[Ready for next update]
```

---

## 🎯 USER INTERACTIONS

### Report Page Flows

**Flow 1: View Data**
```
Open Page
   ↓
Wait 2 seconds (charts load)
   ↓
See real-time data flowing
   ↓
Select different period
   ↓
Charts update with new data
   ↓
View summary stats
```

**Flow 2: Export Data**
```
Click "Ekspor CSV"
   ↓
Browser downloads CSV file
   ↓
Open in Excel/Sheets
   ↓
Analyze offline
```

---

### Load Profile Page Flows

**Flow 1: Analyze Load**
```
Open Page
   ↓
See analysis cards
   ↓
Review 4 charts
   ↓
Check peak periods table
   ↓
Read insights & recommendations
```

**Flow 2: Change Mode**
```
Click "7 Hari"
   ↓
Page shows loading indicator
   ↓
Fetch 168 hours of data
   ↓
Charts re-render with new analysis
   ↓
Statistics update
   ↓
Insights refresh
```

---

## 📊 CHART ANIMATIONS

### Area Chart (Power Over Time)
```
Time →

Power  ╱╲╱╲╱╲╱╲╱╲
 ▲    ╱  ╲  ╲  ╲  ╲
 │   ╱    ╲  ╲  ╲  ╲
 │  ╱      ╲  ╲  ╲  ╲
 └─────────────────────→ Time

Animation: Area fills smoothly
Color: Gradient from blue to transparent
```

### Bar Chart (Hourly Distribution)
```
Power
 ▲    │█│ │█│ │█│
 │    │█│ │█│ │█│
 │  │█│ │█│ │█│ │█│
 │  │█│ │█│ │█│ │█│
 └─ 0:00 6:00 12:00 18:00 →
    Hour of Day

Animation: Bars grow from bottom
Colors: Gradient based on value
```

### Scatter Chart (Classification)
```
Power │ ●      ●
  ▲   │  ●  ● ●
  │   │ ● ● ● ●
  │   │   ●  ●
  └───┴──────────→ Time

Colors:
🔴 Red dots (>80%)
🟠 Orange dots (60-79%)
🟡 Yellow dots (40-59%)
🟢 Green dots (<40%)
```

---

## 🔔 STATUS INDICATORS

### Connection Status
```
🟢 Connected      → Backend online, real-time active
🔴 Disconnected   → Backend offline, retrying...
🟡 Connecting     → Attempting to connect
🟠 Reconnecting   → Auto-reconnect in progress
```

### Data Status
```
✅ Data loaded    → Ready to view
⏳ Loading...     → Fetching from server
❌ Error         → Failed to load (with retry button)
🔄 Updating      → Real-time data flowing
```

---

## 🎨 INTERACTIVE ELEMENTS

### Hover Effects
```
Cards:
Normal:  Subtle border
Hover:   Glowing border + lifted effect

Buttons:
Normal:  Outlined style
Hover:   Filled + glow effect

Charts:
Normal:  Static display
Hover:   Tooltip shows values
```

### Click Effects
```
Period Buttons:
Before Click:  Outlined border
After Click:   Filled with glow
Active State:  Solid fill

Export Buttons:
Click:         Disabled briefly (0.5s)
Success:       File downloads
```

---

## 📈 DATA TABLE PREVIEW

```
Waktu     Daya(W) Volt(V) Arus(A) Biaya(Rp)
────────────────────────────────────────────
12:45:30  45800   380     125.5   5000
12:44:15  44200   379.8   124.3   4850
12:43:00  46100   380.5   126.2   5050
12:41:45  43900   379.2   123.8   4800
12:40:30  47500   381     127.5   5200
...
```

---

## 🎊 SUMMARY

Your dashboard now includes:
- ✅ Beautiful professional UI
- ✅ Real-time data visualization
- ✅ Interactive charts
- ✅ Smart analysis
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Error handling

**Enjoy exploring your energy data!** 📊✨
