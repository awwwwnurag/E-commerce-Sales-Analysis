-- Week 3: Data Cleaning and Standardization

-- 1. Identify missing values in key fields
SELECT * FROM orders WHERE status IS NULL OR orderDate IS NULL;
SELECT * FROM customers WHERE customerName IS NULL;

-- 2. Standardize country names (e.g., US to USA)
UPDATE customers 
SET country = 'USA' 
WHERE country = 'US';

-- 3. Identify and remove duplicate customer records (Mock Example)
WITH CTE AS (
    SELECT customerNumber, 
           ROW_NUMBER() OVER(PARTITION BY customerName, contactLastName, contactFirstName ORDER BY customerNumber) as row_num
    FROM customers
)
DELETE FROM customers
WHERE customerNumber IN (SELECT customerNumber FROM CTE WHERE row_num > 1);

-- 4. Standardize text casing
UPDATE products 
SET productLine = UPPER(productLine);

-- 5. Data Validation: Ensure price is positive
SELECT * FROM orderdetails WHERE priceEach <= 0;
