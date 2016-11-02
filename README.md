# BitTorrent protocol implementation

### First real program written in node
It takes a torrent file of <b>single file structure</b> and downloads it. 

#### Note: this program can theoretically(to be frank quite often) load whole content of torrent file into RAM

### Improvements
Program needs a lot of improvements:
<ul>
    <li>Dealing with received data from a socket stream in efficient way</li>
    <li>Peer selection and piece prioritazation algorithms improvements</li>
    <li>Writing to file algorithm</li>
    <li>Support for multiple files torrent file structure</li>
    <li>Bunch of other stuff that I can't remember right now</li>
    <li>Reafactor code to have somekind of logical design</li>
    <li>Finally - make a download finish. The ULTIMATE goal</li>
</ul>

