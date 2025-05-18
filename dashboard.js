const supabaseUrl = 'https://vofiewmbwkluokbyrxva.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZmlld21id2tsdW9rYnlyeHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDU5NTcsImV4cCI6MjA2MzEyMTk1N30.0ceYHnY2PptXFfpDXPtSRF35liuv693JI7wwnVmagUU';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const apiToken = "857a92ef2ec3d9aa67ec34abaafbf47342bd6eb2"; 
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const resultsDiv = document.getElementById("results");
const ctx = document.getElementById("aqiChart").getContext("2d");
const citySelect = document.getElementById("citySelect");
let aqiChart;

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name.");

  const apiUrl = `https://api.waqi.info/feed/${city}/?token=${apiToken}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "ok") {
      resultsDiv.innerHTML = `<p>Unable to fetch data for '${city}'.</p>`;
      return;
    }

    const aqi = data.data.aqi;
    const cityName = data.data.city.name;
    const time = new Date().toISOString();

    resultsDiv.innerHTML = `
      <h3>Air Quality in ${cityName}</h3>
      <p><strong>AQI:</strong> ${aqi}</p>
      <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
    `;

    const { error: insertError } = await supabaseClient
      .from('searches')
      .insert([{ city: cityName, aqi, timestamp: time }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }
const { data: history, error: fetchError } = await supabaseClient
  .from('searches')
  .select('*')
  .eq('city', cityName)
  .order('timestamp', { ascending: true });

if (fetchError) {
  console.error('Fetch error:', fetchError);
  return;
}
const recentHistory = history.slice(-10);
const aqiData = recentHistory.map(entry => entry.aqi);
const timeLabels = recentHistory.map(entry =>
  new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
);
    renderChart(aqiData, timeLabels);
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>Error fetching data. Try again later.</p>`;
  }
});

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name.");

  const apiUrl = `https://api.waqi.info/feed/${city}/?token=${apiToken}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "ok") {
      resultsDiv.innerHTML = `<p>Unable to fetch data for '${city}'.</p>`;
      return;
    }

    const aqi = data.data.aqi;
    const cityName = data.data.city.name;
    const time = data.data.time.s;

    resultsDiv.innerHTML = `
      <h3>Air Quality in ${cityName}</h3>
      <p><strong>AQI:</strong> ${aqi}</p>
      <p><strong>Time:</strong> ${time}</p>
    `;
if (![...citySelect.options].some(opt => opt.value === cityName)) {
  const option = document.createElement("option");
  option.value = cityName;
  option.textContent = cityName;
  citySelect.appendChild(option);
}
    renderChart([aqi], [time]);
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>Error fetching data. Try again later.</p>`;
  }
});
citySelect.addEventListener("change", async () => {
  const cityName = citySelect.value;
  if (!cityName) return;

  resultsDiv.innerHTML = `<p>Loading ${cityName} data...</p>`;

  const { data: history, error } = await supabaseClient
    .from('searches')
    .select('*')
    .eq('city', cityName)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching city data:', error);
    return;
  }

  const recentHistory = history.slice(-10);
  const aqiData = recentHistory.map(entry => entry.aqi);
  const timeLabels = recentHistory.map(entry =>
    new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  resultsDiv.innerHTML = `<h3>${cityName} (last 10 entries)</h3>`;
  renderChart(aqiData, timeLabels);
});
function renderChart(aqiData, timeLabels) {
  if (aqiChart) aqiChart.destroy();

  aqiChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [{
        label: 'AQI',
        data: aqiData,
        borderColor: '#1e90ff',
        backgroundColor: 'rgba(30, 144, 255, 0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 300
        }
      }
    }
  });
}