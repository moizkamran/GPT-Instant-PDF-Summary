const express = require('express');
const multer = require('multer');
const { PDFExtract } = require('pdf.js-extract');
const { Configuration, OpenAIApi } = require('openai');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');
const cors = require("cors");
var serviceAccount = require("./serviceAccountKey.json");
const fs = require('fs');
const readline = require('readline');
const assert = require('assert')
const OAuth2 = google.auth.OAuth2;
const app = express();
const upload = multer({ dest: 'uploads/' });

const allowedOrigins = ["http://localhost:5173", "https://rika-1.web.app/", "101.53.233.193"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

// Set the redirect URL for the OAuth callback
const redirectUrl = 'http://localhost:3000/oauth2callback';

app.get('/', (req, res) => {
  // Display the main page with an "Authorize" link
  res.send(`<a href="${getAuthUrl()}">Authorize with YouTube</a>`);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    // Handle the OAuth callback
    try {
      const content = fs.readFileSync('./client_secret.json');
      const credentials = JSON.parse(content);
      const auth = authorize(credentials);
      await getAccessToken(auth, code);
      res.send('Authentication successful! You can now close this window.');
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      res.status(500).send('Error handling OAuth callback');
    }
  } else {
    res.status(400).send('Bad Request: OAuth code missing in query parameters');
  }
});

app.post('/uploadToYouTube', upload.single('videoFile'), async (req, res) => {
  const { videoTitle, videoDescription } = req.body;
  const { path } = req.file; // The path to the temporary uploaded file

  try {
    // Load client secrets from a local file.
    const content = fs.readFileSync('./client_secret.json');
    const credentials = JSON.parse(content);

    // Authorize a client with the loaded credentials
    const auth = authorize(credentials);

    // Upload the video to YouTube
    const tags = ['tag1', 'tag2', 'tag3']; // Replace with the actual tags you want to use
    await uploadVideo(auth, videoTitle, videoDescription, tags, path);

    res.json({ success: true, message: 'Video upload Successfull', videoId });
  } catch (error) {
    console.error('Error uploading video to YouTube:', error);
    res.status(500).json({ success: false, error: 'Error uploading video to YouTube' });
  }
});

/**
 * Create an OAuth2 client with the given credentials.
 *
 * @param {Object} credentials The authorization client credentials.
 * @returns {google.auth.OAuth2} The authorized OAuth2 client.
 */
function authorize(credentials) {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  try {
    const token = fs.readFileSync('./client_oauth_token.json');
    oauth2Client.setCredentials(JSON.parse(token));
    return oauth2Client;
  } catch (err) {
    getAccessToken(oauth2Client);
    return oauth2Client;
  }
}

function getAuthUrl() {
  const credentials = JSON.parse(fs.readFileSync('./client_secret.json'));
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  return authUrl;
}

/**
 * Get and store access token and refresh token after exchanging the authorization code.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
async function getAccessToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', async function(code) {
    rl.close();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    storeToken(tokens);
  });
}

/**
 * Store token to disk to be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  fs.writeFile('./client_oauth_token.json', JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to client_oauth_token.json');
  });
}

/**
 * Upload the video file to YouTube.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} title The title of the video.
 * @param {string} description The description of the video.
 * @param {Array} tags An array of tags for the video.
 * @param {string} path The path to the temporary uploaded video file.
 */
function uploadVideo(auth, title, description, tags, path) {
  const service = google.youtube('v3');

  service.videos.insert({
    auth: auth,
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: 27, // Replace with the desired category ID
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: {
        privacyStatus: 'private', // Change the privacy status as needed
      },
    },
    media: {
      body: fs.createReadStream(path),
    },
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      throw err;
    }
    console.log('Video uploaded. Video ID:', response.data.id);
    resolve(response.data.id);
  });
}

// -----------------------------------------------------------------------
async function sendToOpenAI(textData, vibe) {
  const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);
  console.log('Sending to OpenAI:', vibe);

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Summarize the text in html text format only in  <h1> <h2> <h3> and  <p> and <li> tags dont include any thing else MAXIMUM 400 words REMOVE any content which would not be relavent in a summary. DO NOT JUST OUTPUT THE SAME PDF HAVE MAXIMUM OF 3 HEADINGS !!!Summarize the text in the style of:' + vibe + 'heres the text:' + textData,
        },
      ],
      max_tokens: 600,
      temperature: 0.9,
      n: 1,
    });
    // console.log('OpenAI API Response:', response.messages[0].content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.response.data);
    throw error;
  }
}

async function improveSummary(summary, improvement) {
  const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);
  console.log('Sending to OpenAI:', improvement);

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Output in html text format only in  <h1> <h2> <h3> and  <p> and <li> tags dont include any thing else. Improve the following summary in the style of: ' + improvement + '----- heres the summary: ' + summary,
        },
      ],
      max_tokens: 700,
      temperature: 1.5,
      n: 1,
    });
    // console.log('OpenAI API Response:', response.messages[0].content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.response.data);
    throw error;
  }
}

app.post('/upload', upload.single('pdf'), async (req, res) => {
  const { path } = req.file;

  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(path);
    const pages = data.pages || [];

    let textData = '';
    for (const page of pages) {
      for (const content of page.content) {
        if (content.str) {
          textData += content.str + '\n';
        }
      }
    }

    res.json({ text: textData });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Error parsing PDF' });
  }
});

app.post('/summary', async (req, res) => {
  const { text, vibe } = req.body;

  try {
    const summary = await sendToOpenAI(text, vibe);
    res.json({ summary: summary });
  } catch (error) {
    console.error('Error sending data to OpenAI:', error);
    res.status(500).json({ error: 'Error sending data to OpenAI' });
  }
});

app.post('/improve', async (req, res) => {
  const { summary, improvement } = req.body;

  try {
    const improvedSummary = await improveSummary(summary, improvement);
    res.json({ summary: improvedSummary });
  } catch (error) {
    console.error('Error improving summary with OpenAI:', error);
    res.status(500).json({ error: 'Error improving summary with OpenAI' });
  }
});

app.listen(3000, () => {
  console.log('🤖 api listening on port 3000');
});
