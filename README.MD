# Steg-no-sploit

A simplified, refactored, and responsive version of <a href="http://stegosploit.info/">Stegosploit</a>.



## Running

Download this repo and extract the files

Make sure that the image (JPG/PNG) you want to encode is in the same directory as this file(inside the stego folder). 

Spin up a webserver (i.e. python -m http.server)

open up 'fixing_iterative_encoding.html' for encoding

Type in the name of the image including the image extension into the text field and click "Load"

Pay attention to the bitlayer, number of channels, and grid. 

Select bit layers 1-3 as a rule as <a href="http://stegosploit.info/#22-steganographically-encoding-the-exploit-code">large numbers disturb the image more</a>. 

Write your message and click "process".

You should have an image called "encoded_image.JPG" in your downloads folder 


## How to run the decoder

Place the encoded image in the same directory as the decoder file. 

Spin up a webserver (i.e. python -m http.server).

Open the decoder html file.

Type the name of the encoded image in the text field.

Fill out the bitlayer, channel, and grid fields and click "Decode"

The message should appear in the text area below! 


## TODO

There is still a lot more that can be done with this project, and I think the design could still be vastly improved upon. 

- [ ] Add a checkbox to show log only when needed/wanted
- [ ] Add image validation on decoder page







