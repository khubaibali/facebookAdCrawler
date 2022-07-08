const {ipcRenderer} = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  


    const btn = document.getElementById("start")
    btn.addEventListener("click",()=>{
       let temp = getAdsSettings()
        ipcRenderer.send('settings', [...temp]);
    })



    function getAdsSettings(){
        let settings = document.querySelectorAll('#event')
        let temp = Array.from(settings)
        console.log(">>",temp)
        let list=[]
         temp.forEach((item)=>{
            let obj ={}
            let =nodes =Array.from(item.children)
            let url= nodes[1].children[1].value
            let counter = nodes[2].children[1].value
            let closeAfter = nodes[3].children[1].value
            obj.url = url
            obj.counter = counter
            obj.closeAfter = closeAfter
            list.push(obj)
         })

         return list;
    }



  })
  