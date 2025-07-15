let currentWords = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let errors = 0;
let totalChars = 0;
let isGameActive = false;
let allWords = wordData.words; // Use the global wordData from english_10k.js
let lastError = null; // Track the last error for display

const wordsContainer = document.getElementById('wordsContainer');
const typingInput = document.getElementById('typingInput');
const overlay = document.getElementById('overlay');
const victoryScreen = document.getElementById('victoryScreen');
const failScreen = document.getElementById('failScreen');
const wpmDisplay = document.querySelector('.wpm');
const accuracyDisplay = document.querySelector('.accuracy');
const finalWpmDisplay = document.getElementById('finalWpm');
const failReasonDisplay = document.getElementById('failReason');

function generateWords() {
    currentWords = [];
    for (let i = 0; i < 15; i++) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        currentWords.push(allWords[randomIndex]);
    }
    displayWords();
}

function displayWords() {
    wordsContainer.innerHTML = '';
    currentWords.forEach((word, wordIndex) => {
        const wordElement = document.createElement('span');
        wordElement.className = 'word';
        wordElement.setAttribute('data-word-index', wordIndex);
        
        word.split('').forEach((char, charIndex) => {
            const charElement = document.createElement('span');
            charElement.className = 'char';
            charElement.textContent = char;
            charElement.setAttribute('data-char-index', charIndex);
            wordElement.appendChild(charElement);
        });
        
        wordsContainer.appendChild(wordElement);
    });
    
    updateCurrentPosition();
}

function updateCurrentPosition() {
    document.querySelectorAll('.word').forEach(word => word.classList.remove('current'));
    document.querySelectorAll('.char').forEach(char => char.classList.remove('current'));
    
    const currentWord = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
    if (currentWord) {
        currentWord.classList.add('current');
        
        const currentChar = currentWord.querySelector(`[data-char-index="${currentCharIndex}"]`);
        if (currentChar) {
            currentChar.classList.add('current');
        }
    }
}

function calculateWPM() {
    if (!startTime) return 0;
    
    const currentTime = Date.now();
    const timeElapsed = (currentTime - startTime) / 1000 / 60; // Convert to minutes
    
    // Debug logging
    console.log('WPM Calculation:', {
        timeElapsed: timeElapsed,
        totalChars: totalChars,
        startTime: startTime,
        currentTime: currentTime
    });
    
    // Prevent division by zero - use minimum of 0.1 seconds (0.00167 minutes)
    const minTimeElapsed = Math.max(timeElapsed, 0.00167);
    
    const charactersTyped = totalChars;
    const wpm = Math.round((charactersTyped / 5) / minTimeElapsed);
    
    console.log('Final WPM:', wpm, 'using timeElapsed:', minTimeElapsed);
    
    return wpm || 0;
}

function calculateAccuracy() {
    if (totalChars === 0) return 100;
    return Math.round(((totalChars - errors) / totalChars) * 100);
}

function updateStats() {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    wpmDisplay.textContent = `${wpm} wpm`;
    accuracyDisplay.textContent = `${accuracy}%`;
}

function handleKeyPress(event) {
    if (!isGameActive) {
        startTime = Date.now();
        isGameActive = true;
    }
    
    const typedChar = event.key;
    
    if (typedChar === ' ') {
        event.preventDefault();
        handleSpacePress();
        return;
    }
    
    if (typedChar === 'Backspace') {
        event.preventDefault();
        handleBackspace();
        return;
    }
    
    if (typedChar.length === 1) {
        handleCharacterInput(typedChar);
    }
}

function handleCharacterInput(typedChar) {
    const currentWord = currentWords[currentWordIndex];
    const expectedChar = currentWord[currentCharIndex];
    
    totalChars++;
    
    const currentCharElement = document.querySelector(`[data-word-index="${currentWordIndex}"] [data-char-index="${currentCharIndex}"]`);
    
    if (typedChar === expectedChar) {
        currentCharElement.classList.add('correct');
        currentCharElement.classList.remove('incorrect');
        currentCharIndex++;
        
        if (currentCharIndex >= currentWord.length) {
            // Word is complete
            if (currentWordIndex === currentWords.length - 1) {
                // This was the last word - finish the game
                finishGame();
                return;
            }
            // Not the last word - user needs to press space to continue
        }
    } else {
        currentCharElement.classList.add('incorrect');
        currentCharElement.classList.remove('correct');
        errors++;
        
        // Store error details
        lastError = {
            word: currentWord,
            wordIndex: currentWordIndex,
            charIndex: currentCharIndex,
            expected: expectedChar,
            typed: typedChar,
            type: 'wrong_character'
        };
        
        // Immediate failure on mistake
        showFailScreen('You typed the wrong character!');
        return;
    }
    
    updateCurrentPosition();
    updateStats();
}

