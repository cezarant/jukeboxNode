  const express    = require('express');	
  const NodeID3    = require('node-id3');
  const { exec }   = require("child_process");
  const app        = express();
  var port         = process.env.PORT || 3008;  
  var http         = require('http').Server(app);
  var urlUSB       = '/';   
  var alfabeto     = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?'
  var intervalId; 
  var itens        = [];    
  var dicionario   = [];  
  
  http.listen(port, function(){        
    var usbDetect = require('usb-detection'); 
	usbDetect.startMonitoring();
	usbDetect.on('add', function(){ console.log('Pen Drive conectado...'); });
	
	usbDetect.on('remove', function(){ 		
		intervalId = setInterval(verUSBInserido, 1500);   		
	});
	usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
	usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });	 
	usbDetect.on('change', function(device) { console.log('change', device); });
	usbDetect.on('change:vid', function(device) { console.log('change', device); });
	usbDetect.on('change:vid:pid', function(device) { console.log('change', device); });
	console.log('start...'); 	
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
		         listaArquivos();			                  }
	        });	    
        });       
  } 	  
  function classPorDicionario(itensA,letra){
	var bandasPorLetra = itensA.filter(x => x.artist !== undefined && x.artist.charAt(0) === letra);
	// Recupera os Albums, retirando nomes duplicados
	// TODO: Verificar estratégia para 
	var arrAlbuns  = Array.from(new Set(bandasPorLetra.map(x => x.album)));	
	var Bandas = [];	
	for(var j = 0;j< arrAlbuns.length;j++){
	    var musicasAlbum = itensA.filter(x => x.album !== undefined && x.album === arrAlbuns[j]);		    
	    try {			
	   	    Bandas.push(
		    {			
			nomeBanda: musicasAlbum.values().next().value.artist !== undefined ? musicasAlbum.values().next().value.artist :'',
	  		albuns:[
		        {
			   nome: arrAlbuns[j], 
			   musicas: musicasAlbum.map(x => x.arquivo)
		  	}]				
			
		    }); 
	    }catch(we){ 
	  	   console.log('Erro lendo '+ arrAlbuns[j] +':', we.message); 
            }	
	}
	dicionario.push({ letra: letra, bandas: Bandas }); 	
  }  	 	
  function listaArquivos(){
	const fs = require('fs');
	if (fs.existsSync('itens.json'))
        { 
	    let rawdata = fs.readFileSync('itens.json');
	    let itensA = JSON.parse(rawdata);
	    for(var j = 0;j< alfabeto.length;j++){
		classPorDicionario(itensA,alfabeto[j]); 
	    }
		
	    fs.writeFile("dicionario.json", JSON.stringify(dicionario), function(err) {
		   if(err) console.log('error', err);
		 
		   console.log('Arquivo gravado com sucesso'); 		    	 
	    });	
	}

	/*exec("ls /media/cezar/ESD-USB -1 -R", (error, stdout, stderr) => {   
		if (error) {
   	          console.log(`error: ${error.message}`);
	          return;
 	        }

	        if (stderr) {
	          console.log(`stderr: ${stderr}`);
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
	});*/
  }
  function buscaDetalhesMp3(contador){	
	if (itens[contador].diretorio !== undefined)
	{	
    	   try{
		   const tags = NodeID3.read(itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo);
		   itens[contador].album = tags.album;
		   itens[contador].title = tags.title;
		   itens[contador].composer = tags.composer;
	  	   itens[contador].artist = tags.artist; 		   
		   console.log('-------------------------------------------');
           }catch(ex){
		   console.log(ex.message); 
	   } 
    	
	   if((contador + 1) < itens.length){
               contador++;
	       buscaDetalhesMp3(contador);	
	   }else{
	       classificaBandas();
           }
	}
  }	
  function buscaA(value){
     return value == 'I';	 
  }
  function classificaBandas(){
     const found = itens.filter(buscaA()); 
     console.log(found); 	
     var fs = require('fs');
     fs.writeFile("itens.json", JSON.stringify(itens), function(err) {
	    if(err) console.log('error', err);
	 
           console.log('Arquivo gravado com sucesso'); 		    	 
      });	

     /*for(var i = 0;i< alfabeto.length;i++){
          for(var j = 0;j< itens.length;j++){
	         var letra = itens[j].artist !== undefined ? itens[j].artist.charAt(0) : '?'; 		      	
		 if(letra === alfabeto[i]){
	            itens[j].letra = alfabeto[i];
	            itens[j].bandas.push({ nome: itens[j].artist, albuns : []});    	
		 }	      
	  }       		
     } 
     classificaAlbuns();*/
  } 
  function classificaMusicas(){
     for(var j = 0;j< itens.length;j++){
         for(var i = 0;i< itens[j].bandas.length;i++){ 	     
	     for(var k = 0;k< itens[j].bandas[i].albuns.length;k++){ 	     
          	 if((itens[j].bandas[i].albuns[k].nome === itens[j].album) && (itens[j].title !== undefined)){
	             itens[j].bandas[i].albuns[k].musicas.push({ nome: itens[j].title});  			  	              
                 }  	             			   
	     }             
	 }    
     }	    
     var fs = require('fs');
     fs.writeFile("thing.json", JSON.stringify(itens), function(err) {
	    if(err) console.log('error', err);
	 
           console.log('Arquivo gravado com sucesso'); 		    	 
      });	
  }
  async function myfunction()
  {     
     const drivelist = require('drivelist');
     const drives = await drivelist.list();     
     drives.forEach(() => {       	   
	   const path = require('path');
   	   const fs = require('fs');		   	
	   const directoryPath = path.join('/', urlUSB);	   
	   fs.readdir(directoryPath, function (err, files){ 	      
	       if (err)
   	          return console.log('Unable to scan directory: ' + err);
  	        	
	       var filesList = files.filter(function(e){
    		   return path.extname(e).toLowerCase() === '.mp4'
  	       });
  			        	
	       filesList.forEach(function (file){		
		   console.log('{"tipo":"file","valor":"'+ file +'"}');		   		    		
	       });
  	    });	  	          	
     });	
  }  
  function verUSBInserido(){
     listaDispositivosUsb();	
  }
  intervalId = setInterval(verUSBInserido, 1500);   

