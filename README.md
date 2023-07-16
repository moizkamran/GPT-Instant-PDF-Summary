# Summarize PDF App

This is a web application that allows you to upload a PDF file and generate a summary of its content using OpenAI's GPT-3.5-turbo language model. The app is built using Express.js on the backend and React.js on the frontend.

## Backend

The backend code is written in JavaScript using the Express.js framework. It utilizes several libraries including `fs` for file system operations, `multer` for handling file uploads, `pdf.js-extract` for extracting text from PDF files, and `openai` for communicating with the OpenAI API.

The backend server provides three API endpoints:

1. `/api/upload` (POST): This endpoint receives a PDF file and extracts the text content from it using `pdf.js-extract`. The extracted text is then returned as a response.

2. `/api/summary` (POST): This endpoint takes a text input and sends it to the OpenAI API using the `openai` library. The OpenAI API generates a summary of the input text using the GPT-3.5-turbo model, and the summary is returned as a response.

3. `/api/improve` (POST): This endpoint takes a summary and an improvement style and sends them to the OpenAI API. The API improves the summary in the requested style and returns the improved summary as a response.

## Frontend

The frontend code is written in JavaScript using React.js. It uses several libraries including `axios` for making HTTP requests, `framer-motion` for animation effects, and `react-type-animation` for animating the summary text.

The frontend provides a user interface for uploading a PDF file, extracting its text content, and generating/improving the summary. The UI includes a drag-and-drop area for file upload and buttons for triggering the upload and summarization processes. The extracted text and generated/improved summary are displayed on the screen.

## Usage

To run the app locally, follow these steps:

1. Install the required dependencies by running `npm install` in both the root directory and the `backend` directory.

2. Replace `'YOU_OPENAPI_KEY'` in the backend code with your actual OpenAI API key.

3. Start the backend server by running `node server.js` in the root directory.

4. Start the frontend development server by running `npm run dev` in the `root` directory.

5. Access the app in your browser at `http://localhost:3000`.

Note: Make sure you have Node.js and npm installed on your machine.

## Deployment to Firebase Hosting

To deploy the app to Firebase Hosting, follow these steps:

1. Build the app by running `npm run build` in the root directory.

2. Initialize Firebase in your project by running `firebase init` in the root directory.

3. Select the Firebase features you want to use. For hosting, choose the "Hosting" option using the arrow keys and press Enter.

4. Select the Firebase project you want to deploy to.

5. Specify the public directory as `dist` when prompted.

6. Choose "No" for configuring as a single-page app (SPA) when prompted.

7. DONT Overwrite the existing `index.html` file when asked.

8. Run `firebase deploy` to deploy the app to Firebase Hosting.

9. Once the deployment is complete, you will receive a hosting URL where your app is deployed.

Note: Make sure you have the Firebase CLI installed globally by running `npm install -g firebase-tools`.

Please note that the code provided assumes a basic understanding of Express.js, React.js, and the mentioned libraries. You may need to customize the code according to your specific requirements and environment.
