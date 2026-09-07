-- office sales by customer country.sql
with main_cte as 
(
select t1.orderNumber, t2.quantityOrdered, t2.priceEach, t2.productCode, t3.city as Customer_City, 
t3.country as Customer_Country, t4.productLine,  t6.city as Office_City, t6.country as Office_Country,
t2.quantityOrdered*t2.priceEach as Sales_Value
from orders t1
inner join orderdetails t2
on t1.orderNumber = t2.orderNumber
inner join customers t3
on t1.customerNumber = t3.customerNumber
inner join products t4
on t2.productCode = t4.productCode
inner join employees t5
on t3.salesRepEmployeeNumber = t5.employeeNumber
inner join offices t6
on t5.officeCode = t6.officeCode
)

select orderNumber, Customer_City, Customer_Country, productLine, Office_City, Office_Country, sum(Sales_Value) as Sales_Value
from main_cte 
group by orderNumber, Customer_City, Customer_Country, productLine, Office_City, Office_Country

-- sales and country overview.sql
select t1.orderDate, t2.orderNumber,quantityOrdered, priceEach, productName, productLine, buyPrice, city, country
from orders t1
inner join orderdetails t2
on t1.orderNumber = t2.orderNumber
inner join products t3
on t2.productCode = t3.productCode
inner join customers t4
on t1.customerNumber = t4.customerNumber
where year(orderDate) = 2004


-- new.sql
select orderNumber, orderDate, customerNumber, sum(Sales_value) as sales_value
from
(
select t1.orderNumber, orderDate, customerNumber, quantityOrdered*priceEach as sales_value
from orders t1
inner join orderdetails t2
on t1.orderNumber = t2.orderNumber
)main
group by orderNumber, orderDate, customerNumber;

