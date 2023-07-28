import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { Configuration, OpenAIApi } from 'openai';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import cors from "cors";

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

const youtube = google.youtube({
  version: 'v3',
  auth: 'Bearer AIzaSyDwFPb9MMC8NIxM4CYQzWe_Xr_oelpc2Pc', // Replace with your API key
});

const CLIENT_ID = 'AIzaSyCWswjh801ZPdVJIBSrc2iTct4ZGeAHy8A'; // Replace with your Firebase client ID

app.post('/uploadToYouTube', upload.single('videoFile'), async (req, res) => {
  const { videoTitle, videoDescription } = req.body;
  const { path } = req.file; // The path to the temporary uploaded file

  try {
    // Verify the user's access token using the OAuth2Client
    const authClient = new OAuth2Client(CLIENT_ID);
    const token = req.header('Authorization').split(' ')[1];
    const ticket = await authClient.verifyIdToken({
      idToken: token,
    });
    const userId = ticket.getPayload().sub;
    // If required, you can check if the userId matches the user who is allowed to upload videos.

    const response = await youtube.videos.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
        },
      },
      media: {
        body: fs.createReadStream(path), // Use the 'path' variable here
      },
    });

    const videoId = response.data.id;
    res.json({ success: true, videoId });
  } catch (error) {
    console.error('Error uploading video to YouTube:', error);
    res.status(500).json({ success: false, error: 'Error uploading video to YouTube' });
  }
});


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
