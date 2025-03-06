const fs = require('fs');
const moment = require('moment');

// Constants
const DATE_TIME = 0;
const AUTHOR = 1;
const TEXT = 2;

/**
 * Reads and returns raw, unprocessed lines from the WhatsApp chat export file
 * @param {string} filePath - Path to the WhatsApp chat export file
 * @returns {Array<string>} Array of raw lines from the chat file
 */
function getRawTexts(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split('\n');
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

/**
 * Reads the WhatsApp chat export file and returns pre-cleaned text lines
 * @param {string} filePath - Path to the WhatsApp chat export file
 * @returns {Array<string>} Array of cleaned lines from the chat file
 */
function getTexts(filePath) {
    const rawTexts = getRawTexts(filePath);
    return rawTexts
        .map(text => cleanText(text))
        .filter(text => text.length > 0); // Remove empty lines
}

/**
 * Cleans the text by removing newlines and trimming whitespace
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
    // Remove backspace and any spaces
    return text.replace('\n', '').trim();
}

/**
 * Parses a line of text into date/time, author, and message
 * @param {string} text - Line to parse
 * @returns {Array} Array containing [date/time, author, text] or [null, null, text]
 */
function parseText(text) {
    const match = text.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}) - ([^:]+): (.*)/);
    if (match) {
        return [match[1], match[2], match[3]];
    } else {
        return [null, null, " " + text];
    }
}

/**
 * Converts date string to Date object
 * @param {string} date - Date string in the format 'MM/DD/YY, HH:MM'
 * @returns {Date} Date object
 */
function convertDateToDatetime(date) {
    return moment(date, 'MM/DD/YY, HH:mm').toDate();
}

/**
 * Organizes texts by grouping multi-line messages and skipping empty lines
 * @param {Array<string>} texts - Array of raw text lines
 * @returns {Array<Array>} Array of organized messages [date, author, text]
 */
function organizeTexts(texts) {
    const organizedTexts = [];
    let currentText = null;

    for (const text of texts) {
        // We don't need to clean the texts if using getTexts() directly
        // as they're already cleaned, but keep this check for compatibility
        // with getRawTexts() function
        const cleanedText = typeof text === 'string' && text.includes('\n') ? cleanText(text) : text;
        if (!cleanedText) {
            continue; // Skip empty messages
        }

        const [dateTime, author, data] = parseText(cleanedText);

        if (dateTime) { // Check if date/time, author, and text are successfully separated
            if (currentText) { // Append the current message if exists
                organizedTexts.push(currentText);
            }
            currentText = [convertDateToDatetime(dateTime), author, data]; // Start a new message list
        } else {
            if (currentText) {
                currentText[TEXT] += ' ' + data; // Append to the last message
            }
        }
    }

    if (currentText) {
        organizedTexts.push(currentText); // Append the last message if exists
    }

    return organizedTexts;
}

/**
 * Returns a list with all unique authors
 * @param {Array<Array>} texts - Organized texts
 * @returns {Array<string>} List of authors
 */
function getAuthors(texts) {
    const authorList = [];

    for (const line of texts) {
        if (!authorList.includes(line[AUTHOR])) {
            authorList.push(line[AUTHOR]);
        }
    }

    return authorList;
}

/**
 * Returns list with all texts by a specific author
 * @param {string} author - Author to filter by
 * @param {Array<Array>} texts - Organized texts
 * @returns {Array<Array>} Texts by the specified author
 */
function getTextsByAuthor(author, texts) {
    const authorTexts = [];

    for (const line of texts) {
        if (line[AUTHOR].includes(author)) {
            authorTexts.push(line);
        }
    }

    return authorTexts;
}

/**
 * Returns the text at the specified index
 * @param {number} index - Index of the text to retrieve
 * @param {Array<Array>} texts - Organized texts
 * @returns {Array} The text at the specified index
 */
function getTextNumber(index, texts) {
    return texts[index];
}

/**
 * Returns the date of the first text
 * @param {Array<Array>} texts - Organized texts
 * @returns {Date} Date of the first text
 */
