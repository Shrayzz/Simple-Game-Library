const nameList = document.getElementById('name-list');
const addButton = document.getElementById('addButton');
const goTopButton = document.getElementById('goTopButton');

window.addEventListener("DOMContentLoaded", async () => {
    // get the page elements

    // get all steam games
    const steamGames = await fetch("http://localhost:3000/api/steam/apps", {
        method: "GET",
    });
    // put the games in the window in JSON
    window.allGames = await steamGames.json();

    // put an increment in the window
    window.numGame = 0;

    // list 100 firsts games
    for (window.numGame; window.numGame < 100; window.numGame++) {
        // get game list element
        const nameList = document.getElementById('name-list');
        // we stop in 100 games
        let arret = window.numGame + 100
        // list 100 more games
        for (window.numGame; window.numGame < arret; window.numGame++) {
            // add a new line
            const newLine = document.createElement("a");
            // get the game ID
            const gameId = window.allGames[window.numGame]?.appid
            const gameName = window.allGames[window.numGame]?.name
            // Add game name to new line
            const gameNameBox = document.createElement("p");
            gameNameBox.innerHTML = gameName;
            newLine.appendChild(gameNameBox);
            // Add game Image to new line
            const gameImageBox = document.createElement("img");
            gameImageBox.src = `https://steamcdn-a.akamaihd.net/steam/apps/${gameId}/header.jpg`
            newLine.appendChild(gameImageBox);
            // Add new line
            newLine.id = gameId;
            newLine.href = `/game?appid=${gameId}`;
            nameList.appendChild(newLine);
        }
    }
});

// When button click list 100 more games
addButton.addEventListener('click', async () => {
    // get game list element
    const nameList = document.getElementById('name-list');
    // we stop in 100 games
    let arret = window.numGame + 100
    // list 100 more games
    for (window.numGame; window.numGame < arret; window.numGame++) {
        // add a new line
        const newLine = document.createElement("a");
        // get the game ID
        const gameId = window.allGames[window.numGame]?.appid
        const gameName = window.allGames[window.numGame]?.name
        // Add game name to new line
        const gameNameBox = document.createElement("p");
        gameNameBox.innerHTML = gameName;
        newLine.appendChild(gameNameBox);
        // Add game Image to new line
        const gameImageBox = document.createElement("img");
        gameImageBox.src = `https://steamcdn-a.akamaihd.net/steam/apps/${gameId}/header.jpg`
        newLine.appendChild(gameImageBox);
        // Add new line
        newLine.id = gameId;
        newLine.href = `/game?appid=${gameId}`;
        nameList.appendChild(newLine);
    }
})

goTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
})