import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// India states GeoJSON with realistic boundaries
const INDIA_STATES_SIMPLIFIED = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Jammu and Kashmir" }, "geometry": { "type": "Polygon", "coordinates": [[[73.5, 32.5], [75.5, 34.0], [77.5, 35.5], [79.0, 35.0], [78.0, 33.5], [76.5, 32.0], [74.5, 32.0], [73.5, 32.5]]] }},
    { "type": "Feature", "properties": { "name": "Himachal Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 30.5], [76.5, 31.0], [78.0, 31.5], [79.0, 31.3], [78.5, 30.5], [77.5, 30.0], [76.0, 30.3], [75.5, 30.5]]] }},
    { "type": "Feature", "properties": { "name": "Punjab" }, "geometry": { "type": "Polygon", "coordinates": [[[73.9, 29.6], [74.5, 30.5], [75.5, 31.5], [76.5, 32.0], [76.0, 31.0], [75.0, 30.3], [74.2, 29.8], [73.9, 29.6]]] }},
    { "type": "Feature", "properties": { "name": "Uttarakhand" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 28.8], [78.5, 29.5], [79.5, 30.5], [80.5, 30.8], [80.0, 29.8], [79.0, 29.0], [78.0, 28.5], [77.5, 28.8]]] }},
    { "type": "Feature", "properties": { "name": "Haryana" }, "geometry": { "type": "Polygon", "coordinates": [[[74.5, 27.7], [75.5, 28.5], [76.5, 29.5], [77.5, 30.3], [77.8, 28.5], [77.0, 27.5], [76.0, 27.0], [74.8, 27.5], [74.5, 27.7]]] }},
    { "type": "Feature", "properties": { "name": "Delhi" }, "geometry": { "type": "Polygon", "coordinates": [[[76.8, 28.4], [77.3, 28.9], [77.4, 28.5], [77.1, 28.4], [76.8, 28.4]]] }},
    { "type": "Feature", "properties": { "name": "Rajasthan" }, "geometry": { "type": "Polygon", "coordinates": [[[69.5, 23.5], [70.2, 24.5], [71.0, 25.5], [72.5, 26.8], [73.5, 27.5], [74.5, 28.0], [75.5, 28.5], [76.0, 29.0], [75.8, 27.5], [75.0, 26.5], [74.0, 25.0], [72.5, 24.0], [71.0, 23.5], [69.5, 23.5]]] }},
    { "type": "Feature", "properties": { "name": "Uttar Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[77.3, 24.5], [78.5, 25.0], [80.0, 25.8], [81.5, 26.5], [83.0, 27.0], [84.0, 27.5], [84.5, 26.8], [83.8, 26.0], [82.0, 25.5], [80.0, 24.8], [78.5, 24.3], [77.3, 24.5]]] }},
    { "type": "Feature", "properties": { "name": "Bihar" }, "geometry": { "type": "Polygon", "coordinates": [[[83.3, 24.3], [84.5, 24.8], [85.5, 25.3], [86.5, 25.8], [87.5, 26.5], [88.0, 27.0], [87.3, 27.3], [86.0, 26.8], [84.5, 26.0], [83.5, 25.0], [83.3, 24.3]]] }},
    { "type": "Feature", "properties": { "name": "Sikkim" }, "geometry": { "type": "Polygon", "coordinates": [[[88.0, 27.0], [88.5, 27.5], [88.9, 28.0], [88.7, 27.5], [88.3, 27.2], [88.0, 27.0]]] }},
    { "type": "Feature", "properties": { "name": "Arunachal Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[91.5, 26.5], [92.5, 27.0], [94.0, 27.5], [96.5, 28.0], [97.0, 27.5], [95.5, 27.0], [93.5, 26.8], [92.0, 26.5], [91.5, 26.5]]] }},
    { "type": "Feature", "properties": { "name": "Nagaland" }, "geometry": { "type": "Polygon", "coordinates": [[[93.3, 25.2], [94.0, 25.8], [95.0, 26.5], [94.8, 25.8], [94.0, 25.3], [93.5, 25.0], [93.3, 25.2]]] }},
    { "type": "Feature", "properties": { "name": "Manipur" }, "geometry": { "type": "Polygon", "coordinates": [[[93.0, 23.8], [93.8, 24.3], [94.5, 25.0], [94.3, 24.3], [93.5, 23.8], [93.0, 23.8]]] }},
    { "type": "Feature", "properties": { "name": "Mizoram" }, "geometry": { "type": "Polygon", "coordinates": [[[92.2, 21.8], [92.8, 22.5], [93.3, 23.5], [93.0, 23.0], [92.5, 22.0], [92.2, 21.8]]] }},
    { "type": "Feature", "properties": { "name": "Tripura" }, "geometry": { "type": "Polygon", "coordinates": [[[91.0, 22.8], [91.5, 23.3], [92.2, 24.0], [91.8, 23.5], [91.3, 23.0], [91.0, 22.8]]] }},
    { "type": "Feature", "properties": { "name": "Meghalaya" }, "geometry": { "type": "Polygon", "coordinates": [[[89.8, 25.0], [90.5, 25.5], [91.5, 26.0], [92.0, 26.0], [91.5, 25.5], [90.5, 25.0], [89.8, 25.0]]] }},
    { "type": "Feature", "properties": { "name": "Assam" }, "geometry": { "type": "Polygon", "coordinates": [[[89.7, 24.2], [90.5, 25.0], [91.5, 25.8], [92.5, 26.3], [93.5, 26.8], [94.5, 27.0], [95.5, 27.3], [96.0, 27.0], [94.5, 26.5], [92.5, 26.0], [91.0, 25.3], [89.9, 24.5], [89.7, 24.2]]] }},
    { "type": "Feature", "properties": { "name": "West Bengal" }, "geometry": { "type": "Polygon", "coordinates": [[[85.8, 21.5], [86.5, 22.0], [87.0, 22.8], [87.8, 23.5], [88.3, 24.5], [88.8, 25.5], [89.0, 26.5], [88.5, 26.8], [87.8, 26.3], [87.0, 25.5], [86.3, 24.5], [86.0, 23.0], [85.8, 21.5]]] }},
    { "type": "Feature", "properties": { "name": "Jharkhand" }, "geometry": { "type": "Polygon", "coordinates": [[[83.3, 22.0], [84.0, 22.5], [85.0, 23.0], [86.5, 23.8], [87.0, 24.5], [86.5, 24.8], [85.5, 24.3], [84.5, 23.5], [83.5, 22.8], [83.3, 22.0]]] }},
    { "type": "Feature", "properties": { "name": "Odisha" }, "geometry": { "type": "Polygon", "coordinates": [[[81.3, 17.8], [82.0, 18.5], [83.5, 19.0], [84.5, 19.5], [85.5, 20.3], [86.5, 21.0], [87.0, 21.8], [86.3, 22.3], [85.0, 21.8], [83.5, 21.0], [82.5, 20.0], [81.8, 19.0], [81.3, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Chhattisgarh" }, "geometry": { "type": "Polygon", "coordinates": [[[80.3, 17.8], [81.0, 18.5], [82.5, 19.5], [83.5, 20.5], [84.0, 21.8], [83.5, 23.0], [82.5, 23.5], [81.0, 22.8], [80.5, 21.5], [80.0, 19.5], [80.3, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Madhya Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[74.0, 21.2], [75.0, 21.8], [76.5, 22.5], [78.0, 23.0], [79.5, 23.8], [81.0, 24.5], [82.5, 25.0], [83.0, 24.5], [82.0, 23.8], [80.5, 23.0], [79.0, 22.5], [77.0, 22.0], [75.5, 21.5], [74.0, 21.2]]] }},
    { "type": "Feature", "properties": { "name": "Gujarat" }, "geometry": { "type": "Polygon", "coordinates": [[[68.2, 20.2], [68.8, 21.0], [69.5, 22.0], [70.5, 23.0], [71.5, 23.8], [72.5, 24.5], [73.5, 24.0], [74.0, 23.0], [73.5, 22.0], [72.5, 21.0], [71.0, 20.5], [69.5, 20.3], [68.2, 20.2]]] }},
    { "type": "Feature", "properties": { "name": "Maharashtra" }, "geometry": { "type": "Polygon", "coordinates": [[[72.6, 15.6], [73.0, 16.5], [74.0, 17.5], [75.5, 18.5], [77.0, 19.5], [78.5, 20.0], [79.5, 20.8], [80.5, 21.5], [79.8, 21.8], [78.5, 21.5], [77.0, 21.0], [75.5, 20.3], [74.0, 19.5], [73.0, 18.0], [72.6, 15.6]]] }},
    { "type": "Feature", "properties": { "name": "Goa" }, "geometry": { "type": "Polygon", "coordinates": [[[73.7, 14.9], [74.2, 15.3], [74.3, 15.8], [73.9, 15.7], [73.7, 15.3], [73.7, 14.9]]] }},
    { "type": "Feature", "properties": { "name": "Karnataka" }, "geometry": { "type": "Polygon", "coordinates": [[[74.0, 11.5], [74.5, 12.5], [75.5, 13.5], [76.5, 14.5], [77.5, 15.5], [78.5, 16.5], [78.5, 17.5], [77.5, 18.0], [76.5, 18.3], [75.5, 18.0], [74.5, 17.0], [74.0, 15.5], [74.0, 11.5]]] }},
    { "type": "Feature", "properties": { "name": "Telangana" }, "geometry": { "type": "Polygon", "coordinates": [[[77.2, 15.8], [78.0, 15.8], [78.8, 16.3], [79.5, 16.8], [80.5, 17.5], [80.8, 18.5], [80.5, 19.2], [79.5, 19.5], [78.5, 19.4], [77.5, 19.0], [77.0, 18.0], [77.2, 15.8]]] }},
    { "type": "Feature", "properties": { "name": "Andhra Pradesh" }, "geometry": { "type": "Polygon", "coordinates": [[[77.0, 12.5], [78.0, 12.6], [79.0, 13.0], [80.5, 13.5], [82.0, 14.0], [83.5, 14.8], [84.5, 16.0], [84.7, 17.5], [84.0, 18.3], [82.5, 18.5], [81.0, 18.8], [79.5, 18.5], [78.5, 17.8], [78.0, 16.5], [77.5, 15.0], [77.2, 13.5], [77.0, 12.5]]] }},
    { "type": "Feature", "properties": { "name": "Tamil Nadu" }, "geometry": { "type": "Polygon", "coordinates": [[[76.2, 8.0], [77.0, 8.2], [78.0, 8.8], [79.0, 9.8], [79.8, 10.8], [80.2, 12.0], [80.3, 13.2], [79.8, 13.5], [79.0, 13.3], [78.0, 12.8], [77.0, 11.8], [76.5, 10.5], [76.0, 9.0], [76.2, 8.0]]] }},
    { "type": "Feature", "properties": { "name": "Kerala" }, "geometry": { "type": "Polygon", "coordinates": [[[74.8, 8.3], [75.2, 9.0], [75.8, 10.0], [76.3, 11.0], [76.8, 12.0], [76.5, 12.5], [76.0, 12.2], [75.5, 11.5], [75.2, 10.5], [75.0, 9.5], [74.8, 8.3]]] }},
    { "type": "Feature", "properties": { "name": "Puducherry" }, "geometry": { "type": "Polygon", "coordinates": [[[79.7, 11.8], [79.9, 12.0], [79.9, 12.1], [79.7, 12.0], [79.7, 11.8]]] }}
  ]
};

// Telangana Districts with realistic boundaries
const TG_DISTRICTS = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Adilabad", "rainfall": 1050, "events": 7, "waterlogDays": 11, "drainage": "Moderate", "elevation": 388, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 18.8], [78.5, 19.0], [79.3, 19.3], [79.5, 19.5], [79.2, 19.3], [78.5, 19.1], [77.8, 18.9], [77.8, 18.8]]] }},
    { "type": "Feature", "properties": { "name": "Komaram Bheem", "rainfall": 980, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 264, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.5, 18.5], [79.3, 18.7], [79.8, 18.9], [79.5, 19.0], [78.8, 18.8], [78.5, 18.6], [78.5, 18.5]]] }},
    { "type": "Feature", "properties": { "name": "Mancherial", "rainfall": 920, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 264, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.0, 18.5], [79.6, 18.7], [79.9, 18.9], [79.7, 19.0], [79.2, 18.8], [79.0, 18.6], [79.0, 18.5]]] }},
    { "type": "Feature", "properties": { "name": "Nizamabad", "rainfall": 1050, "events": 7, "waterlogDays": 11, "drainage": "Moderate", "elevation": 388, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 18.0], [78.2, 18.2], [78.7, 18.5], [78.5, 18.7], [77.9, 18.5], [77.5, 18.3], [77.5, 18.0]]] }},
    { "type": "Feature", "properties": { "name": "Kamareddy", "rainfall": 850, "events": 5, "waterlogDays": 8, "drainage": "Good", "elevation": 400, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 18.2], [78.3, 18.4], [78.6, 18.6], [78.4, 18.8], [77.9, 18.6], [77.8, 18.4], [77.8, 18.2]]] }},
    { "type": "Feature", "properties": { "name": "Karimnagar", "rainfall": 920, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 264, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.7, 18.2], [79.3, 18.4], [79.7, 18.6], [79.5, 18.8], [79.0, 18.6], [78.7, 18.4], [78.7, 18.2]]] }},
    { "type": "Feature", "properties": { "name": "Peddapalli", "rainfall": 960, "events": 7, "waterlogDays": 10, "drainage": "Moderate", "elevation": 250, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.0, 18.0], [79.5, 18.2], [79.8, 18.4], [79.6, 18.6], [79.2, 18.4], [79.0, 18.2], [79.0, 18.0]]] }},
    { "type": "Feature", "properties": { "name": "Jagtial", "rainfall": 900, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 280, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[78.6, 18.6], [79.1, 18.8], [79.4, 19.0], [79.2, 19.1], [78.8, 18.9], [78.6, 18.7], [78.6, 18.6]]] }},
    { "type": "Feature", "properties": { "name": "Rajanna Sircilla", "rainfall": 880, "events": 5, "waterlogDays": 8, "drainage": "Good", "elevation": 300, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.6, 18.2], [79.0, 18.4], [79.3, 18.6], [79.1, 18.7], [78.7, 18.5], [78.6, 18.3], [78.6, 18.2]]] }},
    { "type": "Feature", "properties": { "name": "Medak", "rainfall": 820, "events": 5, "waterlogDays": 7, "drainage": "Good", "elevation": 442, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 17.8], [78.3, 18.0], [78.6, 18.2], [78.4, 18.4], [78.0, 18.2], [77.8, 18.0], [77.8, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Sangareddy", "rainfall": 790, "events": 5, "waterlogDays": 7, "drainage": "Good", "elevation": 500, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[77.7, 17.4], [78.2, 17.6], [78.5, 17.8], [78.3, 18.0], [77.9, 17.8], [77.7, 17.6], [77.7, 17.4]]] }},
    { "type": "Feature", "properties": { "name": "Siddipet", "rainfall": 810, "events": 5, "waterlogDays": 8, "drainage": "Moderate", "elevation": 380, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[78.4, 17.8], [78.9, 18.0], [79.2, 18.2], [79.0, 18.4], [78.6, 18.2], [78.4, 18.0], [78.4, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Medchal-Malkajgiri", "rainfall": 840, "events": 10, "waterlogDays": 15, "drainage": "Good", "elevation": 520, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.3, 17.4], [78.7, 17.6], [78.9, 17.8], [78.7, 18.0], [78.4, 17.8], [78.3, 17.6], [78.3, 17.4]]] }},
    { "type": "Feature", "properties": { "name": "Hyderabad", "rainfall": 850, "events": 12, "waterlogDays": 18, "drainage": "Good", "elevation": 536, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[78.3, 17.3], [78.6, 17.4], [78.7, 17.5], [78.6, 17.6], [78.4, 17.5], [78.3, 17.4], [78.3, 17.3]]] }},
    { "type": "Feature", "properties": { "name": "Rangareddy", "rainfall": 780, "events": 5, "waterlogDays": 8, "drainage": "Good", "elevation": 542, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 17.0], [78.3, 17.2], [78.6, 17.4], [78.4, 17.6], [78.0, 17.4], [77.8, 17.2], [77.8, 17.0]]] }},
    { "type": "Feature", "properties": { "name": "Vikarabad", "rainfall": 750, "events": 4, "waterlogDays": 6, "drainage": "Moderate", "elevation": 680, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 17.2], [77.9, 17.4], [78.2, 17.6], [78.0, 17.8], [77.7, 17.6], [77.5, 17.4], [77.5, 17.2]]] }},
    { "type": "Feature", "properties": { "name": "Mahbubnagar", "rainfall": 680, "events": 3, "waterlogDays": 5, "drainage": "Poor", "elevation": 510, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 16.5], [78.0, 16.7], [78.4, 17.0], [78.2, 17.2], [77.8, 17.0], [77.5, 16.7], [77.5, 16.5]]] }},
    { "type": "Feature", "properties": { "name": "Nagarkurnool", "rainfall": 650, "events": 3, "waterlogDays": 5, "drainage": "Poor", "elevation": 450, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.0, 16.2], [78.5, 16.4], [78.8, 16.7], [78.6, 16.9], [78.2, 16.7], [78.0, 16.4], [78.0, 16.2]]] }},
    { "type": "Feature", "properties": { "name": "Wanaparthy", "rainfall": 630, "events": 3, "waterlogDays": 4, "drainage": "Poor", "elevation": 480, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 16.2], [78.2, 16.4], [78.5, 16.6], [78.3, 16.8], [78.0, 16.6], [77.8, 16.4], [77.8, 16.2]]] }},
    { "type": "Feature", "properties": { "name": "Jogulamba Gadwal", "rainfall": 620, "events": 2, "waterlogDays": 4, "drainage": "Poor", "elevation": 420, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 15.9], [77.9, 16.1], [78.2, 16.3], [78.0, 16.5], [77.7, 16.3], [77.5, 16.1], [77.5, 15.9]]] }},
    { "type": "Feature", "properties": { "name": "Nalgonda", "rainfall": 730, "events": 4, "waterlogDays": 7, "drainage": "Moderate", "elevation": 420, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[78.8, 16.8], [79.3, 17.0], [79.7, 17.3], [79.5, 17.5], [79.1, 17.3], [78.8, 17.0], [78.8, 16.8]]] }},
    { "type": "Feature", "properties": { "name": "Suryapet", "rainfall": 770, "events": 5, "waterlogDays": 8, "drainage": "Moderate", "elevation": 330, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.3, 16.8], [79.7, 17.0], [80.0, 17.2], [79.8, 17.4], [79.5, 17.2], [79.3, 17.0], [79.3, 16.8]]] }},
    { "type": "Feature", "properties": { "name": "Yadadri Bhuvanagiri", "rainfall": 800, "events": 6, "waterlogDays": 9, "drainage": "Moderate", "elevation": 380, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[78.7, 17.3], [79.1, 17.5], [79.4, 17.7], [79.2, 17.9], [78.9, 17.7], [78.7, 17.5], [78.7, 17.3]]] }},
    { "type": "Feature", "properties": { "name": "Jangaon", "rainfall": 830, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 310, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.1, 17.6], [79.5, 17.8], [79.8, 18.0], [79.6, 18.2], [79.3, 18.0], [79.1, 17.8], [79.1, 17.6]]] }},
    { "type": "Feature", "properties": { "name": "Warangal Urban", "rainfall": 980, "events": 9, "waterlogDays": 14, "drainage": "Moderate", "elevation": 302, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[79.4, 17.8], [79.7, 18.0], [79.9, 18.2], [79.7, 18.3], [79.5, 18.1], [79.4, 17.9], [79.4, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Warangal Rural", "rainfall": 970, "events": 8, "waterlogDays": 13, "drainage": "Moderate", "elevation": 290, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.5, 17.5], [79.9, 17.7], [80.2, 17.9], [80.0, 18.1], [79.7, 17.9], [79.5, 17.7], [79.5, 17.5]]] }},
    { "type": "Feature", "properties": { "name": "Hanumakonda", "rainfall": 960, "events": 8, "waterlogDays": 12, "drainage": "Good", "elevation": 280, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[79.3, 17.9], [79.6, 18.1], [79.8, 18.3], [79.6, 18.4], [79.4, 18.2], [79.3, 18.0], [79.3, 17.9]]] }},
    { "type": "Feature", "properties": { "name": "Mahabubabad", "rainfall": 940, "events": 7, "waterlogDays": 11, "drainage": "Moderate", "elevation": 260, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.8, 17.3], [80.2, 17.5], [80.5, 17.7], [80.3, 17.9], [80.0, 17.7], [79.8, 17.5], [79.8, 17.3]]] }},
    { "type": "Feature", "properties": { "name": "Khammam", "rainfall": 1100, "events": 8, "waterlogDays": 13, "drainage": "Moderate", "elevation": 168, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[79.8, 16.8], [80.3, 17.0], [80.7, 17.3], [80.5, 17.5], [80.1, 17.3], [79.8, 17.0], [79.8, 16.8]]] }},
    { "type": "Feature", "properties": { "name": "Bhadradri Kothagudem", "rainfall": 1150, "events": 9, "waterlogDays": 15, "drainage": "Poor", "elevation": 150, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[80.2, 17.3], [80.7, 17.5], [81.0, 17.8], [80.8, 18.0], [80.4, 17.8], [80.2, 17.5], [80.2, 17.3]]] }},
    { "type": "Feature", "properties": { "name": "Jayashankar Bhupalpally", "rainfall": 1020, "events": 8, "waterlogDays": 12, "drainage": "Moderate", "elevation": 220, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.8, 18.0], [80.2, 18.2], [80.5, 18.4], [80.3, 18.6], [80.0, 18.4], [79.8, 18.2], [79.8, 18.0]]] }},
    { "type": "Feature", "properties": { "name": "Mulugu", "rainfall": 1080, "events": 8, "waterlogDays": 13, "drainage": "Moderate", "elevation": 180, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.8, 17.8], [80.1, 18.0], [80.4, 18.2], [80.2, 18.4], [79.9, 18.2], [79.8, 18.0], [79.8, 17.8]]] }}
  ]
};

