
var json = "";
if(localStorage.getItem("mapa") == undefined ) reLoad();

var interval = setInterval(() => {
    if(localStorage.getItem("mapa") != undefined){
        json = localStorage.getItem("mapa");
        json = JSON.parse(json);
        clearInterval(interval);

        fillBody(json);
    }
}, 300);;

function reLoad() {
    $.ajax({
        url: "https://analisi.transparenciacatalunya.cat/resource/g9ma-vbt8.json",
        type: "GET",
        data: {
        "$limit" : 1000,
        "$$app_token" : "OTx45OGMJSTS2jNTW5cphbI7T"
        }
    }).done(function(data) {
        let json = data;
        localStorage.setItem("mapa", JSON.stringify(json));
    });
};

function fillBody(json){
    let headerContainer = "";
    let tableBody = document.createElement("tbody");
    let tableHead = document.createElement("thead");
    for(let i = 0; i < json.length; i++){
    
        if(i == 0){
           headerContainer = document.createElement("th");
        }
    
        let bodyContainer = document.createElement("tr");
        Object.keys(json[i]).forEach(function(key) {
            if(key != "downloadspeed" && key != "uploadspeed" && key != "timestamp_" && key != "activitat" && key != "desc_"){
                if(i == 0){
                    let headerText = document.createElement("td");
                    headerText.innerText = key;
                    headerContainer.appendChild(headerText);
                    
                }
        
                let bodyText = document.createElement("td");
                bodyText.innerText = json[i][key];
                bodyContainer.append(bodyText);
                //console.log('Key : ' + key + ', Value : ' + json[i][key])
            }
        })
        if(i == 0){
            tableHead.appendChild(headerContainer);
            $("#tableContent").append(tableHead);
            $("#tableContent").append(tableBody);
        }
        tableBody.append(bodyContainer);
    }
    
    $("#tableContent").append(tableBody);
}