# Haldiram's Sales Dashboard Documentation

## Overview
This document outlines the design and insights of the FMCG Sales Analysis Dashboards developed during Weeks 6 and 7 of the internship. The dashboard leverages SQL data prepared in previous weeks, transformed via Power Query, and connected relationally.

## Visualizations Built

### 1. Sales and Net Profit Dashboard
- **Total Sales & Profit KPIs**: Cards displaying the top-level metrics for quick executive review.
- **Profit Analysis**: 
  - Clustered Bar Chart: Breaks down sales and net profit by `Product Category` (Sweets, Namkeen, Ready-to-Eat).
  - Scatter Chart: Visualizes the relationship between Net Profit and Cost of Sales per product.
- **Regional Sales**: 
  - Donut Chart & Stacked Column Chart: Analyzing revenue contribution by `Region` and `Distributor Location`.
- **Interactive Slicers**: Filters for `Order Date` and `Product Category` to drill down into specific segments.

### 2. Profit Drill-Down Dashboard
- **Decomposition Tree**: A dynamic visual that breaks down `Net Profit` by:
  1. State/Region
  2. Product Category
  3. Distributor Name
- **Sales Overview Table**: A detailed matrix showcasing MoM% and YTD sales growth metrics calculated using custom DAX measures.

## Key Business Insights Generated

Based on the interactive analysis, the following insights were derived:
1. **Best-Selling Products**: Specific product categories (e.g., Namkeen/Bhujia, Festive Sweets) consistently drive the majority of revenue and command the highest profit margins.
2. **High-Performing Sales Regions**: North and West Indian regions dominate overall sales volume, indicating core markets, while Southern regions show rapid growth.
3. **Seasonal Trends**: Time-series analysis revealed distinct seasonal spikes in ordering behavior (especially around Diwali and Holi), essential for supply chain planning.
4. **Cost Efficiency**: The scatter plot highlights certain perishable product categories where the cost of sales (logistics/spoilage) is disproportionately high compared to the net profit, suggesting areas for supply chain optimization.