// Andhra Pradesh Districts with realistic boundaries
const AP_DISTRICTS = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Srikakulam", "rainfall": 1150, "events": 9, "waterlogDays": 14, "drainage": "Moderate", "elevation": 60, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[83.7, 18.3], [84.2, 18.5], [84.5, 18.8], [84.3, 19.0], [83.9, 18.8], [83.7, 18.5], [83.7, 18.3]]] }},
    { "type": "Feature", "properties": { "name": "Vizianagaram", "rainfall": 1100, "events": 8, "waterlogDays": 12, "drainage": "Moderate", "elevation": 65, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[83.2, 17.8], [83.7, 18.0], [84.0, 18.3], [83.8, 18.5], [83.4, 18.3], [83.2, 18.0], [83.2, 17.8]]] }},
    { "type": "Feature", "properties": { "name": "Visakhapatnam", "rainfall": 1100, "events": 8, "waterlogDays": 12, "drainage": "Moderate", "elevation": 45, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[82.5, 17.3], [83.2, 17.5], [83.7, 17.9], [83.5, 18.2], [83.0, 18.0], [82.5, 17.6], [82.5, 17.3]]] }},
    { "type": "Feature", "properties": { "name": "Alluri Sitharama Raju", "rainfall": 1200, "events": 9, "waterlogDays": 15, "drainage": "Poor", "elevation": 200, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[81.5, 17.5], [82.2, 17.7], [82.7, 18.0], [82.5, 18.3], [82.0, 18.1], [81.5, 17.8], [81.5, 17.5]]] }},
    { "type": "Feature", "properties": { "name": "Anakapalli", "rainfall": 1050, "events": 7, "waterlogDays": 11, "drainage": "Good", "elevation": 55, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[82.5, 17.5], [83.0, 17.7], [83.3, 18.0], [83.1, 18.2], [82.7, 18.0], [82.5, 17.7], [82.5, 17.5]]] }},
    { "type": "Feature", "properties": { "name": "Kakinada", "rainfall": 1080, "events": 8, "waterlogDays": 12, "drainage": "Moderate", "elevation": 15, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[81.8, 16.8], [82.3, 17.0], [82.7, 17.3], [82.5, 17.5], [82.1, 17.3], [81.8, 17.0], [81.8, 16.8]]] }},
    { "type": "Feature", "properties": { "name": "East Godavari", "rainfall": 1120, "events": 8, "waterlogDays": 13, "drainage": "Moderate", "elevation": 20, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[81.3, 16.8], [81.8, 17.0], [82.2, 17.3], [82.0, 17.6], [81.6, 17.4], [81.3, 17.1], [81.3, 16.8]]] }},
    { "type": "Feature", "properties": { "name": "Dr. B.R. Ambedkar Konaseema", "rainfall": 1140, "events": 9, "waterlogDays": 14, "drainage": "Poor", "elevation": 10, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[81.5, 16.5], [82.0, 16.7], [82.3, 17.0], [82.1, 17.2], [81.7, 17.0], [81.5, 16.7], [81.5, 16.5]]] }},
    { "type": "Feature", "properties": { "name": "Eluru", "rainfall": 1020, "events": 7, "waterlogDays": 11, "drainage": "Good", "elevation": 18, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[80.8, 16.5], [81.3, 16.7], [81.6, 17.0], [81.4, 17.2], [81.0, 17.0], [80.8, 16.7], [80.8, 16.5]]] }},
    { "type": "Feature", "properties": { "name": "West Godavari", "rainfall": 1060, "events": 7, "waterlogDays": 11, "drainage": "Moderate", "elevation": 22, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[80.5, 16.5], [81.0, 16.7], [81.3, 17.0], [81.1, 17.2], [80.7, 17.0], [80.5, 16.7], [80.5, 16.5]]] }},
    { "type": "Feature", "properties": { "name": "NTR", "rainfall": 980, "events": 6, "waterlogDays": 10, "drainage": "Good", "elevation": 26, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[80.3, 16.2], [80.7, 16.4], [81.0, 16.7], [80.8, 16.9], [80.5, 16.7], [80.3, 16.4], [80.3, 16.2]]] }},
    { "type": "Feature", "properties": { "name": "Krishna", "rainfall": 970, "events": 6, "waterlogDays": 10, "drainage": "Good", "elevation": 24, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[80.0, 16.0], [80.5, 16.2], [80.8, 16.5], [80.6, 16.7], [80.2, 16.5], [80.0, 16.2], [80.0, 16.0]]] }},
    { "type": "Feature", "properties": { "name": "Palnadu", "rainfall": 780, "events": 5, "waterlogDays": 8, "drainage": "Moderate", "elevation": 150, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[79.5, 15.8], [80.0, 16.0], [80.3, 16.3], [80.1, 16.5], [79.7, 16.3], [79.5, 16.0], [79.5, 15.8]]] }},
    { "type": "Feature", "properties": { "name": "Guntur", "rainfall": 850, "events": 5, "waterlogDays": 8, "drainage": "Good", "elevation": 33, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[79.5, 15.5], [80.0, 15.7], [80.3, 16.0], [80.1, 16.2], [79.7, 16.0], [79.5, 15.7], [79.5, 15.5]]] }},
    { "type": "Feature", "properties": { "name": "Bapatla", "rainfall": 870, "events": 6, "waterlogDays": 9, "drainage": "Good", "elevation": 20, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[79.8, 15.5], [80.2, 15.7], [80.5, 16.0], [80.3, 16.2], [80.0, 16.0], [79.8, 15.7], [79.8, 15.5]]] }},
    { "type": "Feature", "properties": { "name": "Prakasam", "rainfall": 820, "events": 5, "waterlogDays": 7, "drainage": "Moderate", "elevation": 40, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[79.2, 14.8], [79.7, 15.0], [80.2, 15.3], [80.0, 15.5], [79.5, 15.3], [79.2, 15.0], [79.2, 14.8]]] }},
    { "type": "Feature", "properties": { "name": "Nellore", "rainfall": 900, "events": 6, "waterlogDays": 9, "drainage": "Moderate", "elevation": 18, "soilType": "Alluvial" }, "geometry": { "type": "Polygon", "coordinates": [[[79.3, 13.8], [79.8, 14.0], [80.2, 14.5], [80.0, 14.8], [79.5, 14.5], [79.3, 14.0], [79.3, 13.8]]] }},
    { "type": "Feature", "properties": { "name": "Tirupati", "rainfall": 920, "events": 4, "waterlogDays": 6, "drainage": "Moderate", "elevation": 182, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.8, 13.2], [79.3, 13.4], [79.7, 13.8], [79.5, 14.2], [79.0, 14.0], [78.8, 13.5], [78.8, 13.2]]] }},
    { "type": "Feature", "properties": { "name": "Chittoor", "rainfall": 880, "events": 4, "waterlogDays": 6, "drainage": "Moderate", "elevation": 340, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.3, 12.8], [78.8, 13.0], [79.2, 13.4], [79.0, 13.7], [78.5, 13.5], [78.3, 13.0], [78.3, 12.8]]] }},
    { "type": "Feature", "properties": { "name": "Annamayya", "rainfall": 860, "events": 4, "waterlogDays": 6, "drainage": "Moderate", "elevation": 280, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.5, 13.5], [79.0, 13.7], [79.3, 14.0], [79.1, 14.3], [78.7, 14.1], [78.5, 13.7], [78.5, 13.5]]] }},
    { "type": "Feature", "properties": { "name": "Anantapur", "rainfall": 550, "events": 2, "waterlogDays": 3, "drainage": "Poor", "elevation": 350, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[77.2, 13.8], [77.7, 14.0], [78.2, 14.5], [78.0, 15.0], [77.5, 14.8], [77.2, 14.3], [77.2, 13.8]]] }},
    { "type": "Feature", "properties": { "name": "Sri Sathya Sai", "rainfall": 580, "events": 3, "waterlogDays": 4, "drainage": "Poor", "elevation": 420, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 13.8], [78.0, 14.0], [78.4, 14.5], [78.2, 14.8], [77.8, 14.6], [77.5, 14.2], [77.5, 13.8]]] }},
    { "type": "Feature", "properties": { "name": "Kurnool", "rainfall": 680, "events": 3, "waterlogDays": 5, "drainage": "Poor", "elevation": 273, "soilType": "Black Cotton" }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 15.0], [78.0, 15.2], [78.5, 15.7], [78.3, 16.2], [77.8, 16.0], [77.5, 15.5], [77.5, 15.0]]] }},
    { "type": "Feature", "properties": { "name": "Nandyal", "rainfall": 710, "events": 4, "waterlogDays": 6, "drainage": "Moderate", "elevation": 210, "soilType": "Red" }, "geometry": { "type": "Polygon", "coordinates": [[[78.0, 14.8], [78.5, 15.0], [78.9, 15.5], [78.7, 15.8], [78.3, 15.6], [78.0, 15.2], [78.0, 14.8]]] }}
  ]
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [center, zoom, map]);
  return null;
}

