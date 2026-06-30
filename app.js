const http = require("http");
const fs = require("fs");
const url = require("url");
const request = require("request");

const apiKey = process.env.API_KEY;

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);

    const pathname = parsedUrl.pathname;

    const city = parsedUrl.query.city;

    // ==================== Home ====================

    if (pathname === "/") {

        fs.readFile("./pages/index.html", "utf8", (err, data) => {

            if (err) {

                res.writeHead(500);

                res.end("Internal Server Error");

                return;

            }

            res.writeHead(200, {
                "Content-Type": "text/html; charset=UTF-8"
            });

            res.end(data);

        });

    }

    // ==================== CSS ====================

    else if (pathname === "/style.css") {

        fs.readFile("./public/style.css", (err, data) => {

            res.writeHead(200, {
                "Content-Type": "text/css"
            });

            res.end(data);

        });

    }

    // ==================== Images ====================

    else if (pathname.startsWith("/images/")) {

        fs.readFile("./public" + pathname, (err, data) => {

            if (err) {

                res.writeHead(404);

                res.end("Image Not Found");

                return;

            }

            let type = "image/png";

            if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {

                type = "image/jpeg";

            }

            res.writeHead(200, {
                "Content-Type": type
            });

            res.end(data);

        });

    }

    // ==================== Weather ====================

    else if (pathname === "/weather") {

        if (!city) {

            res.end("<h1>Please Enter City Name</h1>");

            return;

        }

        const weatherURL =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        request(weatherURL, (error, response, body) => {

            if (error) {

                res.end("Connection Error");

                return;

            }

            const weatherData = JSON.parse(body);

            if (weatherData.cod != 200) {

                res.end("<h1>City Not Found</h1>");

                return;

            }

            // ==================== Weather Icon ====================

            let icon = "sun.png";

            switch (weatherData.weather[0].main) {

                case "Clear":
                    icon = "sun.png";
                    break;

                case "Clouds":
                    icon = "partly-cloudy-night.png";
                    break;

                case "Rain":
                    icon = "rainwater-catchment.png";
                    break;

                case "Snow":
                    icon = "snow.png";
                    break;

                case "Wind":
                    icon = "wind.png";
                    break;

                default:
                    icon = "sun.png";

            }

            res.writeHead(200, {

                "Content-Type": "text/html; charset=UTF-8"

            });

                res.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Weather App</title>

<link rel="stylesheet" href="/style.css">

<link rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

</head>

<body>

<div class="container">

<h1><i class="fa-solid fa-cloud-sun"></i> Weather App</h1>

<img class="weatherIcon" src="/images/${icon}" alt="Weather">

<h2 class="city">${weatherData.name}</h2>

<div class="card">

<i class="fa-solid fa-temperature-half"></i>

<span>Temperature</span>

<strong>${weatherData.main.temp} °C</strong>

</div>

<div class="card">

<i class="fa-solid fa-face-smile"></i>

<span>Feels Like</span>

<strong>${weatherData.main.feels_like} °C</strong>

</div>

<div class="card">

<i class="fa-solid fa-droplet"></i>

<span>Humidity</span>

<strong>${weatherData.main.humidity}%</strong>

</div>

<div class="card">

<i class="fa-solid fa-wind"></i>

<span>Wind Speed</span>

<strong>${weatherData.wind.speed} m/s</strong>

</div>

<div class="card">

<i class="fa-solid fa-cloud"></i>

<span>Weather</span>

<strong>${weatherData.weather[0].description}</strong>

</div>

<div class="card">

<i class="fa-solid fa-location-dot"></i>

<span>Latitude</span>

<strong>${weatherData.coord.lat}</strong>

</div>

<div class="card">

<i class="fa-solid fa-earth-africa"></i>

<span>Longitude</span>

<strong>${weatherData.coord.lon}</strong>

</div>

<a class="btn" href="/">Search Again</a>

</div>

</body>

</html>

`);

            res.end();

        });

    }

    // ==================== 404 ====================

    else {

        fs.readFile("./pages/404.html", "utf8", (err, data) => {

            res.writeHead(404, {

                "Content-Type": "text/html; charset=UTF-8"

            });

            res.end(data);

        });

    }

});

server.listen(4000, () => {

    console.log("Server Running...");

});