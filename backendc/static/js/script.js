document.getElementById('building-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Mencegah pengiriman form secara default

    // Mengambil data dari input form
    const buildingType = document.getElementById('building_type').value;
    const totalHeight = document.getElementById('total_height').value;
    const totalLength = document.getElementById('total_length').value;
    const totalWidth = document.getElementById('total_width').value;

    // Kirim data menggunakan fetch ke endpoint backend (Django)
    fetch('/api/calculate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            building_type: buildingType,
            total_height: totalHeight,
            total_length: totalLength,
            total_width: totalWidth
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('results').innerHTML = `
            <h3>Hasil Perhitungan:</h3>
            <p>Radius Perlindungan: ${data.protection_radius} meter</p>
            <p>Jumlah Rod Petir: ${data.number_of_rods}</p>
            <p>Rekomendasi: ${data.recommendations.join(', ')}</p>
        `;
    })
    .catch(error => console.error('Error:', error));
});