export default function IndiaMap({ stateData, selectedState, onStateSelect, onDistrictSelect }) {
  const [hoveredState, setHoveredState] = useState(null);

  const getColor = (risk) => {
    switch (risk) {
      case 'Low': return '#90caf9';
      case 'Moderate': return '#42a5f5';
      case 'High': return '#1565c0';
      case 'Extreme': return '#1a237e';
      default: return '#bbdefb';
    }
  };

  const getDistrictColor = (district) => {
    const events = district.events || 0;
    if (events > 10) return '#1a237e';
    if (events > 6) return '#1565c0';
    if (events > 3) return '#42a5f5';
    return '#90caf9';
  };

  const stateStyle = (feature) => {
    const stateName = feature.properties.name;
    const data = stateData[stateName];
    const isAP = stateName === 'Andhra Pradesh';
    const isTG = stateName === 'Telangana';
    
    return {
      fillColor: data ? getColor(data.risk) : '#e3f2fd',
      weight: 2,
      opacity: 1,
      color: isAP || isTG ? '#0288d1' : '#1a237e',
      fillOpacity: hoveredState === stateName ? 0.8 : 0.6
    };
  };

  const districtStyle = (feature) => {
    return {
      fillColor: getDistrictColor(feature.properties),
      weight: 2,
      opacity: 1,
      color: '#0d1b2a',
      fillOpacity: 0.65,
      dashArray: null
    };
  };

  const onEachState = (feature, layer) => {
    const stateName = feature.properties.name;
    const data = stateData[stateName];
    const isClickable = stateName === 'Andhra Pradesh' || stateName === 'Telangana';
    
    layer.on({
      mouseover: (e) => {
        setHoveredState(stateName);
        e.target.setStyle({ fillOpacity: 0.9 });
      },
      mouseout: (e) => {
        setHoveredState(null);
        e.target.setStyle({ fillOpacity: 0.7 });
      },
      click: () => {
        if (isClickable) {
          onStateSelect(stateName);
        }
      }
    });
    
    layer.bindTooltip(
      `<div class="p-2">
        <div class="font-bold text-[#0d1b2a]">${stateName}</div>
        ${data ? `
          <div class="text-sm text-[#64748b]">Annual Rainfall: ${data.rainfall} mm</div>
          <div class="text-sm text-[#64748b]">Flood Events: ${data.events}</div>
          <div class="text-sm">Risk: <span class="font-semibold" style="color: ${getColor(data.risk)}">${data.risk}</span></div>
          ${isClickable ? '<div class="text-xs text-[#0288d1] mt-1">Click to explore</div>' : ''}
        ` : ''}
      </div>`,
      { permanent: false, direction: 'top', className: 'custom-tooltip' }
    );
  };

  const onEachDistrict = (feature, layer) => {
    const district = feature.properties;
    
    layer.on({
      click: (e) => {
        onDistrictSelect(district);
        // Zoom to district
        const map = e.target._map;
        map.fitBounds(e.target.getBounds(), {
          padding: [50, 50],
          maxZoom: 9,
          animate: true,
          duration: 0.5
        });
      },
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 4, color: '#0288d1' });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.6, weight: 3, color: '#1a237e' });
      }
    });
    
    layer.bindTooltip(
      `<div class="p-3">
        <div class="font-bold text-[#0d1b2a] text-base mb-2">${district.name}</div>
        <div class="text-sm text-[#64748b]">Rainfall: ${district.rainfall} mm</div>
        <div class="text-sm text-[#64748b]">Flood Events: ${district.events}</div>
        <div class="text-xs text-[#0288d1] mt-2 font-medium">Click to view analysis</div>
      </div>`,
      { permanent: false, direction: 'top', className: 'custom-tooltip' }
    );
  };

  const getMapConfig = () => {
    if (selectedState === 'Andhra Pradesh') {
      return { center: [16.5, 80.5], zoom: 7 };
    } else if (selectedState === 'Telangana') {
      return { center: [18, 79.5], zoom: 7 };
    }
    return { center: [22, 82], zoom: 5 };
  };

  const { center, zoom } = getMapConfig();
  const districtData = selectedState === 'Andhra Pradesh' ? AP_DISTRICTS : 
                       selectedState === 'Telangana' ? TG_DISTRICTS : null;

  return (
    <div className="h-[500px] w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
        maxBounds={[[6, 68], [36, 98]]}
        minZoom={5}
        maxZoom={9}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController center={center} zoom={zoom} />
        
        {!selectedState && (
          <GeoJSON
            data={INDIA_STATES_SIMPLIFIED}
            style={stateStyle}
            onEachFeature={onEachState}
          />
        )}
        
        {selectedState && districtData && (
          <GeoJSON
            key={selectedState}
            data={districtData}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}
      </MapContainer>
      
      <style jsx global>{`
        .custom-tooltip {
          background: white !important;
          border: 1px solid #bbdefb !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 0 !important;
        }
        .custom-tooltip .leaflet-tooltip-content {
          margin: 0;
        }
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before,
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before {
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}