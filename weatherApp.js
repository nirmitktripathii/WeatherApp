// weatherApp.js
import apiKey from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("weatherForm");
  const locationInput = document.getElementById("location");
  const aqiInput = document.getElementById("aqiChoice");
  const weatherInfoContainer = document.getElementById("weatherInfo");
  const weatherTable = document.getElementById("weatherTable");
  const aqiTable = document.getElementById("aqiTable");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const cityName = locationInput.value.trim();
    const aqi = aqiInput.value;

    if (cityName) {
      getWeatherData(cityName, aqi);
    } else {
      alert("Please enter a valid location.");
    }
  });

  function getWeatherData(cityName, aqi) {
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}&aqi=${aqi}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const weatherInfo = processData(data, aqi);
        displayWeatherInfo(weatherInfo, aqi);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function processData(data, aqi) {
    const current = data.current;
    const temperature = current.temp_c;
    const humidity = current.humidity;
    const windSpeed = current.wind_kph;
    const cloudCover = current.cloud;
    const rainfallProbability = calculateRainfallProbability(
      temperature,
      humidity,
      windSpeed,
      cloudCover
    );

    const Info = {
      location: data.location.name,
      region: data.location.region,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
      time: data.location.localtime,
      temp_c: temperature,
      humidity: humidity,
      wind_kph: windSpeed,
      cloud: cloudCover,
      rain_prob: rainfallProbability,
    };

    let aqiInfo = null;
    if (aqi === "yes" && current.air_quality) {
      aqiInfo = current.air_quality;
    }
    return {
      Info,
      aqiInfo,
    };
  }

  function calculateRainfallProbability(
    temperature,
    humidity,
    windSpeed,
    cloudCover
  ) {
    return humidity > 70 &&
      temperature < 20 &&
      windSpeed < 15 &&
      cloudCover > 50
      ? "High"
      : "Low";
  }

  function displayWeatherInfo(weatherInfo, aqi) {
    weatherInfoContainer.innerHTML = "";
    weatherTable.innerHTML = "";
    aqiTable.innerHTML = "";

    // Display basic weather information
    const basicWeatherTable = createTable(weatherInfo.Info, [
      "Location",
      "Region",
      "Country",
      "Latitude",
      "Longitude",
      "Time of Day",
      "Temperature",
      "Humidity",
      "Wind Speed",
      "Cloud Cover",
      "Rainfall Probability",
    ]);
    weatherTable.appendChild(basicWeatherTable);

    if (aqi === "yes" && weatherInfo.aqiInfo) {
      // Display AQI information if AQI choice is 'yes' and data is available
      const aqiTableHeadings = [
        "CO (µg/m³)",
        "NO2 (µg/m³)",
        "O3 (µg/m³)",
        "SO2 (µg/m³)",
        "PM2.5 (µg/m³)",
        "PM10 (µg/m³)",
        "US EPA Index",
        "GB DEFRA Index",
      ];
      const aqiTableValues = Object.values(weatherInfo.aqiInfo);

      const aqiTable = createTable(
        { locationInfo: null, ...weatherInfo.aqiInfo },
        aqiTableHeadings,
        aqiTableValues
      );
      aqiTable.style.display = "block";
      weatherInfoContainer.appendChild(aqiTable);
    }
  }

  function createTable(
    data,
    headings,
    values = [],
    headingMap = {
      "Location": "location",
      "Region": "region",
      "Country": "country",
      "Latitude": "lat",
      "Longitude": "lon",
      "Time of Day": "time",
      "Temperature": "temp_c",
      "Humidity": "humidity",
      "Wind Speed": "wind_kph",
      "Cloud Cover": "cloud",
      "Rainfall Probability": "rain_prob",
      "CO (µg/m³)": "co",
      "NO2 (µg/m³)": "no2",
      "O3 (µg/m³)": "o3",
      "SO2 (µg/m³)": "so2",
      "PM2.5 (µg/m³)": "pm2_5",
      "PM10 (µg/m³)": "pm10",
      "US EPA Index": "us-epa-index",
      "GB DEFRA Index": "gb-defra-index",
    }
  ) {
    const table = document.createElement("table");
    const row = table.insertRow();
    headings.forEach((heading, index) => {
      const cell = row.insertCell(index);

      cell.textContent = heading;
    });

    if (data) {
      const valuesRow = table.insertRow();

      headings.forEach((heading, index) => {
        const cell = valuesRow.insertCell(index);
        const propertyName = headingMap[heading];
        if (heading === "Rainfall Probability") {
          cell.textContent = values;
        }

        if (propertyName in data) {
          const value = data[propertyName];
          cell.textContent =
            value !== undefined && value !== null
              ? value
              : "Data not available";
        } else {
          // For AQI values array, use the provided values array
          cell.textContent =
            values[index] !== undefined && values[index] !== null
              ? values[index]
              : "Data not available";
        }
      });
    } else {
      const cell = table.insertRow().insertCell();
      cell.textContent = "Data not available";
      cell.colSpan = headings.length;
    }

    return table;
  }
});
