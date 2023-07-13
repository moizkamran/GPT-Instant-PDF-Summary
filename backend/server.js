import express from 'express';
import fs from 'fs';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function sendToOpenAI(textData) {
  const configuration = new Configuration({
    apiKey: 'OPEN_API_KEY',
  });
  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'summary: ' + textData,
        },
      ],
      max_tokens: 420,
      temperature: 0.5,
      n: 1,
    });

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
  const { text } = req.body;

  try {
    const summary = await sendToOpenAI(text);
    res.json({ summary: summary });
  } catch (error) {
    console.error('Error sending data to OpenAI:', error);
    res.status(500).json({ error: 'Error sending data to OpenAI' });
  }
});

app.listen(3000, () => {
  console.log('🤖 api listening on port 3000');
});
