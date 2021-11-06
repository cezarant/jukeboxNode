const fs         = require('fs');
const path       = require('path');
const NodeID3    = require('node-id3');
var alfabeto      = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?';
 
function lendoItens(stdout){	
	var itens = []; 	
	var lines = stdout.split('\n');
	lines.map(function(linha){	  	
	        item = { diretorio : '', arquivo : '',  album : '' , title : '' ,composer : '', artist : '',letra : '',bandas : [] };
	 	if((path.extname(linha).toLowerCase() === '.mp3') || 
		   (path.extname(linha).toLowerCase() === '.wma') || 
	           (path.extname(linha).toLowerCase() === '.wmv') ||
		   (path.extname(linha).toLowerCase() === '.wav')){
			item.diretorio = diretorio; 	
			item.arquivo = linha; 
			itens.push(item);				
	        }else{
		        diretorio = linha;
        	}    				
	});
	return itens; 
}
function recuperaTagsArquivo(item){
  	 try{
	       const tags = NodeID3.read(item.diretorio.toString().replace(":",'') +"/"+ item.arquivo);
	       item.album = tags.album;
	       item.title = tags.title;
	       item.composer = tags.composer;
	       item.artist = tags.artist; 	
         }catch(ex){
	       console.log(ex.message); 
	 } 
	 return item.title;
} 
function classificaDadosBrutos(dadosBrutos){
	var dicionario = [];    	    
	for(var j = 0;j< alfabeto.length;j++)
		dicionario.push(this.classPorDicionario(dadosBrutos,alfabeto[j])); 
	    			    
	return dicionario; 	    		    	 
}  	 
function classPorDicionario(itensA,letra){
	var ItemDicionario ; 
	var BandasPorLetra = itensA.filter(x => x.artist !== undefined && x.artist.charAt(0) === letra);
	var arrAlbuns  = Array.from(new Set(BandasPorLetra.map(x => x.album)));	
	var Bandas = [];	
	for(var j = 0;j< arrAlbuns.length;j++){
	    var musicasAlbum = itensA.filter(x => x.album !== undefined && x.album === arrAlbuns[j]);		    	    
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
       	       console.log('Erro'+ we.message); 
            }	
	}
	itemDicionario = { letra: letra, bandas: Bandas };	
	return itemDicionario; 		
} 

module.exports = {
   lendoItens,
   recuperaTagsArquivo,
   classPorDicionario,
   classificaDadosBrutos	
};


