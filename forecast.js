function updateTemperatureUnit() {
  const unit = document.querySelector('input[name="unit"]:checked').value;
  const temperatureElements = document.querySelectorAll(".temperature");
  temperatureElements.forEach((element) => {
    const temperature = element.getAttribute("data-temperature");
    if (unit === "celsius") {
      element.textContent = temperature + "°C";
    } else {
      element.textContent = celsiusToFahrenheit(temperature) + "°F";
    }
  });
}

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

window.onload = function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location");

  if (location) {
    fetchWeather(location);
  }
};

function fetchWeather(location) {
  const apiKey = "0ca46f0020d8490383682947241704";
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5&aqi=yes&alerts=yes`;

  document.getElementById("weather-info").innerHTML =
    '<div class="loading">Loading...</div>';

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      let weatherInfo =
        `<h2>${data.location.name}, ${data.location.region}, ${data.location.country}</h2>` +
        "";
      data.forecast.forecastday.forEach((day, index) => {
        weatherInfo += `<h3>Date: <span>${day.date}</span></h3>`;
        weatherInfo += `<p>Max Temperature: <span class="temperature" data-temperature="${day.day.maxtemp_c}">${day.day.maxtemp_c}°C</span></p>`;
        weatherInfo += `<p>Min Temperature: <span class="temperature" data-temperature="${day.day.mintemp_c}">${day.day.mintemp_c}°C</span></p>`;
        weatherInfo += `<p>Condition: ${day.day.condition.text}</p>`;
        weatherInfo += `<p>Chance of Rain: ${day.day.daily_chance_of_rain}%</p>`;
        weatherInfo += `<p>Humidity: ${day.day.avghumidity}%</p>`;
        weatherInfo += `<p>UV Index: ${day.day.uv}</p>`;

        weatherInfo += `<div class="hourly-weather"><button onclick="showHourlyWeather('${day.date}', '${location}', ${index})">Show Hourly Weather</button><div id="hourly-${index}" style="display:none;"></div></div>`;
        weatherInfo += `<hr>`;
      });
      document.getElementById("weather-info").innerHTML = weatherInfo;
      updateTemperatureUnit();
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      document.getElementById("weather-info").innerHTML =
        "Failed to fetch weather data";
    });
}

async function showHourlyWeather(date, location, index) {
  const apiKey = "0ca46f0020d8490383682947241704";
  const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&dt=${date}&hour=0-23`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        "Network response was not ok. Status: " + response.status
      );
    }
    const data = await response.json();
    //   console.log("API Response:", data);

    let hourlyWeatherInfo = "<h4>Hourly Weather</h4>";
    if (
      data.forecast &&
      data.forecast.forecastday &&
      data.forecast.forecastday[0] &&
      data.forecast.forecastday[0].hour
    ) {
      data.forecast.forecastday[0].hour.forEach((hour) => {
        hourlyWeatherInfo += `<p>${hour.time}:00 - Temperature: ${hour.temp_c}°C, Condition: ${hour.condition.text}</p>`;
      });
      document.getElementById(`hourly-${index}`).innerHTML = hourlyWeatherInfo;
      document.getElementById(`hourly-${index}`).style.display = "block";
    } else {
      document.getElementById(`hourly-${index}`).innerHTML =
        "No hourly weather data available";
      document.getElementById(`hourly-${index}`).style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching hourly weather data:", error);
    document.getElementById(`hourly-${index}`).innerHTML =
      "Failed to fetch hourly weather data";
    document.getElementById(`hourly-${index}`).style.display = "block";
  }
}
