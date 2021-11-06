const lendoItens          = require('./classifiquer.js');
// const recuperaTagsArquivo = require('./classifiquer.js');
const { exec }   = require("child_process");

var itens = 
[
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: '06-Sem Você-Rosa de Saron.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: '07-Anjos das Ruas-Rosa de Saron.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: '08-No Meu Coração-Rosa de Saron.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: 'Belo-momentos tempo de aprender.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: 'Boka Loka Melhor Amiga da minha namorada.wav',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/AUDIO:',
        arquivo: 'Bokaloka - Timidez.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: 'Depeche Mode - Enjoy The Silence.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: 'Madonna - Miles Away.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: 'Michael Jackson - Bad 2.8.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: 'Nicola Fasano ft. Pat-Rich - 75. Brazil Street.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: "Rihanna - Don't Stop The Music.mp3",
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      },
      {
        diretorio: '/home/cezar/Documentos/Summer Eletro Hits:',
        arquivo: 'Rihanna - Take a Bow.mp3',
        album: '',
        title: '',
        composer: '',
        artist: '',
        letra: '',
        bandas: []
      }
    ];

test('Recuperando itens', () => {  
    exec("ls /home/cezar/Documentos/ -1 -R", (error, stdout, stderr) => {   
		if (error){
   	          console.log(`error: ${error.message}`);
	          return;
 	        }

	        if (stderr){
	          console.log(`stderr: ${stderr}`);
	          return;
	        }
	 
    	        expect(lendoItens(stdout)).toEqual(itens);	
    });
});

/*test('Recuperando tags',() => {      	
    expect(recuperaTagsArquivo(itens[0])).toBe("Sem Você");	
});*/
