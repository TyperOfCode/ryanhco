let currentWords = [];
let visualWords = []; // Words as displayed (with swaps)
let swappedPair = null; // [index1, index2] of swapped words
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let errors = 0;
let totalChars = 0;
let isGameActive = false;
let allWords = wordData.words; // Use the global wordData from english_10k.js
let lastError = null; // Track the last error for display

// Sarcastic quotes for fail modal
const sarcasticQuotes = [
    "Fast fingers eh?",
    "Maybe try decaf next time?",
    "That's not how keyboards work...",
    "Did you mean to do that?",
    "Speed isn't everything, accuracy helps too",
    "Your keyboard called, it wants a break",
    "Slow down there, speedy!",
    "Are you typing with your eyes closed?",
    "Even a sloth would be more accurate",
    "Houston, we have a problem",
    "Oops! Try again, champ",
    "Close, but no cigar",
    "Better luck next time!",
    "Are you sure you know the alphabet?",
    "Maybe stick to hunt and peck?",
    "Your fingers are faster than your brain",
    "That's one way to do it... wrong",
    "Practice makes perfect (eventually)",
    "The keyboard is not your enemy",
    "Take a deep breath and try again"
];

// Fail animation effects
const failAnimations = [
    'shake',
    'bounce',
    'wobble', 
    'pulse',
    'flip',
    'slide-left',
    'slide-right'
];

// Comic book style angles for quotes (in degrees)
const comicAngles = [-8, -5, -3, 3, 5, 8, -12, 12, -2, 2];

let lastQuoteIndex = -1;
let lastAnimationIndex = -1;

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
    
    // Select 2 random words to swap (not first, last, or adjacent)
    let index1, index2;
    do {
        index1 = Math.floor(Math.random() * (15 - 2)) + 1; // 1 to 13
        index2 = Math.floor(Math.random() * (15 - 2)) + 1; // 1 to 13
    } while (index1 === index2 || Math.abs(index1 - index2) === 1);
    
    swappedPair = [index1, index2];
    
    // Create visual array with swapped positions
    visualWords = [...currentWords];
    [visualWords[index1], visualWords[index2]] = [visualWords[index2], visualWords[index1]];
    
    displayWords();
}

