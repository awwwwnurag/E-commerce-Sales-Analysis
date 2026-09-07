-- Credit Limit.sql
	with sales as
    (
    select t1.orderNumber, t2.customerNumber, productCode, quantityOrdered, priceEach, quantityOrdered*priceEach as Sales_Value, creditLimit
    from orderdetails t1
    inner join orders t2
    on t1.orderNumber = t2.orderNumber
    inner join customers t3
    on t2.customerNumber = t3.customerNumber
    )
    
    select orderNumber, customerNumber, 
    case when creditLimit < 75000 then 'a: Less than 75k'
    when creditLimit between 75000 and 100000 then 'b: Between 75k and 100k'
    when creditLimit between 100000 and 150000 then 'c: Between 100k and 150k'
    when creditLimit > 150000 then 'd: Greater than 150k'
    else 'Other'
    end as creditLimit_grp,
    sum(Sales_Value) as Sales_Value
    from sales
    group by orderNumber, customerNumber, creditLimit_grp

-- customers affected by late shipping.sql
with main_cte as 
(
select *, date_add(shippedDate, interval 3 day) as Latest_Shipped_Date
from orders
),

sales_query as
(
select *,
case when Latest_Shipped_Date > requiredDate then 1 else 0 end as Late_Flag
from main_cte
)

select *
from sales_query
where Late_Flag = 1

-- customers who go over credit limit part1.sql
with cte_sales as 
(
select orderDate, t1.orderNumber, t1.customerNumber, customerName, productCode, creditLimit, 
quantityOrdered*priceEach as Sales_Value
from orders t1
inner join orderdetails t2
on t1.orderNumber = t2.orderNumber
inner join customers t3
on t1.customerNumber = t3.customerNumber
),

running_total_sales_cte as
(
select orderDate, orderNumber, customerNumber, customerName, creditLimit, sum(Sales_Value) as Sales_Value
from cte_sales
group by orderDate, orderNumber, customerNumber, customerName, creditLimit
)

select *,
sum(Sales_Value) over (partition by customerNumber order by orderDate) as running_total_sales
from running_total_sales_cte

-- products purchased together.sql
with prod_sales as
(
select orderNumber, t1.productCode, productLine
from orderdetails t1
inner join products t2
on t1.productCode = t2.productCode
)

select distinct t1.ordernumber, t1.productLine as product_one, t2.productLine as product_two
from prod_sales t1
left join prod_sales t2
on t1.orderNumber = t2.orderNumber and t1.productLine <> t2.productLine

-- sales value change from previous order.sql
with main_cte as 
(
select orderNumber, orderDate, customerNumber, sum(Sales_value) as sales_value
from
(
select t1.orderNumber, orderDate, customerNumber, quantityOrdered*priceEach as sales_value
from orders t1
inner join orderdetails t2
on t1.orderNumber = t2.orderNumber
)main
group by orderNumber, orderDate, customerNumber
),

sales_query as
(
select t1.*, customerName, row_number() over (partition by customerName order by orderDate) as Purchase_Number,
lag(sales_value) over (partition by customerName order by orderDate) as prev_sales_value
from main_cte t1
inner join customers t2
on t1.customerNumber = t2.customerNumber
)

select *, sales_value - prev_sales_value as purchase_value_change
from sales_query
where prev_sales_value is not null

/*
row_number() over (partition by customerName order by orderDate) as Purchase_Number: 
This part uses the ROW_NUMBER() window function to assign a unique sequential integer to 
each row within a partition of rows that share the same customerName. 
The rows are ordered by orderDate within each partition.
*/