function getFirstTextDate(texts) {
    return texts[0][DATE_TIME];
}

/**
 * Returns the date of the last text
 * @param {Array<Array>} texts - Organized texts
 * @returns {Date} Date of the last text
 */
function getLastTextDate(texts) {
    return texts[texts.length - 1][DATE_TIME];
}

/**
 * Returns all texts from a specific date
 * @param {Date} date - Date to filter by
 * @param {Array<Array>} texts - Organized texts
 * @returns {Array<Array>} Texts from the specified date
 */
function getTextsFromDate(date, texts) {
    const textsFromDate = [];

    for (const line of texts) {
        const lineDate = line[DATE_TIME];
        if (date.getDate() === lineDate.getDate() &&
            date.getMonth() === lineDate.getMonth() &&
            date.getFullYear() === lineDate.getFullYear()) {
            textsFromDate.push(line);
        }
    }

    return textsFromDate;
}

/**
 * Calculates the total time spent texting
 * @param {Array<Array>} texts - Organized texts
 * @param {string} format - Time format (seconds, minutes, hours, days, weeks, months, years)
 * @returns {number} Total time in the specified format
 */
function getTotalTimeTexting(texts, format) {
    const startTime = texts[0][DATE_TIME];
    const endTime = texts[texts.length - 1][DATE_TIME];
    const delta = (endTime - startTime) / 1000; // Convert milliseconds to seconds

    switch (format) {
        case "seconds":
            return delta;
        case "minutes":
            return delta / 60;
        case "hours":
            return delta / (60 * 60);
        case "days":
            return delta / (24 * 60 * 60);
        case "weeks":
            return delta / (7 * 24 * 60 * 60);
        case "months":
            return delta / (30.436875 * 24 * 60 * 60);
        case "years":
            return delta / (365.25 * 24 * 60 * 60);
        default:
            return delta;
    }
}

/**
 * Gets all words used in the conversation
 * @param {Array<Array>} texts - Organized texts
 * @returns {Array<string>} Array of all words used
 */
function getFrequencyWords(texts) {
    const tempWords = [];

    for (const text of texts) {
        const tempText = text[2].split(' ');
        for (const word of tempText) {
            tempWords.push(word);
        }
    }

    return tempWords;
}

/**
 * Counts the frequency of words in the conversation
 * @param {Array<Array>} texts - Organized texts
 * @returns {Object} Object mapping words to their frequency
 */
function getWordFrequency(texts) {
    const words = getFrequencyWords(texts);
    const frequency = {};

    for (const word of words) {
        if (word in frequency) {
            frequency[word]++;
        } else {
            frequency[word] = 1;
        }
    }

    return frequency;
}

/**
 * Gets emoji usage statistics from texts
 * @param {Array<Array>} texts - Organized texts
 * @returns {Object} Object mapping emojis to their frequency
 */
function getEmojiUsage(texts) {
    // Note: For actual emoji parsing, you would need a library like 'node-emoji'
    // This is a placeholder for the functionality
    // You would need to: npm install node-emoji

    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojiCount = {};

    for (const text of texts) {
        const message = text[TEXT];
        const emojis = message.match(emojiRegex) || [];

        for (const emoji of emojis) {
            if (emoji in emojiCount) {
                emojiCount[emoji]++;
            } else {
                emojiCount[emoji] = 1;
            }
        }
    }

    return emojiCount;
}

// Export all functions
module.exports = {
    getRawTexts,
    getTexts,
    cleanText,
    parseText,
    convertDateToDatetime,
    organizeTexts,
    getAuthors,
    getTextsByAuthor,
    getTextNumber,
    getFirstTextDate,
    getLastTextDate,
    getTextsFromDate,
    getTotalTimeTexting,
    getFrequencyWords,
    getWordFrequency,
    getEmojiUsage
};

// Example usage:
// const texts = getTexts('chat.txt'); // Gets pre-cleaned texts
// const rawTexts = getRawTexts('chat.txt'); // Gets raw, unprocessed texts
// const organizedTexts = organizeTexts(texts);
// console.log(organizedTexts);