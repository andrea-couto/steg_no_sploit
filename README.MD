# Steg-no-sploit

Stegnosploit is an a refactor of Saumil Shah's Stegosploit encoding and decoding tools. For the full toolkit and more in depth information please visit his site: http://stegosploit.info/ <br>


## Motivation

As part of a Cryptology course I wanted to explore and contribute to this project.


## Running

Download this repo and extract the files

Put the image (JPG/PNG) you want to encode in the same directory as the html files (inside the stego folder).

Spin up a webserver (i.e. python -m http.server)

Open the encoding or decoding html file with an internet browser.  

Select bit layers 1-3 as a rule as <a href="http://stegosploit.info/#22-steganographically-encoding-the-exploit-code">large numbers disturb the image more</a>. 

The grid is how the message is distributed in your image.

For smaller images make this number small (1-2). 


## TODO

There is still a lot more that can be done with this project, and I think the design could still be vastly improved upon. 

- [ ] Add a CSS file and refactor the styling
- [ ] Add a checkbox to show log only when needed/wanted
- [ ] Add image validation on decoder page

