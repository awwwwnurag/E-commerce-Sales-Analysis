import pandas as pd

def load_data(file_path="Excel/Haldirams_Sales_Overview.xlsx"):
    """Loads the main product database."""
    return pd.read_excel(file_path, sheet_name='Product Database')

def get_sales_and_country_overview(df):
    """
    Replicates 'sales and country overview.sql'
    Returns a summarized view of sales by country.
    """
    return df.groupby('country').agg({
        'Sales Value': 'sum',
        'Net Profit': 'sum',
        'orderNumber': 'nunique'
    }).reset_index().rename(columns={'orderNumber': 'Unique Orders'}).sort_values('Sales Value', ascending=False)

def get_office_sales_by_customer_country(df):
    """
    Replicates 'office sales by customer country.sql'
    """
    return df.groupby(['city', 'country']).agg({
        'Sales Value': 'sum',
        'Net Profit': 'sum'
    }).reset_index().sort_values('Sales Value', ascending=False)

def get_sales_value_change_mom(df):
    """
    Replicates 'sales value change from previous order.sql'
    Calculates month-over-month sales value change.
    """
    df['orderDate'] = pd.to_datetime(df['orderDate'])
    df['YearMonth'] = df['orderDate'].dt.to_period('M')
    
    monthly_sales = df.groupby('YearMonth')['Sales Value'].sum().reset_index()
    monthly_sales['Previous Month Sales'] = monthly_sales['Sales Value'].shift(1)
    monthly_sales['MoM Change (%)'] = ((monthly_sales['Sales Value'] - monthly_sales['Previous Month Sales']) / monthly_sales['Previous Month Sales']) * 100
    
    return monthly_sales

if __name__ == "__main__":
    print("Loading data...")
    df = load_data("Excel/Haldirams_Sales_Overview.xlsx")
    
    print("\n--- Sales and Country Overview ---")
    print(get_sales_and_country_overview(df).head())
    
    print("\n--- Month-over-Month Sales Change ---")
    print(get_sales_value_change_mom(df).head())
