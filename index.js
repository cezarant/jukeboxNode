  const express = require('express');	
  const app = express();
  var http = require('http').Server(app);
  var httpCrawler = require('http');
  var io = require('socket.io')(http);
  var port = process.env.PORT || 3008;
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', function(req, res)
  {
      res.sendFile(__dirname + '/2.html');
  });
  
  http.listen(port, function()
  {
        console.log('listening on *:'+ port);
        var usbDetect = require('usb-detection');
 
 
	usbDetect.startMonitoring();
	
	usbDetect.on('add', function(device) { 
	   mediadorCrawler(1); 	
	});
	
	usbDetect.on('remove', function(device) {  mediadorCrawler(2); });
	usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
	usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });
	 
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
	
	     /*files.forEach(function (file) {		
		console.log(files); 		
	     });*/
  	  });	  	  
     	} 	
     });	
  }
  
  function start(res){
     return myfunction();
  }
    
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
  function mediadorCrawler(msg)
  {    
     var status = ""; 
   	 
     if(msg === 1)
       status = 'connected'; 
    
     if (msg === 2)
       status = 'unplugged';
     
     console.log(status);	 
     comunicaAoCliente(status);						
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