function handleSpacePress() {
    const currentWord = currentWords[currentWordIndex];
    
    // Check if we're at the end of a word
    if (currentCharIndex !== currentWord.length) {
        // Space pressed before word is complete - this is an error
        lastError = {
            word: currentWord,
            wordIndex: currentWordIndex,
            charIndex: currentCharIndex,
            expected: currentWord[currentCharIndex],
            typed: ' ',
            type: 'early_space'
        };
        showFailScreen('Space pressed too early! Complete the word first.');
        return;
    }
    
    // Check if this is the last word - no space needed after last word
    if (currentWordIndex === currentWords.length - 1) {
        finishGame();
        return;
    }
    
    // Space is correct - move to next word
    totalChars++; // Count the space as a character
    currentWordIndex++;
    currentCharIndex = 0;
    
    updateCurrentPosition();
    updateStats();
}

function handleBackspace() {
    if (currentCharIndex > 0) {
        currentCharIndex--;
        const currentCharElement = document.querySelector(`[data-word-index="${currentWordIndex}"] [data-char-index="${currentCharIndex}"]`);
        currentCharElement.classList.remove('correct', 'incorrect');
        
        if (totalChars > 0) {
            totalChars--;
        }
        
        updateCurrentPosition();
        updateStats();
    }
}

function finishGame() {
    isGameActive = false;
    const finalWpm = calculateWPM();
    
    if (finalWpm >= 80 && errors === 0) {
        showVictoryScreen(finalWpm);
    } else {
        const reason = errors > 0 ? 'You made mistakes!' : `You only achieved ${finalWpm} WPM. Need 80+ WPM!`;
        showFailScreen(reason);
    }
}

function showVictoryScreen(wpm) {
    finalWpmDisplay.textContent = wpm;
    victoryScreen.classList.add('active');
    failScreen.classList.remove('active');
    overlay.classList.add('active');
}

function showFailScreen(reason) {
    failReasonDisplay.textContent = reason;
    
    // Display error details if available
    const errorDetailsElement = document.getElementById('errorDetails');
    if (lastError) {
        let errorHTML = '<div class="error-word-display">';
        
        // Show the word with error highlighting
        for (let i = 0; i < lastError.word.length; i++) {
            const char = lastError.word[i];
            let className = 'error-char';
            
            if (i < lastError.charIndex) {
                className += ' typed';
            } else if (i === lastError.charIndex) {
                className += ' wrong';
            } else {
                className += ' missed';
            }
            
            errorHTML += `<span class="${className}">${char}</span>`;
        }
        
        errorHTML += '</div>';
        errorHTML += '<div class="error-info">';
        errorHTML += `<strong>Word ${lastError.wordIndex + 1}:</strong> "${lastError.word}"<br>`;
        
        if (lastError.type === 'wrong_character') {
            errorHTML += `You typed <strong>"${lastError.typed}"</strong> instead of <strong>"${lastError.expected}"</strong>`;
        } else if (lastError.type === 'early_space') {
            errorHTML += `You pressed <strong>space</strong> at position ${lastError.charIndex + 1}, but the word has ${lastError.word.length} characters`;
        }
        
        errorHTML += '</div>';
        errorDetailsElement.innerHTML = errorHTML;
    } else {
        errorDetailsElement.innerHTML = '';
    }
    
    failScreen.classList.add('active');
    victoryScreen.classList.remove('active');
    overlay.classList.add('active');
}

function resetGame() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    startTime = null;
    errors = 0;
    totalChars = 0;
    isGameActive = false;
    lastError = null;
    
    overlay.classList.remove('active');
    victoryScreen.classList.remove('active');
    failScreen.classList.remove('active');
    
    wpmDisplay.textContent = '0 wpm';
    accuracyDisplay.textContent = '100%';
    
    generateWords();
    typingInput.focus();
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    generateWords(); // Words are already loaded from english_10k.js
    typingInput.focus();
    
    // Keep input focused
    document.addEventListener('click', () => {
        typingInput.focus();
    });
    
    typingInput.addEventListener('keydown', handleKeyPress);
    
    // Prevent losing focus
    typingInput.addEventListener('blur', () => {
        setTimeout(() => typingInput.focus(), 0);
    });
});

// Auto-focus on typing input
document.addEventListener('keydown', (event) => {
    if (event.target !== typingInput && event.key.length === 1) {
        typingInput.focus();
    }
});