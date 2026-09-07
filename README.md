# Haldiram's FMCG Sales Analysis & SaaS Intelligence Platform

An end-to-end sales analytics pipeline and multi-tenant SaaS intelligence suite for Fast-Moving Consumer Goods (FMCG) sales analysis.

For full internship phase documentation and learning outcomes, see [Project Documentation](Project_Documentation.md).

---

## 🚀 Key Modules

### 1. Next.js 16 SaaS Sales Intelligence Dashboard (`saas-sales-dashboard/`)
Fullstack web application providing multi-tenant sales analytics, CSV dataset ingestion, predictive forecasting, and customer retention metrics.
- **Tech Stack**: Next.js 16, React 19, TypeScript, NextAuth.js, MongoDB Atlas, Recharts, Tailwind CSS, Razorpay.
- **Currency**: Indian Rupee (`₹` INR) formatting across all financial metrics.
- **Key Features**:
  - Drag-and-drop CSV dataset upload & validation
  - Interactive KPI cards & regional distribution charts
  - Customer Lifetime Value (CLV) & churn risk cohort analysis
  - Monthly revenue forecasting
  - Team roster management & audit logging

### 2. Streamlit FMCG Python Dashboard (`app.py`)
Interactive Python analytics web application built specifically for Haldiram's product lines and regional distribution insights.
- **Tech Stack**: Python 3, Streamlit, Pandas, Matplotlib, Seaborn, OpenPyXL.
- **Data Source**: [`Excel/Haldirams_Sales_Overview.xlsx`](Excel/Haldirams_Sales_Overview.xlsx) (`Product Database` sheet).
- **Key Features**:
  - Interactive product category & country slicer filters
  - Sales vs Net Profit bar charts
  - Top 10 regional distribution charts
  - Cost of sales vs profit scatter analysis

---

## 🛠️ Local Setup & Running Instructions

### Running Module 1: Next.js SaaS Dashboard
```bash
# Navigate to the dashboard folder
cd saas-sales-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Module 2: Streamlit Python Dashboard
```bash
# Install Python dependencies from repository root
pip install -r requirements.txt

# Launch Streamlit app
streamlit run app.py --server.port 8501
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## ☁️ Deployment Guide

### Option A: Deploying Next.js App (`saas-sales-dashboard`) to Vercel (Recommended — Free)

1. **Push Code to GitHub**: Ensure your project is pushed to a GitHub repository.
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in.
   - Click **"Add New Project"** → select your GitHub repository.
   - Set **Root Directory** to `saas-sales-dashboard`.
3. **Configure Environment Variables**:
   Add the following environment variables in Vercel settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NEXTAUTH_URL`: `https://your-app-name.vercel.app`
   - `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay API keys
4. **Deploy**: Click **Deploy**. Vercel will build and host your Next.js app with a live HTTPS link.

---

### Option B: Deploying Streamlit App (`app.py`) to Streamlit Community Cloud (Recommended — Free)

1. **Sign in to Streamlit Cloud**:
   - Go to [share.streamlit.io](https://share.streamlit.io/) and log in with GitHub.
2. **Deploy App**:
   - Click **"New app"**.
   - Select your GitHub Repository, Branch (`main`), and set **Main file path** to `app.py`.
3. **Deploy**: Click **Deploy!**. Your Streamlit app will be live on a custom `.streamlit.app` URL within 2 minutes.

---

## 📂 Repository Structure

```
├── app.py                         # Streamlit Python Sales Dashboard
├── requirements.txt               # Python package dependencies
├── Project_Documentation.md      # 8-Phase Internship Project Report
├── Excel/                         # Haldirams FMCG Excel datasets
├── SQL/                           # Data cleaning & aggregation SQL queries
├── analysis/                      # Exploratory Data Analysis (EDA) scripts
├── Power BI/                      # Power BI dashboard files
└── saas-sales-dashboard/          # Next.js 16 SaaS Fullstack Platform
    ├── src/app/                   # Next.js App Router routes & API endpoints
    ├── src/components/            # Dashboard UI components & navigation
    └── src/models/                # Mongoose database models
```
