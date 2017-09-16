# BitTorrent desktop client

### Stack
<ul>
    <li>Node (bittorrent protocol implementation)</li>
    <li>React</li>
    <li>Electron</li>
    <li>MobX</li>
    <li>Materialize.css (for basic layouts)</li>
</ul>

<b>Currently supports only single file structure torrent files</b>


### Running
```
npm i && npm start
```
In separate terminal session:
```
npm run electron
```

### Improvements
<ul>
    <li>Support for multiple files torrent file structure.</li>
    <li>Show extensive information about download status:
        <ul>
            <li>Total pieces, done pieces.</li>
            <li>Speen in kB/s.</li>
            <li>Peer information (country, speed).</li>
            <li>Total blocks, done block.</li>
        </ul>
    </li>
    <li>Clean exiting.</li>
    <li>Pausing, stopping, removing torrent.</li>
    <li>Storing information about torrent progress, which torrents are downloading (after exiting - starting the program).</li>
    <li>Support for multiple files torrent file structure.</li>
    <li>Support uploading.</li>
</ul>

![add torrent](https://github.com/krepecka/BitTorrent-client/blob/master/gifs/add_torrent.gif?raw=true "Add Torrent")
