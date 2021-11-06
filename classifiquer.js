const fs         = require('fs');
const path       = require('path');
const NodeID3    = require('node-id3');
 
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

module.exports = {
   lendoItens,
   recuperaTagsArquivo
};


