  var socket = io();  
  var media;  
  var listVideos =
  [
	   'http://localhost:3008/video/Confortably.mp4',
	   'http://localhost:3008/video/Crowley.mp4',
	   'http://localhost:3008/video/Start_me_up.mp4'
  ];
  var selectedMovie; 
  var videoStack = []; 
  var cont = 0;	  
  var movieFolder = "/movies/";
  var statusDesconectado = 1; 
 
  $(document).ready(function(e)
  {
	media=document.getElementById("plTeste");	 
	media.addEventListener('ended', (event) => 
	{
		verifyStack();
	});
	//showOptions('unplugged');
	
	/*$("#myInput").on("keyup", function()
	{
		var value = $(this).val().toLowerCase();
		$("#myTable tr").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});*/	
  });  
  $(document).keydown(function(e)
  {	
	console.log(e.keyCode);
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
  function pushStack(){
	if(selectedMovie !== undefined)
	{
		videoStack.push(selectedMovie);
		var ul = document.getElementById("ulVideos");
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(selectedMovie));
		ul.appendChild(li);	
	}	
  }
  function chooseMovie()
  {
	if(selectedMovie ===  undefined)
	   selectedMovie = listVideos[Math.floor(Math.random() * (listVideos.length-1))];   
     
    playMovie();
  } 
  
  function playMovie(){
	if(media.paused)
	{
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
  function showOptions(msg){
      if(msg === 'unplugged')
      { 	
        acenderLuzes();
      }else{
      	apagarLuzes();
      }   
  }
  function acenderLuzes()
  {
    document.getElementById('luzApagada').style.display = 'none';
  }
  /** Mostra mensagem "Carregando".....*/
  function apagarLuzes() 
  {
    document.getElementById('luzAcessa').style.display = 'block';
    document.getElementById('luzApagada').style.display = 'block';
   	}
  socket.on('messageBroadcast', function(msg)
  { 	
	console.log(msg);
	showOptions(msg);	 
	$('#txtTelemetria').text(msg);
  });	  	   
