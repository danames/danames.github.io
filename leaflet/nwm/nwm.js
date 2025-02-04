document.addEventListener('DOMContentLoaded', () => {
    const reachId = '10373692';
    const seriesType = 'short_range';
    const apiUrl = `/nwps/v1/reaches/${reachId}/streamflow?series_type=${seriesType}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const streamflowData = data.streamflow;

            // Prepare data for Chart.js
            const timestamps = streamflowData.map(item => item.timestamp); // Assuming you have a timestamp property
            const flowValues = streamflowData.map(item => item.value); // Assuming you have a value property

            const ctx = document.getElementById('streamflowChart').getContext('2d');
            new Chart(ctx, {
                type: 'line', // Or 'bar', depending on your preference
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Streamflow Forecast (Short Range)',
                        data: flowValues,
                        borderColor: 'blue',
                        borderWidth: 1,
                        fill: false // Set to true if you want to fill the area under the line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Streamflow'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            // Handle error, e.g., display an error message on the page
            const chartCanvas = document.getElementById('streamflowChart');
            chartCanvas.innerHTML = "<p>Error loading chart</p>";
        });
});
