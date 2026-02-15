#!/usr/bin/env python3
"""
Script to crop individual avatar images from the sprite sheet.
Detects colored boxes and crops each agent.
"""

from PIL import Image

# Load the image
img = Image.open('/home/ubuntu/.openclaw/workspace/agents-dashboard/avatar-sheet.jpg')
img = img.convert('RGB')
width, height = img.size

print(f"Image size: {width}x{height}")

# Based on the image analysis:
# - 5 agents in a 2x3 grid
# - Row 1: er-hineda (left), er-coder (right)
# - Row 2: er-plan (left), er-serve (right)
# - Row 3: er-pr (center-left)
# Each box is approximately 43% width and 25% height

box_width = int(width * 0.43)
box_height = int(height * 0.25)

# Calculate positions (centered in each grid cell)
# Grid: 2 columns, 3 rows
col1_x = int(width * 0.025)  # Left column start
col2_x = int(width * 0.52)   # Right column start
row1_y = int(height * 0.08)   # Row 1 start
row2_y = int(height * 0.37)   # Row 2 start
row3_y = int(height * 0.66)   # Row 3 start

# Agent positions (x, y, width, height)
agents = {
    'avatar_er_hineda': (col1_x, row1_y, box_width, box_height),
    'avatar_er_coder': (col2_x, row1_y, box_width, box_height),
    'avatar_er_plan': (col1_x, row2_y, box_width, box_height),
    'avatar_er_serve': (col2_x, row2_y, box_width, box_height),
    'avatar_er_pr': (col1_x, row3_y, box_width, box_height),
}

output_dir = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public/'

for name, (x, y, w, h) in agents.items():
    # Crop the image
    crop = img.crop((x, y, x + w, y + h))
    
    # Save as PNG
    output_path = f"{output_dir}{name}.png"
    crop.save(output_path, 'PNG')
    print(f"Saved: {output_path} ({w}x{h})")

print("Done!")
