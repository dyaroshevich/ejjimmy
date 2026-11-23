import re
import json
import sys
import os
from typing import List, Dict, Any

def parse_twproducts(filepath: str) -> List[Dict[str, Any]]:
    with open(filepath, 'rb') as f:
        content_bytes = f.read()
    # Try to decode as UTF-8, ignoring errors
    content = content_bytes.decode('utf-8', errors='ignore')
    
    # Split by sections (lines starting with # that are not part of tables)
    # We'll parse package by package
    products = []
    
    # Find all package sections
    # Pattern: ## Package X: ... KW or ## ?????????? X - ... kW
    # We'll parse line by line
    
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for package headers
        if line.startswith('## Package ') and 'KW' in line:
            # Extract package info
            # Example: ## Package 1: 5 KW
            package_match = re.match(r'## Package (\d+): (\d+) KW', line)
            if package_match:
                package_num = package_match.group(1)
                power_kw = int(package_match.group(2))
                
                # Get title line (Thai/Chinese)
                i += 1
                title_line = lines[i].strip() if i < len(lines) else ''
                
                # Get bullet points until next section
                i += 1
                bullets = []
                while i < len(lines) and not lines[i].strip().startswith('##') and lines[i].strip() != '---':
                    if lines[i].strip().startswith('-'):
                        bullets.append(lines[i].strip())
                    i += 1
                
                # Parse bullets
                product = parse_package_bullets(bullets, power_kw, f"package-{package_num}-{power_kw}kw")
                if product:
                    products.append(product)
                
                # Skip the separator
                if i < len(lines) and lines[i].strip() == '---':
                    i += 1
                continue
        
        # Handle the other format: ## ?????????? X - ... kW
        # Using a simpler approach to avoid regex issues with special characters
        elif line.startswith('## ') and ' - ' in line and ' kW' in line:
            # Example: ## ?????????? 1 - 100 kW
            # Extract numbers using a more flexible approach
            parts = line.split(' - ')
            if len(parts) >= 2:
                # Get first number from first part
                first_part = parts[0]
                second_part = parts[1]
                
                # Extract digits from first part
                first_nums = re.findall(r'\d+', first_part)
                # Extract digits from second part (before kW)
                second_nums = re.findall(r'\d+', second_part.replace(' kW', ''))
                
                if first_nums and second_nums:
                    try:
                        package_num = first_nums[-1]  # Take the last number found
                        power_kw = int(second_nums[0])  # Take the first number before kW
                    except (ValueError, IndexError):
                        # If parsing fails, skip this section
                        i += 1
                        continue
                    
                    # Get title line (Thai/Chinese)
                    i += 1
                    title_line = lines[i].strip() if i < len(lines) else ''
                    
                    # Get bullet points until next section
                    i += 1
                    bullets = []
                    while i < len(lines) and not lines[i].strip().startswith('##') and lines[i].strip() != '---':
                        if lines[i].strip().startswith('-'):
                            bullets.append(lines[i].strip())
                        i += 1
                    
                    # Parse bullets
                    product = parse_package_bullets(bullets, power_kw, f"package-{package_num}-{power_kw}kw")
                    if product:
                        products.append(product)
                    
                    # Skip the separator
                    if i < len(lines) and lines[i].strip() == '---':
                        i += 1
                    continue
        
        i += 1
    
    return products

def parse_package_bullets(bullets: List[str], power_kw: int, product_id: str) -> Dict[str, Any]:
    # Initialize product data
    product = {
        "id": product_id,
        "name": "",
        "brand": "",
        "model": "",
        "type": "package",
        "power_kw": power_kw,
        "price_thb": None,
        "specifications": {},
        "image_url": "",
        "description": "",
        "created_at": "2024-07-01T10:00:00Z",
        "updated_at": "2024-07-01T10:00:00Z"
    }
    
    current_section = None
    specs = []
    
    for bullet in bullets:
        bullet = bullet.strip()
        if not bullet.startswith('-'):
            continue
            
        content = bullet[1:].strip()
        
        # Check for section headers (bold text)
        if content.startswith('**') and content.endswith('**'):
            section_name = content.strip('*')
            current_section = section_name
            continue
            
        # Parse based on current section
        if current_section == '???????:' or current_section == ' оборудование:' or ':' in content and not content.startswith('-'):
            # This is likely a specifications section
            if ':' in content:
                parts = content.split(':', 1)
                key = parts[0].strip()
                value = parts[1].strip() if len(parts) > 1 else ''
                if key and value:
                    product["specifications"][key] = value
        elif '????' in content and ('VAT' in content or 'vat' in content.lower()):
            # Price line
            price_match = re.search(r'(\d+(?:,\d+)*)\s*???', content.replace(',', ''))
            if price_match:
                price_str = price_match.group(1).replace(',', '')
                try:
                    product["price_thb"] = int(price_str)
                except ValueError:
                    pass
        elif not product["name"] and len(content) > 10 and not content.startswith('-'):
            # First substantial line might be name/description
            if " ONGRID" in content or "ОНГРИД" in content:
                product["name"] = content
            elif not product["description"]:
                product["description"] = content
    
    # Set default name if not found
    if not product["name"]:
        product["name"] = f"Solar Package {power_kw} kW"
    
    # Set description if not found
    if not product["description"]:
        product["description"] = f"{power_kw} kW On-Grid Solar Power Package"
    
    # Extract brand and model from specifications if possible
    specs = product["specifications"]
    if "Inverter" in specs:
        inv_text = specs["Inverter"]
        # Extract brand
        if "GoodWe" in inv_text:
            product["brand"] = "GoodWe"
        elif "SolarEdge" in inv_text:
            product["brand"] = "SolarEdge"
        elif "Huawei" in inv_text:
            product["brand"] = "Huawei"
        elif "Sigenergy" in inv_text:
            product["brand"] = "Sigenergy"
        
        # Try to extract model (simple approach)
        model_match = re.search(r'([A-Za-z0-9\- ]+)\s+\d+\s*kW', inv_text)
        if model_match:
            product["model"] = model_match.group(1).strip()
        elif product["brand"]:
            product["model"] = f"{product['brand']} {power_kw}kW"
    
    # If still no brand, check panels
    if not product["brand"] and "Jinko" in str(specs):
        product["brand"] = "Jinko Solar"
        if not product["model"]:
            product["model"] = f"Jinko Solar {power_kw}kW Package"
    
    # Add power to specs if not already there
    if "power_kw" not in product["specifications"]:
        product["specifications"]["power_kw"] = power_kw
    
    return product

if __name__ == "__main__":
    # Get file path from command line argument or use default
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    else:
        filepath = "twproducts.txt"
    
    # If filepath is relative, make it relative to the current working directory
    if not os.path.isabs(filepath):
        filepath = os.path.join(os.getcwd(), filepath)
    
    products = parse_twproducts(filepath)
    print(f"Parsed {len(products)} products")
    for p in products[:3]:  # Show first 3
        print(json.dumps(p, indent=2, ensure_ascii=False))
    # Save to file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "..", "data", "solar-products")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "products.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Saved to {output_path}")