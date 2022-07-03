const {ipcRenderer} = require('electron')

    let strt = document.getElementById("start")
    strt.onclick(()=>{
        console.log('cick!')
        let url= document.getElementById("url-input").value
        ipcRenderer.send('adUrl', url);
    })