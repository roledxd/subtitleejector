const fs = require('fs');
const readline = require('readline');
const https = require('https');

// Function to perform HTTP request to fetch URL content
function fetchURLContent(url, outputFile) {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            // Process the VTT content to extract subtitle text
            const subtitleText = extractSubtitle(data);
            
            // Append only the subtitle text to the output file
            fs.appendFile(outputFile, subtitleText, (err) => {
                if (err) {
                    console.error(`Error writing to file: ${outputFile}`);
                } else {
                    console.log(`Content from ${url} appended to ${outputFile}`);
                }
            });
        });
    }).on('error', (err) => {
        console.error(`Error fetching URL ${url}: ${err.message}`);
    });
}

// Function to extract subtitle text from VTT content
function extractSubtitle(data) {
    // Regex to match subtitle text
    const subtitleRegex = /^\d+\n(?:\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}\n)?(.+)/gm;
    
    // Extracting subtitle text using regex
    const matches = data.matchAll(subtitleRegex);
    let subtitleText = '';
    for (const match of matches) {
        subtitleText += match[1].trim() + '\n';
    }

    return subtitleText;
}

// Function to parse the M3U file and fetch contents of URLs
function parseM3UFile(filePath, outputFile) {
    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        console: false
    });

    readInterface.on('line', function(line) {
        if (line.startsWith('http')) {
            fetchURLContent(line, outputFile);
        }
    });
}

// Replace 'subtitles.m3u8' with the path to your M3U file
const filePath = 'subtitles.m3u8';
const outputFileName = 'subtitles.txt'; // Replace with your desired output file name
parseM3UFile(filePath, outputFileName);
