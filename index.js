var intervalId; 
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
var comandos      = [];
var comandosTag   = [];
var comandosFFMpeg = [];
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
    usbDetect.on('add', function(){ telemetria(1,'Pen Drive conectado...'); });	
    usbDetect.on('remove', function(){ 
      telemetria(2,'removido'); 	      	
      intervalId = setInterval(verUSBInserido, 1500); 
    });	
    console.log('Servidor rodando em:',port);
   // listaChaptersDvd();	
   /*var titulo = 'Hugo Pena e Gabriel';	
   for(var i=0; i < 25;i++){				
      		   comandosTag.push('ffmpeg -i Track'        + (i + 1) +
                                    '.mp4 -metadata album="' + titulo  +
		                    '" -metadata title="'    + titulo  + 
                                    '" -metadata artist="'   + titulo  +
                                    '" -c copy Track_'       + (i + 1) + '.mp4');

   }	
   colocaTagsEmArquivoMp4(0);*/
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
	   if (error)
             telemetria(1,`error: ${error.message}`);                      

           if (stderr)
             telemetria(1,`stderr: ${stderr}`);
           	   
	   var parser = require('xml2json');
	   fs.readFile('1.xml', function(err, data)
           {		
        	var json = JSON.parse(parser.toJson(data, {reversible: true}));
		var tracks = json.lsdvd.track;
		var item = { 'Nome': json.lsdvd.title, chapters: tracks.map(x => x.chapter) };		  					 
		var cells = item.chapters[0].map(y => y.startcell);	
		for(var i=0; i < cells.length;i++){		
		   console.log('Indice:', i);  
                   comandos.push('HandBrakeCLI -i /dev/sr0 -t 1 -c '+ (i + 1) +'  -e x264 -b 1000 -r 29.97 -w 480 -o Track'+ (i + 1) +'.mp4');
                }			
		recortaChapter(0);	
	   });		   
    });     
}
function recortaChapter(contador){
    console.log(comandos[contador]); 	
    exec(comandos[contador], (error, stdout, stderr) => {	   
	   if (error)
             telemetria(1,`error: ${error.message}`);                        

           if (stderr)
             telemetria(1,`stderr: ${stderr}`);             
          	      
 	   if(contador < comandos.length){
              contador++;
              recortaChapter(contador);   
           }else{
              colocaTagsEmArquivoMp4(0);
           }  		   
    });	
}
function colocaTagsEmArquivoMp4(contador){
    exec(comandosTag[contador], (error, stdout, stderr) => {	   
	   if (error)
             telemetria(1,`error: ${error.message}`);           

           if (stderr)
             telemetria(1,`stderr: ${stderr}`);
           	      
 	   if((contador + 1) < comandosTag.length){
	      console.log('Capitulo', contador); 
	      contador++;
	      colocaTagsEmArquivoMp4(contador);
           }else{
	      console.log('Fim...'); 	
	   } 		
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
		console.log('Bora...'); 		
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
	var exiftoolComando = "exiftool -j \""+ itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo +"\"";
	   comandosFFMpeg.push(exiftoolComando); 
	   console.log(exiftoolComando); 
           
	   if((contador + 1) < itens.length){	        		   	
   	       contador++;
	       buscaDetalhesMp3(contador);	
	   }else{
	       console.log('Fim do empilhamento de comandos de ffmpeg'); 	
	       executaComandosFFMpeg(0);
	   }	   
	}
  }
  function executaComandosFFMpeg(contador){
      exec(comandosFFMpeg[contador], (error, stdout, stderr) => {	   
	   if (error)
             telemetria(1,`error: ${error.message}`);           

           if (stderr)
             telemetria(1,`stderr: ${stderr}`);
           
	   try{ 	
		let metaTags = JSON.parse(stdout);
	        console.log('Album',metaTags[0].Album);  			       
		itens[contador].metamusica = { diretorio: itens[contador].diretorio.toString().replace(":",''), nome : itens[contador].arquivo }; 	
	        itens[contador].album = metaTags[0].Album;
	        itens[contador].title = metaTags[0].Title;
	        itens[contador].artist = metaTags[0].Artist; 		       
           }catch(e){}

 	   if((contador + 1) < comandosFFMpeg.length){
	      contador++;
	      executaComandosFFMpeg(contador);		
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
      });
  }	
  // API 
  // ------------------------------------------------------------------------------------------------  
  app.get('/video/', function(req, res)
  {
	const fs = require('fs');	
	const path = req.query.video;
	const stat = fs.statSync(path);
	const fileSize = stat.size;
	const range = req.headers.range;
	
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
	      'Content-Type': 'video/mp4'
	    }
	    res.writeHead(206, head);
	    file.pipe(res);

	  }else{
	    const head = {
	      'Content-Length': fileSize,
	      'Content-Type': 'video/mp4'
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
