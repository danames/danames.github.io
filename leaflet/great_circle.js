// Initialize the map
var map = L.map('map').setView([39.0, -45.0], 3); // Centered on Utah

// Add a tile layer (base map) from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to create a city icon
function createCityIcon() {
    return L.divIcon({
        className: 'city-icon',
        iconSize: [32, 32]
    });
}

//Function to compute the distance between two points using the Haversine formula
function compute_distance(lat1,lng1,lat2,lng2){
    //convert inputs to radians
    const rad_lat1 = lat1 * Math.PI/180;
    const rad_lng1 = lng1 * Math.PI/180;
    const rad_lat2 = lat2 * Math.PI/180;
    const rad_lng2 = lng2 * Math.PI/180;
    
    //Differences in coordinates
    const dLat = rad_lat2 - rad_lat1;
    const dLon = rad_lng2 - rad_lng1;
    
    //Earth's radius in km (estimated)
    const R = 6371; 
    
    //Haversine formula                                      
    const a = (Math.sin(dLat/2))**2 + Math.cos(rad_lat1) * Math.cos(rad_lat2) * (Math.sin((dLon)/2))**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    //a = sin²(Δφ/2) + cos(φ₁) * cos(φ₂) * sin²(Δλ/2)
    //c = 2 * atan2(√a, √(1-a))
    //d = R * c
                            
    //Write the resulting distance
    document.getElementById("results").innerHTML = "Distance = " + distance + " km";
}       


 // Function to draw a great circle line connecting the two points
function great_circle(lat1, lng1, lat2, lng2) {
    // Convert inputs to radians
    const rad_lat1 = lat1 * Math.PI / 180;
    const rad_lng1 = lng1 * Math.PI / 180;
    const rad_lat2 = lat2 * Math.PI / 180;
    const rad_lng2 = lng2 * Math.PI / 180;

    // Calculate the angular distance (δ) between the two points using the Haversine formula
    const dLon = rad_lng2 - rad_lng1;
    const dLat = rad_lat2 - rad_lat1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad_lat1) * Math.cos(rad_lat2) * Math.sin(dLon / 2) ** 2;
    const angular_distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // This is 'c' in your equations

    // Divide the angular distance into 10 segments
    const num_segments = 100; // Increased for smoother line
    const segment_angle = angular_distance / num_segments;

    // Generate points along the great circle
    const points = [];
    for (let i = 0; i <= num_segments; i++) {
        const f = i / num_segments;

        // Calculate intermediate latitude (φ) and longitude (λ)
        const A = Math.sin((1 - f) * angular_distance) / Math.sin(angular_distance);
        const B = Math.sin(f * angular_distance) / Math.sin(angular_distance);
        const x = A * Math.cos(rad_lat1) * Math.cos(rad_lng1) + B * Math.cos(rad_lat2) * Math.cos(rad_lng2);
        const y = A * Math.cos(rad_lat1) * Math.sin(rad_lng1) + B * Math.cos(rad_lat2) * Math.sin(rad_lng2);
        const z = A * Math.sin(rad_lat1) + B * Math.sin(rad_lat2);
        const new_lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
        const new_lng = Math.atan2(y, x);

        points.push([new_lat * 180 / Math.PI, new_lng * 180 / Math.PI]);
    }

    // Draw the great circle line
    const polyline = L.polyline(points, { color: 'red' }).addTo(map);
}


// Add marker on form submission
document.getElementById('submit-button').addEventListener('click', function() {
    var start_lat = parseFloat(document.getElementById('start_latitude').value);
    var start_lng = parseFloat(document.getElementById('start_longitude').value);
    var end_lat = parseFloat(document.getElementById('end_latitude').value);
    var end_lng = parseFloat(document.getElementById('end_longitude').value);

    if (!isNaN(start_lat) && !isNaN(start_lng) && !isNaN(end_lat) && !isNaN(end_lng)) {
        var startMarker = L.marker([start_lat, start_lng], {
            icon: createCityIcon() // Use city icon
        }).addTo(map);
        startMarker.bindPopup("Start Point<br>[" + start_lat + ", " + start_lng + "]");

        var endMarker = L.marker([end_lat, end_lng], {
            icon: createCityIcon() // Use city icon
        }).addTo(map);
        endMarker.bindPopup("End Point<br>[" + end_lat + ", " + end_lng + "]");

        //compute the distance between the two points                       
        compute_distance(start_lat,start_lng,end_lat,end_lng);
        great_circle(start_lat,start_lng,end_lat,end_lng);

    } else {
        alert('Please enter valid coordinates.');
    }
});
