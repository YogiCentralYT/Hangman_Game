const keyboardContainer = document.getElementById("keyboard");
const wordDisplay = document.getElementById("wordDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const bestScoreDisplay = document.getElementById("bestScoreDisplay");
const newGameButton = document.getElementById("newGameButton");
const skipWordButton = document.getElementById("skipWordButton");
const skipSection = document.getElementById("skipSection");
const livesDisplay = document.getElementById("livesDisplay");

// create buttons dynamically
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.classList.add("button", "is-light", "is-medium", "has-text-weight-bold");
    keyboardContainer.appendChild(btn);
});

// load saved score from local storage
let savedScore = parseInt(localStorage.getItem("hangmanScore")) || 0;
scoreDisplay.textContent = savedScore;

let bestScore = parseInt(localStorage.getItem("hangmanBestScore")) || 0;
bestScoreDisplay.textContent = bestScore;

// fetch wordlist using AJAX
let words = [];
function loadWord() {
    return fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt")
        .then(response => response.text())
        .then(text => {
            words = text.split("\n").filter(word => word.length >= 3);
        });
}

loadWord().then(() => {
    const randomWord = getRandomWord();
    startGame(randomWord);
});;

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)].toUpperCase().trim();
}

let currentWordScore = 0;
let letterCount = 0; 

function startGame(word) {
    currentWordScore = 0;
    letterCount = 0;
    
    updateLivesDisplay(0);

    message.style.display = "none";
    newGameButton.style.display = "none";

    skipSection.style.display = "inline-block";

    let wordLen = word.length;
    wordDisplay.textContent = Array(wordLen).fill("_").join("");

    // add event listeners to letter buttons
    const letterBtns = keyboardContainer.querySelectorAll("button");
    let incorrectGuesses = 0;
    letterBtns.forEach(btn => {
        btn.onclick = () => {
            const guessedLetter = btn.textContent;
            if (word.includes(guessedLetter)) {
                // reveal letter in word display
                let newDisplay = "";
                for (let i = 0; i < wordLen; i++) {
                    if (word[i] === guessedLetter) {
                        newDisplay += guessedLetter;
                        letterCount++;
                    } else {
                        newDisplay += wordDisplay.textContent[i];
                    }
                }
                wordDisplay.textContent = newDisplay;
                
                correctGuess(btn, letterCount);
                letterCount = 0;

                if (newDisplay === word) {
                    endGame(true, word);
                }
            } else {
                incorrectGuesses++;
                incorrectGuess(btn, incorrectGuesses, word);
            }
        };
    });
}

function correctGuess(correctBtn, letterCount) {
    let score = parseInt(scoreDisplay.textContent) + 10 * (letterCount == 0 ? 1 : letterCount); // bonus for multiple letters
    scoreDisplay.textContent = score;

    localStorage.setItem("hangmanScore", score);

    if (score > bestScore) {
        bestScoreDisplay.textContent = score;
        localStorage.setItem("hangmanBestScore", score);
    }

    currentWordScore += 10 * (letterCount == 0 ? 1 : letterCount); 
    correctBtn.classList.remove("is-light");
    correctBtn.classList.add("is-success");
    correctBtn.disabled = true;
}

function incorrectGuess(incorrectBtn, incorrectGuesses, word) {
    incorrectBtn.classList.remove("is-light");
    incorrectBtn.classList.add("is-danger");
    incorrectBtn.disabled = true;

    updateLivesDisplay(incorrectGuesses);

    switch (incorrectGuesses) {
        case 1: 
            document.getElementById("head").style.display = "block"; 
            break;
        case 2: 
            document.getElementById("body").style.display = "block";
            break;
        case 3: 
            document.getElementById("leftArm").style.display = "block"; 
            break;
        case 4: 
            document.getElementById("rightArm").style.display = "block"; 
            break;
        case 5: 
            document.getElementById("leftLeg").style.display = "block"; 
            break;
        case 6: 
            document.getElementById("rightLeg").style.display = "block"; 
            endGame(false, word); 
            break;
    }
            
}

function updateLivesDisplay(incorrectGuesses) {
    livesDisplay.textContent = "🖤".repeat(incorrectGuesses) + "❤️".repeat(6 - incorrectGuesses);
}

function endGame(isWin, word) {
    keyboardContainer.querySelectorAll("button").forEach(btn => btn.disabled = true);
    keyboardContainer.style.display = "none";

    message = document.getElementById("message");
    message.style.display = "block";

    if (isWin) {
        message.textContent = `Congratulations! You guessed the word: ${word}.`;
    } else {
        scoreDisplay.textContent = "0"; // reset score
        localStorage.setItem("hangmanScore", 0);
        message.textContent = `Sorry! The correct word was: ${word}.`;
    }

    skipSection.style.display = "none";

    newGameButton.style.display = "inline-block";
}

newGameButton.onclick = () => {
    resetBoard();
};

skipWordButton.onclick = () => {
    // deduct points earned from current word for skipping
    let score = parseInt(scoreDisplay.textContent) - currentWordScore;
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
    localStorage.setItem("hangmanScore", score);
    resetBoard();
}

function resetBoard() {
    keyboardContainer.querySelectorAll("button").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("is-success", "is-danger");
        btn.classList.add("is-light");
    });
    keyboardContainer.style.display = "block";

    // reset hangman figure
    ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    const newWord = getRandomWord();
    startGame(newWord);
}
