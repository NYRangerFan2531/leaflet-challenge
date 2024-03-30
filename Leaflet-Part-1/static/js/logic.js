// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


function getColor(depth) {
    if (depth > 140) {return '#630200'}
    else if (depth > 100) {return '#FF0000'}
    else if (depth > 75) {return '#FF8C00'}
    else if (depth > 50) {return '#FFD700'}
    else if (depth > 25) {return '#FFFF00'}
    else if (depth > 10) {return '#ADFF2F'}
    else if (depth > 5) {return '#98FB98'}
    else if (depth > 1) {return '#AFEEEE'}
    else {return '#87CEFA'}
}

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log(data);
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
  createFeatures(data.features);

});

// 2.
function createFeatures(earthquakeData) {
  
  function pointToLayer(geoJSONPoint, latlng) {
    
    // Use Point to Layer to Customize the circle marker

        return L.circle(latlng,{
            radius: 15000 * geoJSONPoint.properties.mag,
            fillOpacity: 0.3,
            fillColor: getColor(latlng.alt),
            stroke: true,
            weight: 1, 
            color: 'black'
            }
        );
  }

  function onEachFeature(feature, layer) {
    // Adding Pop up to each feature

    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${Date(feature.properties.time)}</p>
    <p><b>Magnitude:</b> ${feature.properties.mag} Richter Scale</p><p><b>Depth:</b> ${feature.geometry.coordinates[2]} km</p>`)

    //console.log(feature.geometry.coordinates[0])
    var latlng = L.latLng(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);

    L.circleMarker(latlng)
  }

  // Create the object for the Geo JSON data with pointToLayer and onEachFeature
  let earthquake = L.geoJSON(earthquakeData,{
    pointToLayer: pointToLayer, 
    onEachFeature: onEachFeature
  });

  //Call create Map to add the features
  createMap(earthquake);

}

// 3.
// createMap() takes the earthquake data and incorporates it into the visualization:

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlays object.
  let overlayMaps = {
    "Earthquakes": earthquakes
  }; 

  // Create a new map.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [topo, earthquakes]
  });

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let labels = [];


    // Add the legend
    let legendInfo = "<h1><b>Eathquake Depth:</b></h1>" ;
    
    div.innerHTML = legendInfo;

    bin_limits = [140, 100, 75, 50, 25, 10, 5 , 1]

    bin_limits.forEach(function(limit, index) {

        // Left side of the legend: Box with Color 
        baselegend = "<tr><td style='width:50px'> <li style=\"color:"+ getColor(limit) +";background-color: " + getColor(limit) + "\"></li></td>"
        
        // Right side of the legend: With limits of each color
        if (index == 0) {textlegend = "Greater " + bin_limits[index]}
        else if (index == (bin_limits.length-1)) {textlegend = "Less than " + bin_limits[bin_limits.length -1]}
        else {textlegend = "Between " + bin_limits[index]+ " and " + bin_limits[index+1]}
        
        // Push the combined legend
        labels.push(baselegend + " <td>" + textlegend + " meters </td><tr>")

      });

      div.innerHTML += "<table><tbody>" + labels.join("") + "</tbody></table>";

    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);

  // Create a layer control that contains our baseMaps.
  // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
