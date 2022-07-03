const {ipcRenderer} = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  


    const btn = document.getElementById("start")
    btn.addEventListener("click",()=>{
        console.log('cick!')
        let temp = getAllUrls()
        console.log(temp)
        ipcRenderer.send('adUrls', [...temp]);
    })



    function getAllUrls(){
        let allUrls = document.querySelectorAll('#url-input')
        let temp = Array.from(allUrls)
        let list=[]
        temp.forEach((item)=>{
            list.push(item.value)
        })

        return list;
    }



  })
  