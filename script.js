console.log('We are in javascript')
let currentsong = new Audio()
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)  
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all songs in playlists
    let songUL = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ''
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img src="img/music.svg" alt="">
            <div class="songlist">
                <div>${song.replaceAll("%20", ' ')} </div>
            </div>
            <div class="playnow">
                <div>Play Now</div>
                <img src="img/play.svg" alt="">
            </div>
        
         </li>`;
    }

    //play and pause music
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".songlist").firstElementChild.innerHTML.trim())
        })
    })
    
}

//musix update
const playMusic = (track, pause=false) =>{
    currentsong.src = `/${currFolder}/`+track
    if(!pause){
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".time").innerHTML = "00:00 / 00:00"

}

//soconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbum(){
    let a = await fetch('/songs/')  
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cards = document.querySelector(".cards")
    let array = Array.from(anchors)
    console.log(cards)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")){
            let folder = e.href.split('/').slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cards.innerHTML = cards.innerHTML + `<div data-folder="${folder}" class="card radius-1">
            <img src="/songs/${folder}/cover.jpg" alt="">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="none">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <h2>${response.title}</h2>
            <p>${response.discription}</p>
        </div>`
        }
    }
}


//music list
async function main() {
    await getSongs('songs/All')
    playMusic(songs[0], true)

    await displayAlbum()

    //play, pause change
    play.addEventListener("click", ()=>{
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        } else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //seekbar time update
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration) * 100 + '%';
    })
    
    //Update time by user through seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left =  percent + '%';
        currentsong.currentTime = ((currentsong.duration)*percent)/100
    })

    //previous song
    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    //next song
    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    //volume up and down
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentsong.volume = parseInt(e.target.value)/100
    })

    //song through library
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })

    document.querySelector('.songvolume').addEventListener("click",e=>{
        console.log(e.target.src)
        console.log(e.target)
        if(e.target.src.includes('volume.svg')){
            e.target.src = e.target.src.replace('volume.svg','mute.svg')
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace('mute.svg','volume.svg')
            currentsong.volume = 0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10; 
        }
    })

}

main()