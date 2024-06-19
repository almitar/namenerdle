const maxAttempts = 6;
let currentAttempt = 0;
let currentGuess = '';
let nameList = [];
let targetInfo = getTargetNameForToday();
let results = []; // Track results for each guess
let gameID = getGameID(new Date().toISOString().split('T')[0]);

let stats = {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(maxAttempts).fill(0)
};

// Check and apply dark mode setting
const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
if (darkModeEnabled) {
    $('body').addClass('dark-mode');
    $('#dark-theme-toggle').prop('checked', true);
}

$(document).ready(() => {
    console.log('Document ready'); // Debug statement
    loadStats();

    if (hasPlayedToday()) {
        loadGameState(); // Load the game state and display the grid
        showAlreadyPlayedMessage();
        return;
    }

    if (!targetInfo) {
        showMessage("No target name found for today. Please try again later.");
        return;
    }

    loadGameState(); // Load the game state when the page is loaded

    createGrid(); // Call createGrid after targetInfo is set
    loadKeyboard(); // Load keyboard from external file
    loadNames(targetInfo.name.length);

    // Update the message above the grid
    const genderText = targetInfo.gender === "female" ? "female" : "male";
    $('#gender-message').html(`Find the hidden common name, today's is traditionally <span class="gender">${genderText}</span>`);

    $(document).on('keydown', handleKeyDown);
});

$(document).on('click', '#share-button', function(){
    shareScore();
});

$(document).on('click', '#share-button2', function(){
    shareScore();
});

$(document).on('click', '.close-button', function(){
    closePopup();
    loadGameState(); // Reload the game state to show the grid after closing the popup
});

$(document).on('click', '#stats-button', function(){
    displayStats();
    $('#popup').show(); 
});

$(document).on('click', '#see-stats-button', function(){
    displayStats();
    $('#popup').show(); 
});

$(document).on('click', '#how-to-play-button', function(){
    $('#how-to-play-popup').show();
});

$(document).on('click', '#settings-button', function(){
    $('#settings-popup').show();
});

