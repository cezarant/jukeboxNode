var alfabeto = []; 
var juke = [];   
var contNivel = 0;  
var contVariavel = 0; 
var contEstatico = 0; 
var musicaSelecionada; 

function carregaAlfabeto(){
    switch(contNivel)
    {
        case 0:            
            setaValores(alfabeto[contVariavel].Letra,alfabeto[contVariavel].Bandas);
            break; 
        case 1: 
            setaValores(alfabeto[contVariavel].Nome,alfabeto[contVariavel].Albuns);
            break; 
        case 2: 
            setaValores(alfabeto[contVariavel].Nome,alfabeto[contVariavel].Musicas);
            break;    
        case 3: 
            setaValores(alfabeto[contVariavel],undefined);
            break;     
    }    
}
function avancaAlfabeto(){
    if(((contVariavel + 1) === alfabeto.length))
	    contVariavel = 0;  
    else 
        contVariavel++;  
    
    carregaAlfabeto();
}
function configuraAlfabeto(){
    switch(contNivel)
    {
        case 0:            
            alfabeto = juke;    
            break; 
        case 1: 
            alfabeto = alfabeto[contVariavel].Bandas;
            break; 
        case 2:
            alfabeto = alfabeto[contVariavel].Albuns;    
            break; 
        case 3: 
            alfabeto = alfabeto[contVariavel].Musicas;    
            break;
    }       
}
function desceNivel(){
    contNivel++;    
    configuraAlfabeto();
    contVariavel = 0;  
    carregaAlfabeto();
}
function sobeNivel(){
    contNivel = 0;     
    $("#musicaSel").empty();
    configuraAlfabeto();
    contVariavel = 0;  
    carregaAlfabeto();
}
function retornaAlfabeto(){
    if((contVariavel - 1) <= -1)
	    contVariavel = alfabeto.length-1;  
    else 
        contVariavel--;
      
    carregaAlfabeto();
}  
function setaValores(itemVariavel,subItens){
    if(subItens !== undefined )
    { 
        var urlVideo = '<a href="#" onclick="chooseMovie(\'{0}\')">'+ itemVariavel +'</a>';
        urlVideo = urlVideo.replace('{0}',itemVariavel);
        $("#ulVideos").text(itemVariavel);    
        $("#subItems").empty(); 
        for (let index = 0; index < subItens.length; index++) {
            $("#subItems").append('<li>'+ subItens[index].Nome + '</li>'); 			
        }	   
    }else{
        musicaSelecionada = itemVariavel;
        $("#musicaSel").text(itemVariavel.Nome);
    } 
 }
 function selecionaMusica(){
    chooseMovie(musicaSelecionada.NomeVideo); 
    $("#musicasSel").append('<li>'+ musicaSelecionada.Nome + '</li>'); 
 }