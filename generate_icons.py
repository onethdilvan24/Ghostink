from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create a new image with a green background
    image = Image.new('RGB', (size, size), '#4CAF50')
    draw = ImageDraw.Draw(image)
    
    # Calculate padding for the speech bubble
    padding = int(size * 0.2)
    
    # Draw a white speech bubble
    points = [
        (padding, padding),  # Top left
        (size - padding, padding),  # Top right
        (size - padding, size - padding * 1.5),  # Right middle
        (size - padding * 1.5, size - padding * 1.5),  # Right bottom
        (size - padding * 2, size - padding),  # Point
        (padding, size - padding * 1.5),  # Left bottom
    ]
    draw.polygon(points, fill='white')
    
    # Add text "AI"
    # Since we can't guarantee font availability, we'll just use a rectangle for now
    text_width = int(size * 0.4)
    text_height = int(size * 0.3)
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2
    draw.rectangle([text_x, text_y, text_x + text_width, text_y + text_height], fill='#4CAF50')
    
    # Save the image
    if not os.path.exists('icons'):
        os.makedirs('icons')
    image.save(f'icons/icon{size}.png')

# Generate icons in required sizes
for size in [16, 48, 128]:
    create_icon(size) 