import os
from PIL import Image

def make_transparent_shrimp(input_path, output_path):
    print(f"Processing: {input_path}")
    img = Image.open(input_path).convert("RGBA")
    
    # Resize to high quality web resolution (e.g., width 800)
    w, h = img.size
    new_w = 800
    new_h = int(h * (new_w / w))
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    datas = img.getdata()
    newData = []
    
    # Calculate threshold based on dark ocean background (mostly deep blues and blacks)
    for item in datas:
        r, g, b, a = item
        # Calculate brightness/luminance
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        
        # Max component
        max_c = max(r, g, b)
        
        # Dark ocean background cutoff
        # Background is dark blue / black with lum < 22 and max_c < 28
        if lum < 18 and max_c < 25:
            # Completely transparent background
            newData.append((r, g, b, 0))
        elif lum < 38 and max_c < 48:
            # Smooth feathering gradient
            alpha = int(255 * (lum - 18) / 20)
            newData.append((r, g, b, min(255, max(0, alpha))))
        else:
            # Keep shrimp body fully/semi-translucent
            newData.append((r, g, b, 255))
            
    img.putdata(newData)
    
    # Crop bounding box of non-zero alpha
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    print(f"Saved: {output_path} (Size: {img.size})")

if __name__ == "__main__":
    src1 = r"C:\Users\lakku\.gemini\antigravity-ide\brain\35d3629e-1c9b-42e4-968d-e2cb3f963191\real_shrimp_swim_1792919941413.jpg"
    src2 = r"C:\Users\lakku\.gemini\antigravity-ide\brain\35d3629e-1c9b-42e4-968d-e2cb3f963191\real_shrimp_swim_alt_1792919963785.jpg"
    
    out1 = r"c:\Users\lakku\OneDrive\Desktop\prawns project\frontend\public\assets\shrimp_real_1.png"
    out2 = r"c:\Users\lakku\OneDrive\Desktop\prawns project\frontend\public\assets\shrimp_real_2.png"
    
    make_transparent_shrimp(src1, out1)
    make_transparent_shrimp(src2, out2)
