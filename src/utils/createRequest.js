import axios from "axios";

const baseURL = process.env.NODE_ENV === "production"
 ? "https://pdfai.up.railway.app/"
  : "http://localhost:8080/"

  console.log('%c⚙️ Server running in ', 'color: orange; font-weight: bold; background-color: black; padding: 4px;', process.env.NODE_ENV + ' mode');


const newRequest = axios.create({
  baseURL
});

export default newRequest;
