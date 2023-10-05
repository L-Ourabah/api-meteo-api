import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importez votre fichier CSS

function App() {
    // State pour stocker les données météorologiques
    const [data, setData] = useState({});
    // State pour gérer la saisie de l'utilisateur
    const [location, setLocation] = useState('');
    // State pour gérer les cas où la destination n'est pas trouvée
    const [destinationNotFound, setDestinationNotFound] = useState(false);
    // State pour stocker les prévisions sur trois jours
    const [threeDayForecast, setThreeDayForecast] = useState({});
    // Clé API pour OpenWeatherMap
    const key = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

    // Fonction pour effectuer la recherche météorologique
    const handleSearch = () => {
        if (location !== '') {
            // Construire l'URL de l'API en utilisant la saisie de l'utilisateur
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${key}&lang=fr`;

            // Faire une requête à l'API OpenWeatherMap
            axios
                .get(url)
                .then((res) => {
                    console.log(res.data);
                    // Mettre à jour le state avec les données météorologiques
                    setData(res.data);
                    // Réinitialiser le statut de destination non trouvée
                    setDestinationNotFound(false);
                })
                .catch(() => {
                    // En cas d'erreur, réinitialiser les données et indiquer que la destination n'a pas été trouvée
                    setData({});
                    setDestinationNotFound(true);
                });
        }
    };

    // Gestionnaire d'événement pour la touche Entrée
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Utilisation initiale pour effectuer la recherche météorologique une fois lorsque le composant est monté
    useEffect(() => {
        handleSearch();
    }, []);

    // Effet pour charger les prévisions à trois jours lorsque les coordonnées de la ville sont disponibles
    useEffect(() => {
        if (data.coord) {
            console.log(data.coord);
            // Construire l'URL des prévisions météorologiques
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&appid=${key}&lang=fr`;

            // Faire une requête à l'API OpenWeatherMap pour les prévisions
            axios
                .get(forecastUrl)
                .then((res) => {


                    // Filtrer les prévisions pour les trois prochains jours
                    // Obtient la date actuelle en créant une nouvelle instance de l'objet Date.
                    const now = new Date();

                    // Crée une nouvelle date en ajoutant trois jours à la date actuelle.
                    const threeDaysLater = new Date(now);
                    threeDaysLater.setDate(now.getDate() + 3);

                    // Filtre les prévisions en utilisant la méthode `filter` sur la liste de prévisions (`res.data.list`).
                    const filteredForecast = res.data.list.filter((forecast) => {
                        // Obtient la date de la prévision en convertissant la valeur de timestamp `forecast.dt` en une date.
                        const forecastDate = new Date(forecast.dt * 1000);

                        // Compare la date de la prévision (`forecastDate`) avec la date trois jours plus tard.
                        // Si la date de la prévision est inférieure ou égale à trois jours plus tard, elle est incluse dans les résultats filtrés.
                        return forecastDate <= threeDaysLater;
                    });

                    // Organiser les prévisions par jour
                    // Initialise un objet vide `dailyForecast` pour stocker les prévisions organisées par jour de la semaine.
                    const dailyForecast = {};

                    // Parcourt chaque prévision dans la liste `filteredForecast`.
                    filteredForecast.forEach((forecast) => {
                        // Obtient la date de la prévision en convertissant la valeur de timestamp `forecast.dt` en une date.
                        const date = new Date(forecast.dt * 1000);

                        // Obtient le nom du jour de la semaine correspondant à la date en utilisant `toLocaleDateString`.
                        // La langue est définie sur le français (`fr-FR`) et le format est spécifié pour obtenir le nom complet du jour (`{ weekday: 'long' }`).
                        const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });

                        // Vérifie si `dailyForecast` a déjà une entrée pour le jour de la semaine actuel.
                        if (!dailyForecast[day]) {
                            // Si non, crée une nouvelle entrée pour ce jour de la semaine avec un tableau vide.
                            dailyForecast[day] = [];
                        }

                        // Ajoute la prévision actuelle au tableau correspondant au jour de la semaine.
                        dailyForecast[day].push(forecast);
                    });

                    // Mettre à jour le state avec les prévisions à trois jours
                    setThreeDayForecast(dailyForecast);
                    console.log(dailyForecast);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [data.coord, key]);

    // Rendu de l'application
    return (
        <div className='page-meteo'>
            <div className='recherche'>
                <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder='Entrez votre destination préférée ...'
                    type='text'
                    onKeyDown={handleKeyPress} // Gestionnaire d'événements pour la touche Entrée
                />
            </div>

            {/* Rendu conditionnel en fonction du statut de destination non trouvée */}
            {destinationNotFound ? (
                <div className='destination-not-found'>
                    <p>Destination non trouvée</p>
                </div>
            ) : (
                data.name !== undefined && (
                    <div className='contenaire'>
                        <div className='information'>
                            {/* Affichage des données météorologiques actuelles */}
                            <h2 className='actu'>Actuellement</h2>
                            <div className="contenaire-actu">
                                <div className="actualité">
                                    <div className='localisation'>
                                        <h1>{data.name} / {data.sys.country}</h1>
                                    </div>
                                    <div className='temperature'>
                                        {data.main ? <h2>{Math.floor(data.main.temp)}°C</h2> : null}
                                    </div>
                                    <div className='description'>
                                        {data.weather ? <h3 style={{ textTransform: 'capitalize' }}>{data.weather[0].description}</h3> : null}
                                    </div>

                                </div>
                                <div className='icones'>
                                    <img src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} alt="Weather Icon" />
                                </div>
                            </div>
                            <div className='infos'>
                                <div className='ressenti'>
                                    {data.main ? <h3>{Math.floor(data.main.feels_like)}°C</h3> : null}
                                    <p>Ressenti</p>
                                </div>
                               
                                <div className='humidité'>
                                    {data.main ? <h3>{data.main.humidity}%</h3> : null}
                                    <p>💧</p>
                                </div>
                                <div className='vent'>
                                    {data.wind ? <h3>{Math.floor(data.wind.speed)} km/h</h3> : null}

                                    <p>Vent</p>
                                </div>
                                <div className="pression">
                                    {data.wind ? <h3>{data.main.pressure} bar</h3> : null}
                                    <p>🧭</p>
                                </div>
                                
                                <div className='temperature-min-max'>
                                    {Math.floor(data.main.temp_min)}°C / {Math.floor(data.main.temp_max)}°C<p>Mini/Max</p>
                                </div>

                            </div>
                        </div>
                        <div className='daily-forecast'>
                            {/* Affichage des prévisions à trois jours */}

                            {Object.keys(threeDayForecast).map((day) => (
                                // Parcourt chaque clé (jour de la semaine) dans l'objet `threeDayForecast`.

                                // Pour chaque jour de la semaine, crée un conteneur `<div>` avec une clé unique.
                                <div key={day}>
                                    {/* Affiche le nom du jour de la semaine en tant que titre. */}
                                    <h3>{day}</h3>
                                    {Array.isArray(threeDayForecast[day]) ? (
                                        // Vérifie si les prévisions pour ce jour sont un tableau.
                                        threeDayForecast[day].map((forecast) => (
                                            // Pour chaque prévision, crée un conteneur `<div>` avec une clé unique.
                                            <div className='day3' key={forecast.dt}>
                                                <div className="new-date">
                                                    {/* Affiche l'heure de la prévision. */}
                                                    <p>{new Date(forecast.dt * 1000).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="prevTemp">
                                                    {/* Affiche la température actuelle. */}
                                                    <p>{Math.floor(forecast.main.temp)}°C</p>
                                                </div>
                                                <div className="prevDescription">
                                                    {/* Affiche la description météorologique. */}
                                                    <p>{forecast.weather[0].description}</p>
                                                </div>
                                               
                                                <img className='logo2'
                                                    // Affiche l'icône météorologique correspondante.
                                                    src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                                                    alt="Weather Icon"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        // Si aucune prévision n'est disponible pour ce jour, affiche un message.
                                        <p>Aucune prévision disponible pour cette journée.</p>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default App;
