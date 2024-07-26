# The Problem

When creating a 2d platformer there is a plethoras of free character models available but often only for one direction. This is a tool for mirror character animation. Before creating this I used macOS' image viewer to flip the images on the vertical axis but that resulted in the animation playing in reverse when facing the opposite direction.

# The solution

This script takes the png assets divides the image by the number of frames and flips each individual frame so that you can use the animations in both directions.

# How to Use it

1. Create a nested directory in the input directory with all of the pngs you have for an individual character.
2. Rename the file with the number of frames it has and delimit it with a "\_" Ex. "2_Jump.png"
3. > npm install && npm start
4. Viola your flipped assets should be in the output directory.
