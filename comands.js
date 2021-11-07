const { exec } = require("child_process");

function encontraPenDrive(){
    exec("findmnt -t vfat -o TARGET", (error, stdout, stderr) => {	   
	   if (error){
             console.log(1,`error: ${error.message}`);
             return;
           }

           if (stderr){
             console.log(1,`stderr: ${stderr}`);
             return;
           }	 
           console.log(stdout);   
	   return stdout;
   });
}
function listaArquivos(urlUSB){
   exec("ls "+ urlUSB +" -1 -R", (error, stdout, stderr) => {   
	if (error){
   	   console.log(1,`error: ${error.message}`);
	   return;
        }

        if (stderr){
           console.log(1,`stderr: ${stderr}`);
           return;
        }
        return stdout;	
   });		
} 
function buscaTarget(stdout){
   var urlUSB = '';
   var lines = stdout.split('\n');   
   lines.map(function(item){	 
        if((item !== 'TARGET') && (item !== ''))
  	    urlUSB = item;	   						      
   });	
   return urlUSB; 	
}

module.exports = {
  encontraPenDrive,
  listaArquivos,
  buscaTarget 
};
