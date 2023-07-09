# Summarize PDF App

This is a web application that allows you to upload a PDF file and generate a summary of its content using OpenAI's GPT-3.5-turbo language model. The app is built using Express.js on the backend and React.js on the frontend.

## Backend

The backend code is written in JavaScript using the Express.js framework. It utilizes several libraries including `fs` for file system operations, `multer` for handling file uploads, `pdf.js-extract` for extracting text from PDF files, and `openai` for communicating with the OpenAI API.

The backend server provides two API endpoints:

1. `/upload` (POST): This endpoint receives a PDF file and extracts the text content from it using `pdf.js-extract`. The extracted text is then returned as a response.

2. `/summary` (POST): This endpoint takes a text input and sends it to the OpenAI API using the `openai` library. The OpenAI API generates a summary of the input text using the GPT-3.5-turbo model, and the summary is returned as a response.

## Frontend

The frontend code is written in JavaScript using React.js. It uses several libraries including `axios` for making HTTP requests, `framer-motion` for animation effects, and `react-type-animation` for animating the summary text.

The frontend provides a user interface for uploading a PDF file, extracting its text content, and generating a summary. The UI includes a drag-and-drop area for file upload and buttons for triggering the upload and summarization processes. The extracted text and generated summary are displayed on the screen.

## Usage

To run the app locally, follow these steps:

1. Install the required dependencies by running `npm install` in both the root directory and the `client` directory.

2. Replace `'YOU_OPENAPI_KEY'` in the backend code with your actual OpenAI API key.

3. Start the backend server by running `npm start` in the root directory.

4. Start the frontend development server by running `npm start` in the `client` directory.

5. Access the app in your browser at `http://localhost:3000`.

Note: Make sure you have Node.js and npm installed on your machine.

Please note that the code provided assumes a basic understanding of Express.js, React.js, and the mentioned libraries. You may need to customize the code according to your specific requirements and environment.
