// Constantes gerais 
const NodeID3     = require('node-id3');
const { exec }    = require("child_process");
const path        = require('path');
const fs          = require('fs');
// Constantes especificas do JukeBox 
var usbDetect = require('usb-detection'); 
var urlUSB        = '/';   
var nomeDiretorio = 'diretorio.json';
var alfabeto      = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?';
var intervalId; 
var itens         = [];    
var dicionario    = [];  
var telemetriaAtiva   = true; 
function telemetria(msg){
    if(telemetriaAtiva){ 	
       io.emit('messageBroadcast',msg);  
       console.log('Telemetria:',msg); 	   	
   }
}
// Timer que fica o tempo todo verificando se o USB foi inserido
function verUSBInserido(){    listaDispositivosUsb();	  }
intervalId       = setInterval(verUSBInserido, 1500);   
// ----------------------------------------------------------------------------------------------
const express    = require('express');
const app        = express();
const server     = require('http').createServer(app);
// Criando Servidor Socket 
const io         = require('socket.io')(server);
const port       = process.env.PORT || 3000;

server.listen(port, () => {     
    usbDetect.startMonitoring();
    usbDetect.on('add', function(){ telemetria('Pen Drive conectado...'); });	
    usbDetect.on('remove', function(){ intervalId = setInterval(verUSBInserido, 1500); });	
    console.log('Servidor rodando em:',port); 
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
function listaDispositivosUsb(){	    
        telemetria(`Buscando dispositivo...`);
        exec("findmnt -t vfat -o TARGET", (error, stdout, stderr) => {	   
	   if (error){
             telemetria(`error: ${error.message}`);
             return;
           }

           if (stderr){
             telemetria(`stderr: ${stderr}`);
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
  function classPorDicionario(itensA,letra){
	var BandasPorLetra = itensA.filter(x => x.artist !== undefined && x.artist.charAt(0) === letra);
	var arrAlbuns  = Array.from(new Set(BandasPorLetra.map(x => x.album)));	
	var Bandas = [];	
	for(var j = 0;j< arrAlbuns.length;j++){
	    var musicasAlbum = itensA.filter(x => x.album !== undefined && x.album === arrAlbuns[j]);		    
	    telemetria('Preenchendo músicas nos albuns...');  	
	    try{			
	   	    Bandas.push(
		    {			
			nome: musicasAlbum.values().next().value.artist !== undefined ? 
                              musicasAlbum.values().next().value.artist :'',
	  		albuns:[
		        {
			   nome: arrAlbuns[j], 
			   musicas: musicasAlbum.map(x => x.arquivo)
		  	}]	
		    }); 
	    }catch(we){ 
       	       telemetria('Erro lendo '+ arrAlbuns[j] +':', we.message); 
            }	
	}
	dicionario.push({ letra: letra, bandas: Bandas }); 	
  } 
  function classificaDadosBrutos(dadosBrutos){
   	    for(var j = 0;j< alfabeto.length;j++)
		classPorDicionario(dadosBrutos,alfabeto[j]); 
	    			    
	    fs.writeFile(nomeDiretorio, JSON.stringify(dicionario), function(err) {
		 if(err) telemetria('error', err);
		 
		 telemetria('1'); 		    	 
	    });		
  }  	 	
  function listaArquivos(){	
	if (fs.existsSync('itens.json'))
        { 
	    console.log('lendo dados do arquivo de itens...'); 
	    let rawdata = fs.readFileSync('itens.json');
	    classificaDadosBrutos(JSON.parse(rawdata)); 
	}else{
            exec("ls "+ urlUSB +" -1 -R", (error, stdout, stderr) => {   
		if (error){
   	          telemetria(`error: ${error.message}`);
	          return;
 	        }

	        if (stderr){
	          telemetria(`stderr: ${stderr}`);
	          return;
	        }	 
   	                       
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
	telemetria('Busca arquivo '+ contador + ' de '+ itens.length);	
	if (itens[contador].diretorio !== undefined){	
    	   try{
	       const tags = NodeID3.read(itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo);
	       itens[contador].album = tags.album;
	       itens[contador].title = tags.title;
	       itens[contador].composer = tags.composer;
	       itens[contador].artist = tags.artist; 		       

	   }catch(ex){
	       telemetria(ex.message); 
	   } 
           
	   if((contador + 1) < itens.length){	        		   	
		       contador++;
		       buscaDetalhesMp3(contador);	
	   }else{
		       fs.writeFile("itens.json", JSON.stringify(itens), function(err) {
			   if(err) telemetria('error', err);
			 
			   telemetria('Arquivo de itens gravado com sucesso'); 		    	 
		       });	
		       classificaDadosBrutos(itens);
	   }	   
	}
  }	
  // API 
  // ------------------------------------------------------------------------------------------------  
  app.get('/video/:video', function(req, res)
  {
	const movieName  = req.params["video"];	  
	const path = urlUSB + '/AUDIO/' + movieName;
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
