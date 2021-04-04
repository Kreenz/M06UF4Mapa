


/* mapa */

document.getElementById("mostrarMapa").addEventListener("click", () => {
    changeState("mapa");
})

document.getElementById("mostrarGrafica").addEventListener("click", () => {
    changeState("grafica");
})

var mymap = L.map('mapid').setView([41.390205, 2.154007], 11);
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

let items = document.getElementsByClassName("item-list");
for(let i = 0; i < items.length; i++){
    items[i].addEventListener("click", () => {
        closeElements(items[i]);
    })
}

function closeElements(item){
    let items = document.getElementsByClassName("item-list");
    for(let i = 0; i < items.length; i++){
        if(items[i] != item) items[i].removeAttribute("open");
    }
}

function changeState(id){
    if(document.getElementById(id) != undefined){
        let text = "";
        if(document.getElementById(id).style.display == "flex")text = "none"; 
        else text = "flex";
        document.getElementById(id).style.display = text;
    }
}

function reLoad() {
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
    let arraySpeed = [];
    let arraySenal = [];
    for(let i = 0; i < json.length; i++){
    
        if(i == 0){
           headerContainer = document.createElement("th");
        }
    
        let bodyContainer = document.createElement("tr");
        let newArraySpeed = [];
        let newArraySenal = [];
        let newArray = [];
        let header1 = "";
        let data1 = "";
        let data2 = "";
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
                if(key == "xarxa")header1 = json[i][key].toLowerCase();
                if(key == "senyal")data1 = json[i][key];
                if(key == "speed")data2 = json[i][key];

                let bodyText = document.createElement("td");
                bodyText.innerText = (json[i][key] != null && json[i][key] != undefined && json[i][key] != "null") ? json[i][key] : "No";
                bodyContainer.append(bodyText);
            }

            if(key == "long_" || key == "lat"){
                if(key == "lat") lat = json[i][key];
                if(key == "long_") long = json[i][key];                
            }
        })

        $("#mapa").css("display", "none");

        var circle = L.circle([lat, long], {
            color: colors[xarxa],
            fillColor: '#f03',
            fillOpacity: 0.1,
            radius: data1 * 20
        }).addTo(mymap);

        circle.bindPopup(xarxa);

        newArray = [header1, data1];
        newArraySpeed = [header1, data2, 1]
        newArraySenal = [header1, data1 , 1];
        let bool = false;
        arrayObj.forEach(element => {
            if(element[0] == header1) {
                element[1] = parseInt(element[1]) + parseInt(data1);
                bool = true;
            }
        });

        if(!bool) {
            arraySpeed.push(newArraySpeed);
            arraySenal.push(newArraySenal);
            arrayObj.push(newArray);
        }

        if(i == 0){
            tableHead.appendChild(headerContainer);
            $("#tableContent").append(tableHead);
            $("#tableContent").append(tableBody);

        }
        tableBody.append(bodyContainer);
    }

    console.log(arrayObj);
    resetMapProveedor(arrayObj);
    $("#tableContent").append(tableBody);
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(function() {
        drawChart(arrayObj);
    });
}

function resetMapProveedor(arrayObj){
    $("#proveedor").html("");
    let all = document.createElement("option");
    all.value = "Todos";
    all.innerText = "Todos";
    $("#proveedor").append(all);

    arrayObj.forEach(element => {
        let opt = document.createElement("option");
        opt.value = element[0];
        opt.innerText = element[0];
        console.log(element)
        $("#proveedor").append(opt);
    })
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

$("#proveedor").change(function(x) {
    mymap.eachLayer((layer) => {
        if(!layer._map) {
            console.log(layer);
            layer.remove();
        }  
    });

    filterProvider(x.target.value);
})

function filterProvider(provider){
    for(let i = 0; i < json.length; i++){
        let xarxa = "";
        let senyal = 0;
        let lat = 0;
        let long = 0;
        Object.keys(json[i]).forEach(function(key){
            if(key == "xarxa" && (json[i][key] == provider || provider == "Todos")) xarxa = json[i][key];
            if(key == "senyal") senyal = json[i][key];
            if(key == "lat") lat = json[i][key];
            if(key == "long_") long = json[i][key];
        });

        if(xarxa == provider || provider == "Todos"){
            var circle = L.circle([lat, long], {
                color: colors[xarxa],
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: senyal * 20
            }).addTo(mymap);
    
            circle.bindPopup(xarxa);
        }        
    }
}