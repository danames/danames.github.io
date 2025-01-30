var map;
var countryLayers = {};  // Object to store country layers

function init() {
    // Initialize the map and set the global view
    map = L.map("map_id").setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load KML files into countryLayers object
    let countries = ["australia", "bahrain", "canada", "cayman", "czechia", "england", 
                     "france", "germany", "japan", "mexico", "spain", "switzerland", 
                     "thailand", "thenetherlands", "usa", "vietnam"];
    
    countries.forEach(country => {
        countryLayers[country] = omnivore.kml(`kml/${country}.kml`).on('ready', function() {
            this.setStyle({color: "blue"});  // Optional: Set country boundary color
        });
    });

    // Reset view to the world
    setCountry("none");
}

function setCountry(theCountry) {
    console.log("Selected:", theCountry);

    // Remove all layers before adding a new one
    Object.values(countryLayers).forEach(layer => map.removeLayer(layer));

    if (theCountry !== "none") {
        let selectedLayer = countryLayers[theCountry];
        if (selectedLayer) {
            map.addLayer(selectedLayer);
            map.fitBounds(selectedLayer.getBounds());
            document.getElementById("viewing").innerText = fullName(theCountry);
            document.getElementById("ifInfo").src = "https://en.wikipedia.org/wiki/" + fullName(theCountry);
        }
    } else {
        map.setView([20, 0], 2);
        document.getElementById("viewing").innerText = "Earth";
        document.getElementById("ifInfo").src = "https://en.wikipedia.org/wiki/Earth";
    }
}

function fullName(country) {
    const names = {
        "england": "United Kingdom",
        "usa": "United States of America",
        "thenetherlands": "The Netherlands",
        "cayman": "Cayman Islands"
    };
    return names[country] || country.charAt(0).toUpperCase() + country.slice(1);
}
