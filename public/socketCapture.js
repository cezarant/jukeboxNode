  const socket = io();
  
  $(document).ready(function(e)
  {
	socket.emit('stop typing');       
	/*media=document.getElementById("plTeste");	 
	media.addEventListener('ended', (event) => 
	{
		verifyStack();
	});
	buscaDaAPI();       
        socket = io.connect('http://localhost:'+ porta); */
  });    
  socket.on('msgserv', (data) => {
	$('#txtTelemetria').text('teste...........');	
  });	
 

/*  var media;  
  var porta = 3008;  	
  var urlPrincipal = 'http://localhost:'+ porta +'/video/';
  var statusOfConnect; 
  var selectedMovie; 
  var videoStack = [];   
  var cont = 0;	  
  var movieFolder = "/movies/";
  var statusDesconectado = 1; 
  var statusModal;  
  var contNivel = 0; 
  var socket;
 
  $(document).ready(function(e)
  {
	media=document.getElementById("plTeste");	 
	media.addEventListener('ended', (event) => 
	{
		verifyStack();
	});
	buscaDaAPI();       
        socket = io.connect('http://localhost:'+ porta);	       
  });    
  
  $(document).keydown(function(e)
  {	
	console.log(e.keyCode);
	if(e.keyCode === 37)
	{
	   retornaAlfabeto();	   
	} 
	if(e.keyCode === 39)
	{
	   avancaAlfabeto();
	} 
	
	if (e.keyCode == 113){
	    apagarLuzes();    
	}
	if (e.keyCode == 27){
	    acenderLuzes();
	}
	if (e.keyCode == 13){
		var elem = document.getElementById("plTeste");
		if (elem.requestFullscreen){
		    elem.requestFullscreen();
		}				
	}
	
	if(e.keyCode == 32)
	{
   	   if(media.paused){
	      media.play();
	   }else{ 	  
             media.pause(); 
	   }
	} 	
	if (e.keyCode == 38){  	
	     avancafilme();			
	}		
  });  
  function verifyStack()
  {
	if(videoStack.length > 0)
	{
	   selectedMovie =  videoStack.pop();
       	   playMovie();		
	} 
  }  
  function pushStack()
  {
	if(selectedMovie !== undefined)
	{
		videoStack.push(selectedMovie);
		var ul = document.getElementById("ulVideos");
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(selectedMovie));
		ul.appendChild(li);	
	}	
  }   
  function chooseMovie(movieName)
  {
    	if(selectedMovie === undefined)
	{
		selectedMovie = urlPrincipal + movieName; 
	    	playMovie();  
	}else{
		videoStack.push(urlPrincipal + movieName);
	} 	    
  }
  function playMovie(){
	if(media.paused)
	{
	   console.log('selectedMovie',selectedMovie); 
	   media.removeAttribute("src"); 
	   media.setAttribute('src', selectedMovie);	
	   media.pause();		
	   media.load();  
	   media.play();
	   $('#btnPlay').text('Pause');
	}else{
	  media.pause(); 
	  $('#btnPlay').text('Play');
	}	
  } 
  function forwardMovie(){	
	$('#txtTelemetria').text(listVideos[cont]);
	selectedMovie = listVideos[cont]; 
			
	if((cont + 1) >= listVideos.length)
	    cont = 0; 	
        else 
	   cont = cont + 1; 		   
  }     
  function convertMensagem(msg)
  {
      var obj = JSON.parse(msg);
      switch(obj.tipo)
      {
         case 'conexao':
           gerenciaLuzes(obj.status);	  
           break; 
         case 'file': 
           setaValores(obj.valor);
           break;   
      }               	
  }
  function buscaDaAPI() {
        $.ajax(
	{
		method: "GET",
		url: 'http://localhost:'+ porta +'/juke/',
		data: { servico: "video"}
	})
	.done(function(result)
	{		
		for(var i=0;i< result.juke.Itens.length;i++){
		    juke.push(result.juke.Itens[i]);
		}		
		alfabeto = juke; 				        
		setaValores(alfabeto[0].Letra,alfabeto[0].Bandas);
	})
	.fail(function(){
		alert( "Erro na busca do Serviço, contate o desenvolvedor.");
	});
  }
  
  function gerenciaLuzes(msg){      
      $('#ulVideos').empty();
      if(msg === 'unplugged'){        
        statusOfConnect ='unplugged';
        acenderLuzes();
      }else{
        statusOfConnect ='connected'
        apagarLuzes();
      }  	      
  }  
  function acenderLuzes()
  {
    document.getElementById('luzApagada').style.display = 'none';
  }
  function apagarLuzes() 
  {
    document.getElementById('luzAcessa').style.display = 'block';
    document.getElementById('luzApagada').style.display = 'block';
  }	  	   */
