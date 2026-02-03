# 🔬 Chemical Equipment Parameter Visualizer (Hybrid Web + Desktop App)

## Project Overview
This project is a **hybrid application** designed to visualize, analyze, and manage chemical equipment data. Users can upload CSV files containing equipment parameters (Flowrate, Pressure, Temperature, etc.) and interact with **real-time dashboards, charts, and reports**.  

It runs both as a **Web Application (React.js + Chart.js)** and a **Desktop Application (PyQt5 + Matplotlib)**, using a **common Django REST API backend**.  

This project demonstrates skills in **full-stack development, data analytics, visualization, and authentication**, making it internship-ready.  

---

## 🌟 Key Features

### ✅ Web & Desktop CSV Upload
- Upload CSV containing equipment data.
- Backend parses, validates, and stores the data.
- Automatically keeps **last 5 uploaded datasets**.

### ✅ Interactive Dashboards
- Dynamic **data tables** of equipment.
- **Bar charts** showing equipment type distribution.
- **Averages & summary statistics** calculated on the fly.

### ✅ PDF Report Generation
- Generate professional PDF reports with **equipment summary and table**.
- Download-ready from the Web frontend.

### ✅ Authentication & Security
- JWT-based authentication via Django REST Framework.
- Only authorized users can upload/view data.

### ✅ Desktop App
- PyQt5-based desktop client.
- Displays same **charts, summaries, and tables** as web version.
- Can upload CSVs directly from desktop.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Django + Django REST Framework + SimpleJWT | API & data handling |
| Web Frontend | React.js + Chart.js + Axios | Interactive dashboard |
| Desktop Frontend | PyQt5 + Matplotlib | Offline/desktop visualization |
| Data Handling | Pandas | CSV parsing and analytics |
| Database | SQLite | Store last 5 uploads |
| Version Control | Git + GitHub | Source management |

---


