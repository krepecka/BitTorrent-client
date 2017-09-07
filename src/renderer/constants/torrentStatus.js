export default [
    'DOWNLOADING', 
    'PAUSED', // paused by user
    'WAITING', // waiting for peers to connect
    'IN_QUEUE', // when limit of parallel downloads is reached torrent has to wait
    'DONE',
]