$(document).on('change', '#dark-theme-toggle', function() {
    if (this.checked) {
        $('body').addClass('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        $('body').removeClass('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
});

function saveGameState() {
    const gameState = {
        currentAttempt,
        currentGuess,
        results,
        stats,
        gameID,
        lastPlayed: new Date().toISOString().split('T')[0] // Save the last played date
    };
    console.log("Saving game state:", gameState);
    localStorage.setItem('nameWordleGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedGameState = localStorage.getItem('nameWordleGameState');
    if (savedGameState) {
        const gameState = JSON.parse(savedGameState);
        const today = new Date().toISOString().split('T')[0];

        // If the saved game state is from a previous day, reset the game state
        if (gameState.lastPlayed !== today) {
            resetGameState();
            return;
        }

        console.log("Loading game state:", gameState);
        currentAttempt = gameState.currentAttempt;
        currentGuess = gameState.currentGuess;
        results = gameState.results;
        stats = gameState.stats;
        gameID = gameState.gameID;
        recreateGrid();
    }
}

function recreateGrid() {
    createGrid(); // Ensure the grid is created

    for (let i = 0; i < results.length; i++) {
        const attempt = results[i];
        console.log(`Recreating attempt ${i + 1}:`, attempt);
        for (let j = 0; j < targetInfo.name.length; j++) {
            const cell = $(`#cell-${i}-${j}`);
            const { letter, state } = attempt[j];
            console.log(`Cell [${i},${j}]:`, { letter, state });
            cell.text(letter);

            if (state === 'correct') {
                cell.addClass('correct');
            } else if (state === 'present') {
                cell.addClass('present');
            } else {
                cell.addClass('absent');
            }
        }
    }
}

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('nameWordleStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('nameWordleStats', JSON.stringify(stats));
}

// Update and display stats
function updateStats(success) {
    stats.gamesPlayed++;
    if (success) {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) {
            stats.maxStreak = stats.currentStreak;
        }
        stats.guessDistribution[currentAttempt]++; // Record the correct guess attempt
    } else {
        stats.currentStreak = 0;
    }
    saveStats();
    displayStats();
}

function hasPlayedToday() {
    const lastPlayed = localStorage.getItem('lastPlayed');
    const today = new Date().toISOString().slice(0, 10);
    console.log(`Last Played: ${lastPlayed}, Today: ${today}`); // Add this line
    return lastPlayed === today;
}

// Set the last played date to today and clear game state if it's a new day
function setPlayedToday() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('lastPlayed', today);
    saveGameState(); // Save the game state at the end of the game
}

// Reset the game state for a new day
function resetGameState() {
    currentAttempt = 0;
    currentGuess = '';
    results = [];
    stats = {
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        currentStreak: stats.currentStreak,
        maxStreak: stats.maxStreak,
        guessDistribution: stats.guessDistribution
    };
    localStorage.removeItem('nameWordleGameState');
    createGrid();  // Recreate the grid for the new game
}

// Show popup with stats
function showPopup(success) {
    const popup = $('#popup');
    const message = $('#popup-message');
    message.text(success ? "Congratulations! You solved today's puzzle! If you're enjoying namenerdle please share it 🧡" : "Thanks for playing today! If you're enjoying namenerdle please share it 🧡");
    updateStats(success);
    displayStats();

    // Show the share button only if the game is completed
    $('#share-button2').show();

    popup.show();

    // Start countdown for the next game
    startCountdown();
    saveGameState(); // Ensure the game state is saved when the popup is shown
}

// Show message if the game was already played today
function showAlreadyPlayedMessage() {
    const alreadyPlayedMessage = $('#already-played');
    
    alreadyPlayedMessage.show();

    startCountdown();

    loadGameState(); // Load the game state and display the grid
}

// Close popup
function closePopup() {
    $('.popup').hide();
    loadGameState(); // Reload the game state to show the grid after closing the popup
}

function shareScore() {
    let message = `Name Nerdle ${gameID} ${currentAttempt + 1}/${maxAttempts}\n\n`;

    results.forEach(attempt => {
        attempt.forEach(({ letter, state }) => {
            if (state === 'correct') {
                message += '🟩';
            } else if (state === 'present') {
                message += '🟨';
            } else {
                message += '⬛';
            }
        });
        message += '\n';
    });

    // Add the URL after the results
    message += '\nnamenerdle.com';

    if (navigator.share) {
        navigator.share({
            title: 'Name Wordle Game',
            text: message,
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing', error));
    } else {
        navigator.clipboard.writeText(message)
            .then(() => alert('Score copied to clipboard'))
            .catch(error => console.log('Error copying to clipboard', error));
    }
}

// Start countdown for the next game
function startCountdown() {
    const countdownElement = $('#countdown, #countdown-timer'); // Target both countdown elements

    const interval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const timeDifference = tomorrow - now;

        const hours = String(Math.floor(timeDifference / (1000 * 60 * 60) % 24)).padStart(2, '0');
        const minutes = String(Math.floor(timeDifference / (1000 * 60) % 60)).padStart(2, '0');
        const seconds = String(Math.floor(timeDifference / 1000 % 60)).padStart(2, '0');

        countdownElement.html(`Next puzzle in ${hours}:${minutes}:${seconds}<br><br>Tomorrow’s a new day, with a new name. See you then.`);

        if (timeDifference <= 0) {
            clearInterval(interval);
            location.reload(); // Reload the page for the next game
        }
    }, 1000);
}

// Display stats
function displayStats() {
    console.log('Displaying stats'); // Debug statement
    $('#games-played').text(stats.gamesPlayed);
    let winPercentage = (stats.gamesPlayed === 0) ? 0 : Math.round((stats.wins / stats.gamesPlayed) * 100);
    $('#win-percentage').text(winPercentage);
    $('#current-streak').text(stats.currentStreak);
    $('#max-streak').text(stats.maxStreak);

    for (let i = 0; i < maxAttempts; i++) {
        const guessCount = stats.guessDistribution[i];
        const percentage = (stats.gamesPlayed === 0) ? 0 : (guessCount / stats.gamesPlayed) * 100;
        $(`#guess-${i + 1}`).css('width', `${percentage}%`).text(guessCount);
    }

    $('#popup').show(); // Ensure the popup is displayed
}

function createGrid() {
    const grid = $('#grid');
    grid.empty(); // Clear any existing cells

    // Set the grid template columns based on the target name length
    grid.css('grid-template-columns', `repeat(${targetInfo.name.length}, 53px)`);

    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < targetInfo.name.length; j++) { // Use the length of the target name
            const cell = $('<div></div>');
            cell.addClass('cell');
            cell.attr('id', `cell-${i}-${j}`);
            grid.append(cell);
        }
    }
}

function loadKeyboard() {
    $('#keyboard-placeholder').load('keyboard.html', function() {
        createKeyboard();
    });
}

function createKeyboard() {
    $('.key').on('click', function() {
        handleKeyPress($(this).text());
    });
}

