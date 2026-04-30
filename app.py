print("hello world")

# Cell 1 — Load the data
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('sales.csv')
print(df.head())
print(df.dtypes)

# Cell 2 — Calculate profit and margin
df['profit'] = df['revenue'] - df['cost']
df['margin_pct'] = (df['profit'] / df['revenue']) * 100
print(df[['product', 'profit', 'margin_pct']])

# Cell 3 — Which product makes more profit overall?
product_summary = df.groupby('product').agg(
    total_revenue=('revenue', 'sum'),
    total_cost=('cost', 'sum'),
    total_profit=('profit', 'sum'),
    total_units=('units_sold', 'sum')
).reset_index()

product_summary['margin_pct'] = (
    product_summary['total_profit'] / product_summary['total_revenue'] * 100
)

print(product_summary)

# Cell 4 — Monthly revenue trend per product
df['date'] = pd.to_datetime(df['date'])
df['month'] = df['date'].dt.to_period('M')

monthly = df.groupby(['month', 'product'])['revenue'].sum().reset_index()
monthly['month'] = monthly['month'].astype(str)

print(monthly)

# Cell 5 — Plot monthly revenue trend
shoes = monthly[monthly['product'] == 'Shoes']
bags = monthly[monthly['product'] == 'Bags']

plt.figure(figsize=(10, 5))
plt.plot(shoes['month'], shoes['revenue'], marker='o', label='Shoes')
plt.plot(bags['month'], bags['revenue'], marker='o', label='Bags')
plt.title('Monthly Revenue by Product')
plt.xlabel('Month')
plt.ylabel('Revenue (₹)')
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('revenue_trend.png')  # This is what your sandbox will output
plt.show()

# Cell 6 — Bar chart: profit by region
region_profit = df.groupby('region')['profit'].sum()

plt.figure(figsize=(6, 4))
region_profit.plot(kind='bar', color=['steelblue', 'coral'])
plt.close()
plt.title('Total Profit by Region')
plt.xlabel('Region')
plt.ylabel('Profit (₹)')
plt.tight_layout()
plt.savefig('region_profit.png')
plt.show()