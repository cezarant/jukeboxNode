  // Constantes de Bibliotecas 
  const express    = require('express');	
  const NodeID3    = require('node-id3');
  const { exec }   = require("child_process");
  const path      = require('path'); 
  const fs = require('fs');
  // Outras variaveis 
  const app        = express();
  var port         = process.env.PORT || 3008;  
  var http         = require('http').Server(app);
  var urlUSB       = '/';   
  var alfabeto     = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?'
  var intervalId; 
  var itens        = [];    
  var dicionario   = [];  
  // Timer que fica o tempo todo verificando se o USB foi inserido
  function verUSBInserido(){    listaDispositivosUsb();	  }
  intervalId = setInterval(verUSBInserido, 1500);   
  
  http.listen(port, function(){        
    var usbDetect = require('usb-detection'); 
	usbDetect.startMonitoring();
	usbDetect.on('add', function(){ console.log('Pen Drive conectado...'); });	
	usbDetect.on('remove', function(){ intervalId = setInterval(verUSBInserido, 1500); });		
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
	    try{			
	   	    Bandas.push(
		    {			
			nomeBanda: musicasAlbum.values().next().value.artist !== undefined ? 
                                   musicasAlbum.values().next().value.artist :'',
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
  }	  
