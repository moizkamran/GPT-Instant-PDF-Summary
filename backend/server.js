import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { Configuration, OpenAIApi } from 'openai';
import cors from "cors";

const app = express();
const upload = multer({ dest: 'uploads/' });

const allowedOrigins = ["http://localhost:5173", "https://pdfai-summary.web.app/", "101.53.233.193"];
app.use(cors({
  origin: allowedOrigins,
}));

app.use(express.json());

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

app.get('/statusHealth', (req, res) => {
  res.json({ status: 'healthy' });
});

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

app.listen(process.env.PORT || 8080, () => {
  console.log('🤖 api listening on port 8080');
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).send(errorMessage);
});