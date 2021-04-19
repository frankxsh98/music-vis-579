import { render } from "sass";

export default class AudioPlayer {
    constructor(selector = '.audioPlayer', audio = []) {
        this.playerElem = document.querySelector(selector);
        this.audio = audio;
        this.currentAudio = null;
        this.createPlayerElements();
        // You can't start working with the audio context until the users click a button
        this.audioContext = null;
    }
 
    createVisualiser() {
        //Creating a new audio context
        this.audioContext = new AudioContext();
        //Setting a source for the audio file
        this.src = this.audioContext.createMediaElementSource(this.audioElem);
        //Create analyser to extract data from the audio source. The analyser node will then capture audio data using a Fast Fourier Transform (fft) in a certain frequency domain, depending on the AnalyserNode.fftSize property value (if no value is specified, the default is 2048.)
        const analyser = this.audioContext.createAnalyser();
        //Get a local reference to the canvas, which is called on a class member called visualiserElem
        const canvas = this.visualiserElem;
        //Get context of the canvas, which is a standard step when you want to draw things on canvas
        const ctx = canvas.getContext('2d');
        //Connect the source to the analyzer and the analyzer to the audio context destinations
        this.src.connect(analyser);
        analyser.connect(this.audioContext.destination);
        //Set the fft size of the analyzer, which is basically the number of samples that's being taken from the audio data
        analyser.fftSize = 256;
        //Set up a few variables with regard to the actual data that's coming from the analyzer
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        //Calculate how wide each of the bar is based on the canvas width and the buffer length
        const barWidth = (canvas.width / bufferLength);
        let barHeight;
        let bar;
        
        //Actually create the animation that displays all of the bars and change it on a frame by frame basic
        function renderFrame() {
            //Using the request animation function to make sure this gets rendered on each animation repaint in the browser
            requestAnimationFrame(renderFrame);
            //Create a local variable which represent each individual bar
            bar = 0;
            //Populate the analyser data into the dataArray
            analyser.getByteFrequencyData(dataArray);
            //Fill the canvas
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //loop through the bufferlength to create the bars
            for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i]/2-30;
              //Generating color based on frequency
              const r = 1500 * (i/bufferLength);
              const blu = 455 - (1500 * (i/bufferLength));
              ctx.fillStyle = `rgba(${r}, 0, ${blu},0.6)`;
              //creating the bars
              ctx.fillRect(bar, canvas.height - barHeight, barWidth, barHeight);
              bar += barWidth + 1;
            }
          }
          renderFrame();
    }



     //constructing the player element
     createPlayerElements() {
        this.audioElem = document.createElement('audio');
        const playListElem = document.createElement('div');
        playListElem.classList.add('playlist');
        this.visualiserElem = document.createElement("canvas");
        this.playerElem.appendChild(this.audioElem);
        this.playerElem.appendChild(playListElem);
        this.playerElem.appendChild(this.visualiserElem);
        this.createPlayListElements(playListElem);
    }

    //constructing the playlist element for the player, adding audio into the playlist
    createPlayListElements(playListElem){   
        this.audio.forEach(audio => {
            const audioItem = document.createElement('a');
            audioItem.href = audio.url;
            audioItem.innerHTML = `<i class="fa fa-play"></i>${audio.name}`;
            this.setupEventListener(audioItem);
            playListElem.appendChild(audioItem);
        }); 
    }


    // Control logic for the audio player
    setupEventListener(audioItem){
        audioItem.addEventListener("click",(e)=>{
            e.preventDefault();

            if (!this.audioContext){
                this.createVisualiser();
            }

            // if the current playing audio is the same as the audio being chosen (clicked on)
            const isCurrentAudio = audioItem.getAttribute("href") === (this.currentAudio && this.currentAudio.getAttribute("href"));
            
            //if the chosen audio is the current audio and it's not paused, pause it
            if (isCurrentAudio && !this.audioElem.paused){
                this.setPlayIcon(this.currentAudio);
                this.audioElem.pause();
            } else if (isCurrentAudio && this.audioElem.paused){
                //if the chosen audio is the current audio and it's paused, play it
                this.setPauseIcon(this.currentAudio);
                this.audioElem.play();
            } else{
                if (this.currentAudio){
                    this.setPlayIcon(this.currentAudio);
                }
                //if the chosen audio is the not current audio, play the chosen audio

                this.currentAudio = audioItem;
                this.setPauseIcon(this.currentAudio);
                this.audioElem.src = this.currentAudio.getAttribute("href");
                this.audioElem.play();
            }
        });
    }

    //set the icon to play
    setPlayIcon(elem){
        elem.classList.remove("current");
        const icon = elem.querySelector("i");
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }

    //set the icon to pause
    setPauseIcon(elem){
        elem.classList.add("current");
        const icon = elem.querySelector("i");
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    }
}