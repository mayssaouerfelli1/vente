import React from 'react';
import { Bar } from 'react-chartjs-2';

const StatistiquesVentesChart = ({ statistiquesVentes, username }) => {
    if (!statistiquesVentes) {
        return <div>Loading...</div>; // Affiche un message de chargement si les données ne sont pas encore disponibles
    }

    // Extraction des noms des cours et nombres de ventes
    const labels = statistiquesVentes.map(statistique => statistique.cours);
    const ventes = statistiquesVentes.map(statistique => statistique.nombreAchats);

    // Tableau de couleurs pour chaque cours
    const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        // Ajoute d'autres couleurs si nécessaire
    ];

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Nombre d\'achats',
                data: ventes,
                backgroundColor: colors, // Utilise le tableau de couleurs
                borderColor: colors.map(color => color.replace('0.6', '1')), // Couleur de bordure des barres
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Masquer la légende
            },
            title: {
                display: true,
                text: `Statistiques des ventes pour l'instructeur ${username}`,
                fontSize: 18,
                color: '#333', // Couleur du titre
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Nombre d\'achats',
                    fontSize: 16,
                    color: '#333', // Couleur du titre de l'axe des y
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // Couleur des lignes de la grille
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Cours',
                    fontSize: 16,
                    color: '#333', // Couleur du titre de l'axe des x
                },
                grid: {
                    display: false, // Masquer la grille de l'axe des x
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default StatistiquesVentesChart;