function handleKeyPress(key) {
    if (key === 'Enter') {
        submitGuess();
    } else if (key === '←') {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (currentGuess.length < targetInfo.name.length) { // Allow input up to the target name length
        currentGuess += key;
        updateGrid();
    }
}

function handleKeyDown(event) {
    const key = event.key.toUpperCase();
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetInfo.name.length) { // Allow input up to the target name length
        currentGuess += key;
        updateGrid();
    }
}

function updateGrid() {
    for (let i = 0; i < targetInfo.name.length; i++) {
        const cell = $(`#cell-${currentAttempt}-${i}`);
        cell.text(currentGuess[i] || '');
    }
    
    // Clear the next row if the game is not over
    if (currentAttempt < maxAttempts) {
        for (let i = 0; i < targetInfo.name.length; i++) {
            const nextCell = $(`#cell-${currentAttempt + 1}-${i}`);
            nextCell.text('');
        }
    }
}

function loadNames(length) {
    // Dynamically load the script corresponding to the length of the target name
    $.getScript(`names_by_length/${length}.js`, function() {
        switch (length) {
            case 3:
                nameList = names3.map(name => name.trim().toUpperCase());
                break;
            case 4:
                nameList = names4.map(name => name.trim().toUpperCase());
                break;
            case 5:
                nameList = names5.map(name => name.trim().toUpperCase());
                break;
            case 6:
                nameList = names6.map(name => name.trim().toUpperCase());
                break;
            // Add more cases if needed
            default:
                nameList = [];
        }
    }).fail(function(jqxhr, settings, exception) {
        console.error('Error loading name list:', exception);
    });
}

function submitGuess() {
    if (currentGuess.length !== targetInfo.name.length) {
        showMessage(`Please enter a ${targetInfo.name.length}-letter name.`);
        return;
    }

    currentGuess = currentGuess.trim().toUpperCase();
    console.log("Current guess:", currentGuess);

    if (!nameList.includes(currentGuess)) {
        showMessage("Not in name list.");
        console.log("Name not found in the list.");
        return;
    }

    let result = new Array(targetInfo.name.length).fill(null); // Initialize result array with the correct length
    let targetNameMatch = Array(targetInfo.name.length).fill(false);
    let currentGuessMatch = Array(currentGuess.length).fill(false);

    // First pass: mark correct positions
    for (let i = 0; i < targetInfo.name.length; i++) {
        if (currentGuess[i] === targetInfo.name[i]) {
            const cell = $(`#cell-${currentAttempt}-${i}`);
            cell.addClass('correct');
            updateKeyboardKey(currentGuess[i], 'correct');
            targetNameMatch[i] = true;
            currentGuessMatch[i] = true;
            result[i] = { letter: currentGuess[i], state: 'correct' };
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < targetInfo.name.length; i++) {
        if (!currentGuessMatch[i]) {
            for (let j = 0; j < targetInfo.name.length; j++) {
                if (!targetNameMatch[j] && currentGuess[i] === targetInfo.name[j]) {
                    const cell = $(`#cell-${currentAttempt}-${i}`);
                    cell.addClass('present');
                    updateKeyboardKey(currentGuess[i], 'present');
                    targetNameMatch[j] = true;
                    currentGuessMatch[i] = true;
                    result[i] = { letter: currentGuess[i], state: 'present' };
                    break;
                }
            }
        }
    }

    // Third pass: mark absent letters
    for (let i = 0; i < targetInfo.name.length; i++) {
        if (!currentGuessMatch[i]) {
            const cell = $(`#cell-${currentAttempt}-${i}`);
            cell.addClass('absent');
            updateKeyboardKey(currentGuess[i], 'absent');
            result[i] = { letter: currentGuess[i], state: 'absent' };
        }
    }

    results.push(result);
    console.log("Results after guess:", results);

    if (currentGuess === targetInfo.name) {
        setPlayedToday();
        showPopup(true);
        disableKeyboard();
    } else if (++currentAttempt === maxAttempts) {
        setPlayedToday();
        showPopup(false);
        disableKeyboard();
    } else {
        currentGuess = '';
        updateGrid();
    }

    saveGameState();
}

function updateKeyboardKey(key, className) {
    $('.key').each(function() {
        if ($(this).text() === key) {
            $(this).addClass(className);
        }
    });
}

function showMessage(message) {
    const errorMessage = $('#error-message');
    errorMessage.text(message);
    errorMessage.fadeIn();

    setTimeout(() => {
        errorMessage.fadeOut();
    }, 2000); // Hide after 2 seconds
}

function disableKeyboard() {
    $('.key').prop('disabled', true);
    $(document).off('keydown', handleKeyDown);
}

// Prevent double click zoom
document.addEventListener('dblclick', function(e) {
    e.preventDefault();
}, {
    passive: false
});
