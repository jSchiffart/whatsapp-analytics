# WhatsApp Analytics

A comprehensive Node.js package for analyzing WhatsApp chat exports. Extract insights, statistics, and patterns from your conversations with ease.

[![npm version](https://img.shields.io/npm/v/whatsapp-analytics.svg)](https://www.npmjs.com/package/whatsapp-analytics)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 📊 Parse and organize WhatsApp chat exports
- 👥 Track conversation patterns by author
- 📅 Analyze messages by date and time
- 📝 Generate word frequency statistics
- ⏱️ Calculate conversation duration and activity metrics
- 😀 Track emoji usage patterns
- 🔍 Extract specific messages and conversations

## Installation

```bash
npm install whatsapp-analytics
```

## Quick Start

```javascript
const whatsappAnalytics = require('whatsapp-analytics');

// Load and organize chat texts
const texts = whatsappAnalytics.getTexts('path/to/whatsapp-chat.txt');
const organizedTexts = whatsappAnalytics.organizeTexts(texts);

// Get basic statistics
const authors = whatsappAnalytics.getAuthors(organizedTexts);
console.log(`This conversation includes ${authors.length} participants:`, authors);

// Get message count by author
authors.forEach(author => {
  const authorTexts = whatsappAnalytics.getTextsByAuthor(author, organizedTexts);
  console.log(`${author}: ${authorTexts.length} messages`);
});

// Track conversation duration
const duration = whatsappAnalytics.getTotalTimeTexting(organizedTexts, 'days');
console.log(`This conversation spans ${duration.toFixed(2)} days`);

// Find most frequently used words
const wordFrequency = whatsappAnalytics.getWordFrequency(organizedTexts);
const sortedWords = Object.entries(wordFrequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log('Most common words:', sortedWords);
```

## WhatsApp Export Format

This package is designed to work with the standard WhatsApp chat export format. To export your chats:

1. Open the chat in WhatsApp
2. Tap the menu button (three dots)
3. Select "More" → "Export chat"
4. Choose "Without media"
5. Save or share the exported text file

The exported format looks like this:

```
3/6/24, 09:16 - John Smith: Hey everyone!
3/6/24, 09:18 - Sarah Johnson: Hi John! Great idea 😊
```

## API Reference

### File Handling Functions

#### `getRawTexts(filePath)`

Reads a WhatsApp chat export file and returns the raw, unprocessed lines.

**Parameters:**
- `filePath` (string): Path to the WhatsApp chat export file

**Returns:**
- Array of strings, each representing a line from the chat file

#### `getTexts(filePath)`

Reads a WhatsApp chat export file and returns cleaned text lines with empty lines removed.

**Parameters:**
- `filePath` (string): Path to the WhatsApp chat export file

**Returns:**
- Array of strings, each representing a cleaned line from the chat file

### Text Processing Functions

#### `cleanText(text)`

Cleans a text line by removing newlines and trimming whitespace.

**Parameters:**
- `text` (string): Text to clean

**Returns:**
- Cleaned text string

#### `parseText(text)`

Parses a line of text into date/time, author, and message components.

**Parameters:**
- `text` (string): Line to parse

**Returns:**
- Array containing [date/time, author, text] or [null, null, text] if the line doesn't match the WhatsApp format

#### `convertDateToDatetime(date)`

Converts a WhatsApp date string to a JavaScript Date object.

**Parameters:**
- `date` (string): Date string in the format 'MM/DD/YY, HH:MM'

**Returns:**
- JavaScript Date object

#### `organizeTexts(texts)`

Organizes texts by grouping multi-line messages and skipping empty lines.

**Parameters:**
- `texts` (Array<string>): Array of text lines from the chat

**Returns:**
- Array of organized messages, each being an array with [date, author, text]

### Chat Analysis Functions

#### `getAuthors(texts)`

Returns a list of all unique authors in the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Array of strings with unique author names

#### `getTextsByAuthor(author, texts)`

Returns a list of all messages by a specific author.

**Parameters:**
- `author` (string): Author name to filter by
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Array of message arrays filtered to only include the specified author

#### `getTextNumber(index, texts)`

Returns the text at the specified index.

**Parameters:**
- `index` (number): Index of the text to retrieve
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Array containing [date, author, text] at the specified index

#### `getFirstTextDate(texts)`

Returns the date of the first text in the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- JavaScript Date object representing the first message's date and time

#### `getLastTextDate(texts)`

Returns the date of the last text in the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- JavaScript Date object representing the last message's date and time

#### `getTextsFromDate(date, texts)`

Returns all texts from a specific date.

**Parameters:**
- `date` (Date): Date object to filter by
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Array of message arrays filtered to only include messages from the specified date

#### `getTotalTimeTexting(texts, format)`

Calculates the total time span of the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`
- `format` (string): Time format to return the result in ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')

**Returns:**
- Number representing the time span in the specified format

#### `getFrequencyWords(texts)`

Gets all words used in the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Array of all words used in the conversation

#### `getWordFrequency(texts)`

Counts the frequency of words in the conversation.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Object mapping words to their frequency counts

#### `getEmojiUsage(texts)`

Gets emoji usage statistics from texts.

**Parameters:**
- `texts` (Array<Array>): Organized texts from `organizeTexts()`

**Returns:**
- Object mapping emojis to their frequency counts

## Constants

The package defines the following constants for accessing message components:

- `DATE_TIME = 0`: Index for the date/time component in organized message arrays
- `AUTHOR = 1`: Index for the author component in organized message arrays
- `TEXT = 2`: Index for the text component in organized message arrays

## Advanced Usage Examples

### Find Messages Containing Specific Keywords

```javascript
function findMessagesWithKeyword(keyword, texts) {
  return texts.filter(message => 
    message[2].toLowerCase().includes(keyword.toLowerCase())
  );
}

const keywordTexts = findMessagesWithKeyword('meeting', organizedTexts);
console.log(`Found ${keywordTexts.length} messages containing "meeting"`);
```

### Track Message Activity by Time of Day

```javascript
function getMessagesByHourOfDay(texts) {
  const hourCounts = Array(24).fill(0);
  
  texts.forEach(message => {
    const hour = message[0].getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts;
}

const hourlyActivity = getMessagesByHourOfDay(organizedTexts);
console.log('Messages by hour of day:', hourlyActivity);
```

### Analyze Response Times

```javascript
function getAverageResponseTime(author1, author2, texts) {
  let totalResponseTime = 0;
  let responseCount = 0;
  let lastMessage = null;
  
  for (const message of texts) {
    const currentAuthor = message[1];
    const currentTime = message[0];
    
    if (lastMessage && 
        ((currentAuthor === author2 && lastMessage[1] === author1) ||
         (currentAuthor === author1 && lastMessage[1] === author2))) {
      const responseTime = (currentTime - lastMessage[0]) / 1000; // in seconds
      totalResponseTime += responseTime;
      responseCount++;
    }
    
    lastMessage = message;
  }
  
  return responseCount > 0 ? totalResponseTime / responseCount : 0;
}

const avgResponseTime = getAverageResponseTime('John Smith', 'Sarah Johnson', organizedTexts);
console.log(`Average response time between John and Sarah: ${avgResponseTime.toFixed(2)} seconds`);
```

## Dependencies

- [moment.js](https://momentjs.com/) - For handling date and time operations
- [node-emoji](https://github.com/omnidan/node-emoji) (optional) - For enhanced emoji detection and analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- WhatsApp for their chat export format
- All contributors who participate in this project