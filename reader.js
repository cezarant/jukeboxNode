// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let addedUser = false;
  console.log('data','data'); 	 
  socket.on('stop typing', () => {    
    console.log('teste'); 	
    socket.broadcast.emit('stop typing', {      
	username: socket.username
    });
  });  
});



/*const NodeID3    = require('node-id3');
const { exec }   = require("child_process");
var player       = require('play-sound')(opts = {})
const path       = require('path'); 
const express    = require('express');
const app        = express();
const http       = require('http');
const server     = http.createServer(app);
const fs         = require('fs');
const io         = require("socket.io")(server, {
      allowEIO3: true 
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Grid.html')
});

io.on('connection', (socket) => {
    console.log('O player se conectou...');
});

server.listen(3008, () => {
    console.log('Listining on 3000');
}); // correct


  // Constantes de Bibliotecas 
  /*
  
  const path       = require('path'); 
  
  var io           = require('socket.io');	
  
  // Outras variaveis   
  const app        = express();
  var port         = process.env.PORT || 3008;  
  var http         = require('http').Server(app);
  
  http.listen(port, function(){        
    var usbDetect = require('usb-detection'); 
	usbDetect.startMonitoring();
	usbDetect.on('add', function(){ console.log('Pen Drive conectado...'); });	
	usbDetect.on('remove', function(){ intervalId = setInterval(verUSBInserido, 1500); });		
  });  
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', function(req, res)
  {
      res.sendFile(__dirname + '/Grid.html');
  });

  app.get('/video/:video', function(req, res)
  {
	  const movieName  = req.params["video"];	  
	  const path = urlUSB + '/AUDIO/' + movieName;
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
	      'Content-Type': 'audio/mpeg',
	    }
	    res.writeHead(206, head);
	    file.pipe(res);
	  } else {
	    const head = {
	      'Content-Length': fileSize,
	      'Content-Type': 'audio/mpeg',
	  }
	    res.writeHead(200, head)
	    fs.createReadStream(path).pipe(res)
	  }
  });        	

  app.get('/juke',function(req,res){
	res.setHeader('Content-Type', 'application/json');	
	fs.readFile("dicionario.json", "utf8", (err, jsonString) => {
  		if (err){
		    console.log("File read failed:", err);
	            return;
		}
	        var juke = {"Itens": JSON.parse(jsonString) };
    	        res.end(JSON.stringify({  juke  }, null, 3));	     	 
	});	
  }); 	

  function listaDispositivosUsb(){	    
        console.log(`Buscando dispositivo...`);
        exec("findmnt -t vfat -o TARGET", (error, stdout, stderr) => {	   
	   if (error){
             console.log(`error: ${error.message}`);
             return;
           }

           if (stderr){
             console.log(`stderr: ${stderr}`);
             return;
           }	   

	   var lines = stdout.split('\n');
	   lines.map(function(item){	 
   	      if((item !== 'TARGET') && (item !== '')){
		urlUSB = item;	     
		console.log(`TARGET: ${item}`);                           
	    	console.log(`Timer Desligado`);      
		clearInterval(intervalId);	
		listaArquivos();			
	      }
           });	    
       });       
  } 	  
  function classPorDicionario(itensA,letra){
	var BandasPorLetra = itensA.filter(x => x.artist !== undefined && x.artist.charAt(0) === letra);
	var arrAlbuns  = Array.from(new Set(BandasPorLetra.map(x => x.album)));	
	var Bandas = [];	
	for(var j = 0;j< arrAlbuns.length;j++){
	    var musicasAlbum = itensA.filter(x => x.album !== undefined && x.album === arrAlbuns[j]);		    
	    console.log('Preenchendo músicas nos albuns...');  	
            console.log(musicasAlbum); 				
	    try{			
	   	    Bandas.push(
		    {			
			Nome: musicasAlbum.values().next().value.artist !== undefined ? 
                              musicasAlbum.values().next().value.artist :'',
	  		Albuns:[
		        {
			   Nome: arrAlbuns[j], 
			   Musicas: musicasAlbum.map(x => x.arquivo)
		  	}]	
		    }); 
	    }catch(we){ 
       	       console.log('Erro lendo '+ arrAlbuns[j] +':', we.message); 
            }	
	}
	dicionario.push({ Letra: letra, Bandas: Bandas }); 	
  } 
  function classificaDadosBrutos(dadosBrutos){
   	    for(var j = 0;j< alfabeto.length;j++)
		classPorDicionario(dadosBrutos,alfabeto[j]); 
	    			    
	    fs.writeFile("dicionario.json", JSON.stringify(dicionario), function(err) {
		   if(err) console.log('error', err);
		 
		   console.log('Arquivo de dicionario gravado com sucesso'); 		    	 
	    });		
  }  	 	
  function listaArquivos(){	
	if (fs.existsSync('itens.json'))
        { 
	    console.log('lendo dados do arquivo de itens...'); 
	    let rawdata = fs.readFileSync('itens.json');
	    classificaDadosBrutos(JSON.parse(rawdata)); 
	}else{
            exec("ls /media/cezar/ESD-USB -1 -R", (error, stdout, stderr) => {   
		if (error){
   	          console.log(`error: ${error.message}`);
	          return;
 	        }

	        if (stderr){
	          console.log(`stderr: ${stderr}`);
	          return;
	        }	 
   	       
                console.log('lendo dados do Pen Drive...');   
		var lines = stdout.split('\n');
	        lines.map(function(linha){	  	
		   item = { diretorio : '', arquivo : '',  album : '' , title : '' ,composer : '', artist : '',letra : '',bandas : [] };
 		   if((path.extname(linha).toLowerCase() === '.mp3') || 
		      (path.extname(linha).toLowerCase() === '.wma') || 
                      (path.extname(linha).toLowerCase() === '.wmv') ||
		      (path.extname(linha).toLowerCase() === '.wav'))
		   {
			item.diretorio = diretorio; 	
			item.arquivo = linha; 
			itens.push(item);				
		   }else{
			diretorio = linha;
		   }    	
		});			 			
		buscaDetalhesMp3(0);
	   });
	}
  }
  function buscaDetalhesMp3(contador){	
	if (itens[contador].diretorio !== undefined){	
    	   try{
	       const tags = NodeID3.read(itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo);
	       itens[contador].album = tags.album;
	       itens[contador].title = tags.title;
	       itens[contador].composer = tags.composer;
	       itens[contador].artist = tags.artist; 	
	       console.log('Buscando Tags dentro do arquivo de MP3...'); 		   	
           }catch(ex){
	       console.log(ex.message); 
	   } 
    	
	   if((contador + 1) < itens.length){
               contador++;
	       buscaDetalhesMp3(contador);	
	   }else{
               fs.writeFile("itens.json", JSON.stringify(itens), function(err) {
		   if(err) console.log('error', err);
		 
		   console.log('Arquivo de itens gravado com sucesso'); 		    	 
	       });	
	       classificaDadosBrutos(itens);
           }
	}
  }	  */
