
var json = "";
if(localStorage.getItem("mapa") == undefined ) reLoad();
document.getElementById("recargar").addEventListener("click", reLoad );
if(localStorage.getItem("time") != undefined) {
    $("#lastUpdated").text(new Date(localStorage.getItem("time") * 1000).toString().split("GMT")[0] + " ");
}

var interval = setInterval(() => {
    if(localStorage.getItem("mapa") != undefined){
        json = localStorage.getItem("mapa");
        json = JSON.parse(json);
        clearInterval(interval);

        fillBody(json);
    }
}, 300);;

function reLoad() {
    console.log(parseInt(new Date().getTime()) - parseInt(localStorage.getItem("time")));
    if(localStorage.getItem("time") == undefined || parseInt(new Date().getTime()) - parseInt(localStorage.getItem("time"))  > 600000) {
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
            localStorage.setItem("time", new Date().getTime());
            $("#lastUpdated").text(new Date().toString());
        });
    }
};

function fillBody(json){
    let headerContainer = "";
    let tableBody = document.createElement("tbody");
    let tableHead = document.createElement("thead");
    let arrayObj = [];
    for(let i = 0; i < json.length; i++){
    
        if(i == 0){
           headerContainer = document.createElement("th");
        }
    
        let bodyContainer = document.createElement("tr");
        let newArray = [];
        let header1 = "";
        let data1 = "";
        Object.keys(json[i]).forEach(function(key) {
            if(key != "downloadspeed" && key != "uploadspeed" && key != "timestamp_" && key != "activitat" && key != "desc_"){
                if(i == 0){
                    let headerText = document.createElement("td");
                    headerText.innerText = key;
                    headerContainer.appendChild(headerText);
                    
                }
                
                if(key == "operador"){
                    header1 = json[i][key].toLowerCase();
                }

                if(key == "senyal") {
                    data1 = json[i][key]
                }

                let bodyText = document.createElement("td");
                bodyText.innerText = json[i][key];
                bodyContainer.append(bodyText);
                //console.log('Key : ' + key + ', Value : ' + json[i][key])
            }
        })

        newArray = [header1, data1];
        let bool = false;
        arrayObj.forEach(element => {
            if(element[0] == header1) {
                element[1] = parseInt(element[1]) + parseInt(data1);
                bool = true;
            }
        });

        if(!bool)arrayObj.push(newArray);
        if(i == 0){
            tableHead.appendChild(headerContainer);
            $("#tableContent").append(tableHead);
            $("#tableContent").append(tableBody);
        }
        tableBody.append(bodyContainer);
    }

    console.log(arrayObj);
    
    $("#tableContent").append(tableBody);
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(function() {
        drawChart(arrayObj);
    });
}

/* google chart */



// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(rows) {

// Create the data table.
var data = new google.visualization.DataTable();
data.addColumn('string', 'Operador');
data.addColumn('number', 'Senyal');
data.addRows(rows);

// Set chart options
var options = {'title':'Intensidad de la señal por redes',
                'width':400,
                'height':300};

// Instantiate and draw our chart, passing in some options.
var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
chart.draw(data, options);
}