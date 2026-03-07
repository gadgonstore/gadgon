from PIL import Image

def process_logo(input_path, output_path):
    # Open image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    # Find bounding box manually while processing or just use getbbox after
    for item in data:
        r, g, b, a = item
        # Calculate brightness
        brightness = (r + g + b) / 3
        
        # If the pixel is dark (black background), make it fully transparent
        if brightness < 30:
            new_data.append((255, 255, 255, 0))
        else:
            # If it's part of the text (white/grey), make it pure white and opaque
            # We can use brightness as alpha to keep anti-aliasing smooth
            alpha = int(min(255, brightness * 1.5))
            new_data.append((255, 255, 255, alpha))

    img.putdata(new_data)
    
    # Crop to bounding box to remove extra padding
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

process_logo(r"C:\Users\samee\.gemini\antigravity\brain\8ae9f86c-f36a-4e0d-8b8e-a5759ccadb39\media__1772922486504.png", r"c:\xampp\htdocs\GADGON\assets\images\logo.png")
print("Logo processed and saved!")