function displayWords() {
    wordsContainer.innerHTML = '';
    visualWords.forEach((word, wordIndex) => {
        const wordElement = document.createElement('span');
        wordElement.className = 'word';
        wordElement.setAttribute('data-word-index', wordIndex);
        
        // Add swapped highlighting
        if (swappedPair && swappedPair.includes(wordIndex)) {
            wordElement.classList.add('swapped');
        }
        
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
    // Block input when modals are active
    if (document.getElementById('overlay').classList.contains('active')) {
        return;
    }
    
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
    
    // Trigger animation on first keystroke of swapped word
    if (currentCharIndex === 0 && swappedPair && swappedPair.includes(currentWordIndex)) {
        triggerWordSwapAnimation();
    }
    
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
        
        // Check if this is a swap-related error
        let isSwapError = false;
        if (swappedPair && swappedPair.includes(currentWordIndex)) {
            // Get the swapped word (the other word in the pair)
            const swappedWordIndex = swappedPair.find(index => index !== currentWordIndex);
            const swappedWord = currentWords[swappedWordIndex];
            
            // Check if typed character matches the same position in the swapped word
            if (currentCharIndex < swappedWord.length && typedChar === swappedWord[currentCharIndex]) {
                isSwapError = true;
            }
        }
        
        // Store error details
        lastError = {
            word: currentWord,
            wordIndex: currentWordIndex,
            charIndex: currentCharIndex,
            expected: expectedChar,
            typed: typedChar,
            type: isSwapError ? 'swap_confusion' : 'wrong_character'
        };
        
        // Immediate failure on mistake
        const failMessage = isSwapError ? 
            'Watch out for the swap! You typed from the wrong position.' : 
            'You typed the wrong character!';
        showFailScreen(failMessage);
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

function triggerWordSwapAnimation() {
    if (!swappedPair) return;
    
    const [index1, index2] = swappedPair;
    const word1 = document.querySelector(`[data-word-index="${index1}"]`);
    const word2 = document.querySelector(`[data-word-index="${index2}"]`);
    
    if (!word1 || !word2) return;
    
    // Add gliding class for animation
    word1.classList.add('gliding');
    word2.classList.add('gliding');
    
    // Remove yellow highlighting immediately
    word1.classList.remove('swapped');
    word2.classList.remove('swapped');
    
    // Trigger the visual content swap with animation
    setTimeout(() => {
        // Swap the actual displayed content back to correct order
        const word1Content = currentWords[index1];
        const word2Content = currentWords[index2];
        
        // Clear and rebuild the word elements with correct content
        word1.innerHTML = '';
        word2.innerHTML = '';
        
        // Rebuild word1 with correct content
        word1Content.split('').forEach((char, charIndex) => {
            const charElement = document.createElement('span');
            charElement.className = 'char';
            charElement.textContent = char;
            charElement.setAttribute('data-char-index', charIndex);
            word1.appendChild(charElement);
        });
        
        // Rebuild word2 with correct content
        word2Content.split('').forEach((char, charIndex) => {
            const charElement = document.createElement('span');
            charElement.className = 'char';
            charElement.textContent = char;
            charElement.setAttribute('data-char-index', charIndex);
            word2.appendChild(charElement);
        });
        
        // Update visual words array to match correct order
        visualWords[index1] = word1Content;
        visualWords[index2] = word2Content;
        
        // Remove animation class and add ex-swapped class for remnant coloring
        word1.classList.remove('gliding');
        word2.classList.remove('gliding');
        word1.classList.add('ex-swapped');
        word2.classList.add('ex-swapped');
        
        // If we're currently on one of the swapped words, mark all typed characters as correct
        // since they were typed during the animation period
        if (currentWordIndex === index1 || currentWordIndex === index2) {
            const currentWordElement = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
            // Mark all characters up to current position as correct
            for (let i = 0; i < currentCharIndex; i++) {
                const charElement = currentWordElement.querySelector(`[data-char-index="${i}"]`);
                if (charElement) {
                    charElement.classList.add('correct');
                }
            }
        }
        
        // Update current position highlighting
        updateCurrentPosition();
        
        swappedPair = null; // Disable further animations
    }, 300); // Match CSS animation duration
}

function finishGame() {
    const finalWpm = calculateWPM();
    
    isGameActive = false;
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
    // Random sarcastic quote selection (avoid consecutive repeats)
    let quoteIndex;
    do {
        quoteIndex = Math.floor(Math.random() * sarcasticQuotes.length);
    } while (quoteIndex === lastQuoteIndex && sarcasticQuotes.length > 1);
    lastQuoteIndex = quoteIndex;
    
    // Random animation selection (avoid consecutive repeats)
    let animationIndex;
    do {
        animationIndex = Math.floor(Math.random() * failAnimations.length);
    } while (animationIndex === lastAnimationIndex && failAnimations.length > 1);
    lastAnimationIndex = animationIndex;
    
    // Display sarcastic quote with random comic book angle
    const sarcasticQuoteElement = document.getElementById('sarcasticQuote');
    const randomAngle = comicAngles[Math.floor(Math.random() * comicAngles.length)];
    sarcasticQuoteElement.textContent = sarcasticQuotes[quoteIndex];
    sarcasticQuoteElement.style.transform = `rotate(${randomAngle}deg)`;
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
        } else if (lastError.type === 'swap_confusion') {
            errorHTML += `You typed <strong>"${lastError.typed}"</strong> instead of <strong>"${lastError.expected}"</strong>`;
            errorHTML += `<br><br><div class="swap-hint">💡 <strong>Swap Effect Hint:</strong> Two words in yellow are actually swapped! Type the other yellow word in its place. </div>`;
        }
        
        errorHTML += '</div>';
        errorDetailsElement.innerHTML = errorHTML;
    } else {
        errorDetailsElement.innerHTML = '';
    }
    
    // Remove any existing animation classes
    failScreen.classList.remove('fail-shake', 'fail-bounce', 'fail-wobble', 'fail-pulse', 'fail-flip', 'fail-slide-left', 'fail-slide-right');
    
    // Show the modal first
    failScreen.classList.add('active');
    victoryScreen.classList.remove('active');
    overlay.classList.add('active');
    
    // Add animation class with slight delay to ensure modal is visible
    setTimeout(() => {
        failScreen.classList.add(`fail-${failAnimations[animationIndex]}`);
    }, 50);
}

function resetGame() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    startTime = null;
    errors = 0;
    totalChars = 0;
    isGameActive = false;
    lastError = null;
    swappedPair = null;
    visualWords = [];
    
    overlay.classList.remove('active');
    victoryScreen.classList.remove('active');
    failScreen.classList.remove('active');
    
    // Clear any remaining ex-swapped classes
    document.querySelectorAll('.word').forEach(word => {
        word.classList.remove('ex-swapped', 'swapped', 'gliding');
    });
    
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
    // Block auto-focus when modals are active
    if (document.getElementById('overlay').classList.contains('active')) {
        return;
    }
    
    if (event.target !== typingInput && event.key.length === 1) {
        typingInput.focus();
    }
});