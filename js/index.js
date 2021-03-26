
/* mapa */

var mymap = L.map('mapid').setView([42.00660326596931, 1.616016699655453], 8);
var colors = {
    'yoigo':"blue",
    'orange': 'red',
    'movistar': 'orange',
    'vodafone': 'green',
    'jazztel': 'purple',
    'at&t': 'lightblue',
    'simyo 3g': 'pink'
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZm9ybm9zY3VuaW9yaW9sIiwiYSI6ImNrbW5tbnEwbTF3NzAyd2s1Nmxyd2hiZDAifQ.FRjUAR5Ts34nkhVo5v0Iiw'
}).addTo(mymap);

var json = "";
if(localStorage.getItem("mapa") == undefined ) reLoad();
document.getElementById("recargar").addEventListener("click", reLoad );
if(localStorage.getItem("time") != undefined) {
    $("#lastUpdated").text(new Date(localStorage.getItem("time") * 1000).toString().split("GMT")[0] + " ");
}

if(localStorage.getItem("mapa") != undefined){
    json = localStorage.getItem("mapa");
    json = JSON.parse(json);

    fillBody(json);
}


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
            fillBody(json);
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
        let xarxa = "";
        let lat = 0;
        let long = 0;

        Object.keys(json[i]).forEach(function(key) {
            if(key != "lat" && key != "long_" && key != "date" && key != "hora_" && key != "timestamp_" && key != "activitat" && key != "desc_" && key != "operador" && key != "status" && key != "satellites"){
                if(i == 0){
                    let headerText = document.createElement("td");
                    headerText.innerText = key;
                    headerContainer.appendChild(headerText);
                }
                
                if(key == "xarxa") xarxa = json[i][key];
                if(key == "lat") lat = json[i][key];
                if(key == "long_") long = json[i][key];

                if(key == "xarxa")header1 = json[i][key].toLowerCase();
                if(key == "senyal")data1 = json[i][key];

                let bodyText = document.createElement("td");
                bodyText.innerText = (json[i][key] != null && json[i][key] != undefined && json[i][key] != "null") ? json[i][key] : "No";
                bodyContainer.append(bodyText);
            }
        })

        var circle = L.circle([lat, long], {
            color: colors[xarxa],
            fillColor: '#f03',
            fillOpacity: 0.1,
            radius: data1 * 20
        }).addTo(mymap);

        circle.bindPopup(xarxa);

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

