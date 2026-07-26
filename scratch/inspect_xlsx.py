import zipfile
import xml.etree.ElementTree as ET

def inspect_xlsx(filename):
    with zipfile.ZipFile(filename, 'r') as zip_ref:
        # Read shared strings
        shared_strings = []
        try:
            with zip_ref.open('xl/sharedStrings.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                # Namespaces are usually like {http://schemas.openxmlformats.org/spreadsheetml/2006/main}
                ns = {'ns': root.tag.split('}')[0].strip('{')}
                for si in root.findall('.//ns:t', ns):
                    shared_strings.append(si.text)
        except Exception as e:
            print("No shared strings or error:", e)

        # Read sheet1.xml
        try:
            with zip_ref.open('xl/worksheets/sheet1.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'ns': root.tag.split('}')[0].strip('{')}
                
                rows = {}
                for row in root.findall('.//ns:row', ns):
                    r_idx = int(row.attrib['r'])
                    cells = []
                    for c in row.findall('ns:c', ns):
                        r_ref = c.attrib['r']
                        val_el = c.find('ns:v', ns)
                        f_el = c.find('ns:f', ns)
                        
                        val = val_el.text if val_el is not None else None
                        formula = f_el.text if f_el is not None else None
                        
                        # If string type, look up in shared strings
                        t = c.attrib.get('t')
                        if t == 's' and val is not None:
                            val = shared_strings[int(val)]
                        
                        cells.append((r_ref, val, formula))
                    rows[r_idx] = cells
                
                for r in sorted(rows.keys()):
                    if r <= 60:
                        print(f"Row {r:02d}: {rows[r]}")
        except Exception as e:
            print("Error reading sheet1:", e)

inspect_xlsx('wake_parameters.xlsx')
