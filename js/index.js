let json = localStorage.getItem("mapa");
let headerContainer = "";
let tableBody = document.createElement("tbody");
let tableHead = document.createElement("thead");
json = JSON.parse(json);
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