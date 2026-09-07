import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(page_title="Haldiram's Analytics", layout="wide")

st.title("Haldiram's FMCG Sales Analytics Dashboard")

@st.cache_data
def load_data():
    file_path = "Excel/Haldirams_Sales_Overview.xlsx"
    # The 'Product Database' sheet contains the raw detailed data
    df = pd.read_excel(file_path, sheet_name='Product Database')
    return df

df = load_data()

st.sidebar.header("Filters")
# Convert orderDate to datetime if not already
df['orderDate'] = pd.to_datetime(df['orderDate'])

# Product Line Filter
product_lines = df['productLine'].unique().tolist()
selected_product_lines = st.sidebar.multiselect("Select Product Line", product_lines, default=product_lines)

# Country Filter
countries = df['country'].unique().tolist()
selected_countries = st.sidebar.multiselect("Select Country", countries, default=countries)

# Apply filters
filtered_df = df[
    (df['productLine'].isin(selected_product_lines)) &
    (df['country'].isin(selected_countries))
]

st.header("Sales Overview")

# KPI Cards
col1, col2, col3 = st.columns(3)
total_sales = filtered_df['Sales Value'].sum()
total_profit = filtered_df['Net Profit'].sum()
unique_orders = filtered_df['orderNumber'].nunique()

col1.metric("Total Sales", f"₹{total_sales:,.2f}")
col2.metric("Net Profit", f"₹{total_profit:,.2f}")
col3.metric("Total Orders", f"{unique_orders}")

st.markdown("---")

col_charts1, col_charts2 = st.columns(2)

with col_charts1:
    st.subheader("Sales and Net Profit by Product Category")
    # Group by productLine
    prod_summary = filtered_df.groupby('productLine')[['Sales Value', 'Net Profit']].sum().reset_index()
    
    fig, ax = plt.subplots(figsize=(8, 5))
    prod_summary.plot(x='productLine', y=['Sales Value', 'Net Profit'], kind='bar', ax=ax, color=['#1f77b4', '#2ca02c'])
    plt.xticks(rotation=45, ha='right')
    plt.ylabel("Amount (₹)")
    plt.title("Sales vs Profit per Category")
    st.pyplot(fig)

with col_charts2:
    st.subheader("Sales by Country")
    # Group by country
    country_sales = filtered_df.groupby('country')['Sales Value'].sum().sort_values(ascending=False).head(10).reset_index()
    
    fig2, ax2 = plt.subplots(figsize=(8, 5))
    sns.barplot(data=country_sales, x='Sales Value', y='country', ax=ax2, palette="viridis")
    plt.xlabel("Total Sales (₹)")
    plt.ylabel("Country")
    plt.title("Top 10 Countries by Sales")
    st.pyplot(fig2)

st.markdown("---")

st.subheader("Net Profit vs Cost of Sales")
# Scatter chart like the Power BI one
fig3, ax3 = plt.subplots(figsize=(10, 6))
sns.scatterplot(data=filtered_df, x='Cost of Sales', y='Net Profit', hue='productLine', alpha=0.6, ax=ax3)
plt.title("Scatter Chart: Net Profit vs Cost of Sales")
st.pyplot(fig3)

st.subheader("Raw Data Preview")
st.dataframe(filtered_df.head(100))
