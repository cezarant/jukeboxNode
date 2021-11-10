// Constantes gerais 
const NodeID3     = require('node-id3');
const { exec }    = require("child_process");
const path        = require('path');
const fs          = require('fs');
const alfabet  = require('./alfabet.js');
// Constantes especificas do JukeBox 
var usbDetect = require('usb-detection'); 
var urlUSB        = '/';   
var nomeDiretorio = 'listas/diretorio.json';
var listas        = "listas/itens.json";

var intervalId; 
var itens         = [];    
var dicionario    = [];  
var telemetriaAtiva   = true; 
function telemetria(tipo,msg){
    if(telemetriaAtiva){ 	
       // io.emit('messageBroadcast',{ tipo: tipo , msg: msg});  
       console.log('Telemetria:',msg); 	   	
   }
}
// Timer que fica o tempo todo verificando se o USB foi inserido
function verUSBInserido(){    listaDispositivosUsb();	  }
// intervalId       = setInterval(verUSBInserido, 1500);   
// ----------------------------------------------------------------------------------------------
const express    = require('express');
const app        = express();
const server     = require('http').createServer(app);
// Criando Servidor Socket 
const io         = require('socket.io')(server);
const port       = process.env.PORT || 3000;

server.listen(port, () => {     
    /*usbDetect.startMonitoring();
    usbDetect.on('add', function(){ telemetria(1,'Pen Drive conectado...'); });	
    usbDetect.on('remove', function(){ 
      telemetria(2,'removido'); 	      	
      intervalId = setInterval(verUSBInserido, 1500); 
    });	
    console.log('Servidor rodando em:',port); */
    listaChaptersDvd();	
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let addedUser = false;   
  socket.on('stop typing', () => {         	
    socket.broadcast.emit('stop typing', {      
	username: socket.username
    });
    console.log('teste'); 
  });  
});
// ---------------------------------------------------
// Criando 
function listaChaptersDvd(){
    exec("blkid && lsdvd -c -Ox /dev/sr0 > 1.xml", (error, stdout, stderr) => {	   
	   if (error){
             telemetria(1,`error: ${error.message}`);
             // return;
           }

           if (stderr){
             telemetria(1,`stderr: ${stderr}`);
             // return;
           }	   
	   var parser = require('xml2json');
	   fs.readFile('1.xml', function(err, data) {		
        	var json = JSON.parse(parser.toJson(data, {reversible: true}));
		var tracks = json.lsdvd.track;
		var item = { 'Nome': json.lsdvd.title, chapters: tracks.map(x => x.chapter) };		  					 
		console.log("Item:", item.chapters[0].map(y => y.startcell) );
	   });	
    }); 
}


function listaDispositivosUsb(){	    
        telemetria(1,`Buscando dispositivo...`);
        exec("findmnt -t vfat -o TARGET", (error, stdout, stderr) => {	   
	   if (error){
             telemetria(1,`error: ${error.message}`);
             return;
           }

           if (stderr){
             telemetria(1,`stderr: ${stderr}`);
             return;
           }	   

	   var lines = stdout.split('\n');
	   lines.map(function(item){	 
   	      if((item !== 'TARGET') && (item !== '')){
		urlUSB = item;	   
		telemetria(urlUSB);  		
		clearInterval(intervalId);	
		listaArquivos();			
	      }
           });	    
       });       
  } 	    	    	
	
  function listaArquivos(){	
	if (fs.existsSync(listas))
        { 
	    console.log('lendo dados do arquivo de itens...'); 
 	    dicionario = alfabet.classificaDadosBrutos(JSON.parse(fs.readFileSync(listas)));
	    
	    fs.writeFile(nomeDiretorio, JSON.stringify(dicionario), function(err) {
		 if(err) telemetria(1,'error', err);
		 
		clearInterval(intervalId);		 		
	    });		   
	}else{
            exec("ls "+ urlUSB +" -1 -R", (error, stdout, stderr) => {   
		if (error){
   	          telemetria(1,`error: ${error.message}`);
	          return;
 	        }

	        if (stderr){
	          telemetria(1,`stderr: ${stderr}`);
	          return;
	        }	    	                       
 		itens = alfabet.lendoItens(stdout); 
		console.log('itens:',itens); 		
		buscaDetalhesMp3(0);
	   });
	}
  }

  function buscaDetalhesMp3(contador){	
	if (itens[contador].diretorio !== undefined){	
    	   try{
	       const tags = NodeID3.read(itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo);
	       itens[contador].metamusica = { diretorio: itens[contador].diretorio.toString().replace(":",''), nome : itens[contador].arquivo }; 	
	       itens[contador].album = tags.album;
	       itens[contador].title = tags.title;
	       itens[contador].composer = tags.composer;
	       itens[contador].artist = tags.artist; 		       
	       telemetria(1,'Busca arquivo '+ contador + ' de '+ itens.length);	
	   }catch(ex){
	       telemetria(1,'buscaDetalhesMp3:' + ex.message); 
	   } 
           
	   if((contador + 1) < itens.length){	        		   	
   	       contador++;
	       buscaDetalhesMp3(contador);	
	   }else{
	      fs.writeFile(listas, JSON.stringify(itens), function(err){
   	          if(err) 
                    telemetria(1,'error', err);
			 
		  telemetria(1,'Arquivo de itens gravado com sucesso'); 		    	 
	      });
	
              dicionario = alfabet.classificaDadosBrutos(itens);
	      fs.writeFile(nomeDiretorio, JSON.stringify(dicionario), function(err) {
		 if(err) telemetria(1,'error', err);
		 
		  clearInterval(intervalId);		 		
     	      }); 	
	      telemetria('3','Reativando tela'); 	
	   }	   
	}
  }	
  // API 
  // ------------------------------------------------------------------------------------------------  
  app.get('/video/:video', function(req, res)
  {
	exec("find . -name '"+ req.params["video"]  +"'", (error, stdout, stderr) => {   
  	       if (error){
   	        telemetria(1,`error: ${error.message}`);
	          return;
 	        }

	        if (stderr){
	          telemetria(1,`stderr: ${stderr}`);
	          return;
	        }	    	                          
	

	const movieName  = req.params["video"];	  
	const path = urlUSB +'/'+ stdout.replace('.','');
	console.log('Path:',path); 
	const fs = require('fs');	
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
	
	if (range){
	    const parts = range.replace(/bytes=/, "").split("-");
	    const start = parseInt(parts[0], 10);
	    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
	    const chunksize = (end-start)+1
	    const file = fs.createReadStream(path, {start, end});

	    const head = {
	      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
	      'Accept-Ranges': 'bytes',
	      'Content-Length': chunksize,
	      'Content-Type': 'audio/mpeg',
	    }

	    res.writeHead(206, head);
	    file.pipe(res);

	  }else{
	    const head = {
	      'Content-Length': fileSize,
	      'Content-Type': 'audio/mpeg',
        }
	
	res.writeHead(200, head)
	fs.createReadStream(path).pipe(res)

	}
      });

  });        	
  
  app.get('/', function(req, res)
  {
      res.sendFile(__dirname + '/index.html');
  });

  app.get('/juke',function(req,res){
	res.setHeader('Content-Type', 'application/json');	
	fs.readFile(nomeDiretorio, "utf8", (err, jsonString) => {
  		if (err){
		    console.log("File read failed:", err);
	            res.end(500);
		}
	        var juke = {"Itens": JSON.parse(jsonString) };
    	        res.end(JSON.stringify({  juke  }, null, 3));	     	 
	});	
  }); 	
