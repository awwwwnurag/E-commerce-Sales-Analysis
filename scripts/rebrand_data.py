import openpyxl
import os

file_path = "Excel/Sales Overview by Product.xlsx"
new_file_path = "Excel/Haldirams_Sales_Overview.xlsx"

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

print("Loading workbook (this may take a moment)...")
wb = openpyxl.load_workbook(file_path)

replacements = {
    "Classic Cars": "Namkeen",
    "Vintage Cars": "Sweets",
    "Motorcycles": "Ready-to-Eat",
    "Planes": "Beverages",
    "Ships": "Frozen Foods",
    "Trains": "Gift Hampers",
    "Trucks and Buses": "Syrups",
    
    # Just some generic product name replacements for safety
    "1952 Alpine Renault 1300": "Aloo Bhujia",
    "1996 Moto Guzzi 1100i": "Kaju Katli",
    "1928 Mercedes-Benz SSK": "Moong Dal",
    "1939 Chevrolet Deluxe Coupe": "Gulab Jamun",
    "1982 Lamborghini Diablo": "Rasgulla",
    "1958 Chevy Corvette Limited Edition": "Soan Papdi"
}

# Function to do a generic replacement if it's a string
def replace_cell_value(val):
    if isinstance(val, str):
        # exact match product lines
        if val in replacements:
            return replacements[val]
        
        # Or if it contains the word 'Car' or 'Auto' etc (just simple fallback)
        for old, new in replacements.items():
            if old in val:
                return val.replace(old, new)
                
    return val

print("Replacing data across sheets...")
for sheet_name in wb.sheetnames:
    ws = wb[sheet_name]
    for row in ws.iter_rows():
        for cell in row:
            if cell.value:
                new_val = replace_cell_value(cell.value)
                if new_val != cell.value:
                    cell.value = new_val

print(f"Saving rebranded workbook to {new_file_path}...")
wb.save(new_file_path)
print("Done!")
