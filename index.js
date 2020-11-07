  const express = require('express');	
  const app = express();
  var http = require('http').Server(app);
  var httpCrawler = require('http');
  var io = require('socket.io')(http);
  var port = process.env.PORT || 3002;
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', function(req, res)
  {
      res.sendFile(__dirname + '/index.html');
  });
  
  http.listen(port, function(){
        console.log('listening on *:'+ port);
        var usbDetect = require('usb-detection');
 
	usbDetect.startMonitoring();
 
	// Detect add/insert
	usbDetect.on('add', function(device) { 
	   mediadorCrawler('conectado'); 	
	});
	usbDetect.on('add:vid', function(device) { console.log('add', device); });
	usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });
	 
	// Detect remove
	usbDetect.on('remove', function(device) { console.log('remove', device); });
	usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
	usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });
	 
	// Detect add or remove (change)
	usbDetect.on('change', function(device) { console.log('change', device); });
	usbDetect.on('change:vid', function(device) { console.log('change', device); });
	usbDetect.on('change:vid:pid', function(device) { console.log('change', device); });
  }); 
  
  
  
  async function myfunction()
  {
     console.log('Inside of myfunction');
     const drivelist = require('drivelist');
     const drives = await drivelist.list();
	
     drives.forEach((drive) => {
     	if(drive.busType == 'USB')
     	{
     	   console.log(drive);	
     	   const path = require('path');
   	   const fs = require('fs');	
	   const directoryPath = path.join('/', '/media/cezar/disk/');	   
	   fs.readdir(directoryPath, function (err, files)
	   {
 	      
	     if (err){
   	        return console.log('Unable to scan directory: ' + err);
  	     } 
	
	     files.forEach(function (file) {		
		console.log(file); 		
	     });
  	  });	  	  
     	} 	
     });	
  }
  
  function start(res){
     return myfunction();
  }
  
  app.get('/listmovies/', (req, res) => 
  {
     (async() =>
     {
       console.log('before start');
       await start();
       res.end('');	
  
  	console.log('after start');
     })();	
  });
  
  app.get('/video/:video', function(req, res)
  {
	  const movieName  = req.params["video"];
	  console.log(movieName); 
	  const path = '/media/cezar/disk/' + movieName
	  const fs = require('fs');	
	  const stat = fs.statSync(path)
	  const fileSize = stat.size
	  const range = req.headers.range
	  if (range) {
	    const parts = range.replace(/bytes=/, "").split("-")
	    const start = parseInt(parts[0], 10)
	    const end = parts[1] 
	      ? parseInt(parts[1], 10)
	      : fileSize-1
	    const chunksize = (end-start)+1
	    const file = fs.createReadStream(path, {start, end})
	    const head = {
	      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
	      'Accept-Ranges': 'bytes',
	      'Content-Length': chunksize,
	      'Content-Type': 'video/mp4',
	    }
	    res.writeHead(206, head);
	    file.pipe(res);
	  } else {
	    const head = {
	      'Content-Length': fileSize,
	      'Content-Type': 'video/mp4',
	    }
	    res.writeHead(200, head)
	    fs.createReadStream(path).pipe(res)
	  }
  }); 
   
  app.get('/movies/', (req, res) => 
  {
	   const { movieName } = req.params;
	   const movieFile = `/media/cezar/disk/Confortably.mp4`;
	   fs.stat(movieFile, (err, stats) => {
		 if (err) {
		   console.log(err);
		   return res.status(404).end('<h1>Movie Not found</h1>');
		 }
		 // Variáveis necessárias para montar o chunk header corretamente
		 const { range } = req.headers;
		 const { size } = stats;
		 const start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
		 const end = size - 1;
		 const chunkSize = (end - start) + 1;
		 // Definindo headers de chunk
		 res.set({
		   'Content-Range': `bytes ${start}-${end}/${size}`,
		   'Accept-Ranges': 'bytes',
		   'Content-Length': chunkSize,
		   'Content-Type': 'video/mp4'
		 });
		 // É importante usar status 206 - Partial Content para o streaming funcionar
		 res.status(206);
		 // Utilizando ReadStream do Node.js
		 // Ele vai ler um arquivo e enviá-lo em partes via stream.pipe()
		 const stream = fs.createReadStream(movieFile, { start, end });
		 stream.on('open', () => stream.pipe(res));
		 stream.on('error', (streamErr) => res.end(streamErr));
	   });
  });
  function mediadorCrawler(msg)
  {		
     comunicaAoCliente(msg);						
  } 
  function comunicaAoCliente(msg)
  {
     io.emit('messageBroadcast', msg);
  } 
  io.on('connection', function(socket)
  {
     socket.on('messageBroadcast', function()
     {	
	mediadorCrawler('Conexão');	       
     });
  }); 
  
  
