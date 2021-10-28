  const express   = require('express');	
  const app       = express();
  var http        = require('http').Server(app);
  var httpCrawler = require('http');
  var io          = require('socket.io')(http);
  var port        = process.env.PORT || 3008;
  const path      = require('path');
  var urlUSB      = '/media/cezar/ESD-USB/'; 
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', function(req, res)
  {
      res.sendFile(__dirname + '/2.html');
  });

  app.get('/juke',function(req,res){
	res.setHeader('Content-Type', 'application/json');
	var juke = {
		"Itens":[		
		{
			"Letra": "A",
			"Bandas":[				
				{
					"Nome":"AeroSmith",
					"Albuns":[
						{"Nome":"Hole in My Soul",
					     "Musicas":[
							{"Nome":"Hole in My Soul","NomeVideo":"hole.mp4"},
							{"Nome":"Pink","NomeVideo":"pink.mp4"}
						 ]},
						{"Nome":"Armagedoom",
					     "Musicas": [
							 {"Nome": "Crazy","NomeVideo": "crazy.mp4"},
							 {"Nome":"Armagedoom","NomeVideo":"armagedom.mp4"}
						 ]}	
					]
				},
				{
					"Nome":"Alice in Chains",
					"Albuns":
					[
						{"Nome":"Black hole in Sky",
					     "Musicas":[
							{"Nome":"Black hole in Sky","NomeVideo":"blackhole.mp4"},
							{"Nome":"Man in the Box","NomeVideo":"ManInABox.mp4"}
						]}	
					]		
				}]
		},
		{
			"Letra": "B",
			"Bandas":[				
				{
					"Nome":"Black Sabbath",
					"Albuns":[
						{
							"Nome":"Black Sabbath",
							"Musicas":	[
								{"Nome":"N.I.B"},
								{"Nome":"Children of the Grave"}
							]
						},
						{
							"Nome":"Volume 4",
							"Musicas": [
								{"Nome":"Changes"},
							    {"Nome":"SuperNaut"}		
							]					
						}	
					]
				}]
		}
	]};
	res.end(JSON.stringify({
		videos: juke
		  }, null, 3));	     	
  }); 


  app.get('/video', function(req, res)
  {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
				videos: ['Confortably.mp4', 'video2']
			      }, null, 3));	     
  }); 
  
  http.listen(port, function()
  {        
    /*var usbDetect = require('usb-detection');
 	console.log('start...'); 
 
	usbDetect.startMonitoring();
	
	usbDetect.on('add', function(device) { 
	   mediadorCrawler(1); 	
	});
	
	usbDetect.on('remove', function(device) {  mediadorCrawler(2); });
	usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
	usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });
	 
	usbDetect.on('change', function(device) { myfunction(device); });
	usbDetect.on('change:vid', function(device) { console.log('change', device); });
	usbDetect.on('change:vid:pid', function(device) { console.log('change', device); });*/
	console.log('start...'); 
  });  
   
  async function myfunction(device)
  {     
     // console.log('device changed:',device); 	
     const drivelist = require('drivelist');
     const drives = await drivelist.list();
     
     drives.forEach((drive) => {
     	if(drive.busType === 'SATA')
     	{     	   
     	   const path = require('path');
   	   const fs = require('fs');	
	   const directoryPath = path.join('/', urlUSB);	   
	   fs.readdir(directoryPath, function (err, files)
	   { 	      
	       if (err)
   	          return console.log('Unable to scan directory: ' + err);
  	        	
	       var filesList = files.filter(function(e){
    		   return path.extname(e).toLowerCase() === '.mp4'
  	       });
  			        	
	       filesList.forEach(function (file) {		
		   comunicaAoCliente('{"tipo":"file","valor":"'+ file +'"}');		   		    		
	       });
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
	  // console.log(movieName); 
	  const path = urlUSB + movieName
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
       status = '{ "tipo": "conexao", "status":"connected" }'; 
    
     if (msg === 2)
       status = '{ "tipo": "conexao","status":"unplugged" }';
     	 
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
