import axios from "axios";

const apiSearchPlaces = axios.create({
    baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    params: {
        limit: 6,
        language: 'es',
        access_token: 'pk.eyJ1IjoiZmVyamViYXkiLCJhIjoiY2xwOG81djFhMjY0OTJpbnJrbGdobTg3aSJ9.sF33F2cBAjv0YCfYf7EEMQ'
    }
})

export default apiSearchPlaces;