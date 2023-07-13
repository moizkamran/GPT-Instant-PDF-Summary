import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./Firebase/Firebase";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getFirestore, collection, doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";


import './flairs.css'
import { TypeAnimation } from "react-type-animation";

const GptFile = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const wordLimit = 1500;

    const userJson = localStorage.getItem("user");
    const user = JSON.parse(userJson);
    const userUid = user.uid;
    console.log(userUid);
    
    

    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
    };
    
    const wordCountCalc = (str) => {
      return str.split(" ").length;
    };
  
    const handleUpload = async (event) => {
      event.preventDefault();
  
      if (!file) {
        return;
      }
  
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append("pdf", file);
  
      try {
        const response = await axios.post("http://localhost:3000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setText(response.data.text);
        
      } catch (error) {
        console.log(error);
        setText("Failed to upload the PDF");
      } finally {
        setIsLoading(false);
      }
    };
    const wordCount = wordCountCalc(text);
    // create a fucntion which counts the amount of words in the text

  

    useEffect(() => {
      if (wordCount > wordLimit) {
        alert("The text is too long. Please upload a shorter PDF");
        setText("");
      }
    }, [text]);
  
    const summarizeText = async () => {
      try {
        const response = await axios.post("http://localhost:3000/summary", { text });
        setSummary(response.data.summary);
        console.log(response.data.summary);
      } catch (error) {
        console.log("Error summarizing the text:", error);
        setSummary("Failed to summarize the text");
      }
    };
    
    const checkWordCountHistory = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", userUid);
    
        // Get the existing document data
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const wordCountHistory = data.wordCountHistory || [];
          // console.log("Word count history:", wordCountHistory);
          wordCountHistory.push({ wordCount: wordCount, timestamp: new Date(), text: summary });
    
          // Check the length of word count history
          if (wordCountHistory.length > 4) {
            // Display the popup and block functionality
            alert("Subscription required to continue summarizing.");
            return false;
          }
    
          await updateDoc(docRef, {
            wordCountHistory: wordCountHistory,
          });
        } else {
          await setDoc(docRef, {
            wordCount: wordCount,
            wordCountHistory: [{ wordCount: wordCount, timestamp: new Date(), text: summary }],
            createdAt: new Date(),
          });
        }
    
        return true;
      } catch (error) {
        console.log("Error saving to Firestore:", error);
        return false;
      }
    };
    
    const handleSummarize = async (event) => {
      event.preventDefault();
    
      setIsLoading(true);
    
      try {
        // Check word count history before summarizing
        const shouldProceed = await checkWordCountHistory();
    
        if (shouldProceed) {
          await summarizeText();
        } else {
          setIsLoading(false);
          return;
        }
    
        // Continue with other logic if necessary
        // ...
      } finally {
        setIsLoading(false);
      }
    };
    





    function logout() {
      auth
        .signOut()
        .then(function () {
          // Logout successful. You can perform any additional tasks or redirection here.
          console.log('User logged out');
          navigation.navigate('/'); // Navigate to the root route
        })
        .catch(function (error) {
          // An error occurred while logging out.
          console.log('Logout error:', error);
        });
    }
  
  
    
  return (
<div>

<div style={{padding: '0px 20px 0px 20px', display: 'flex', flexDirection: 'row', alignContent:'center', alignItems: 'center', gap: 20, backgroundColor: 'black'}}>
  <div style={{width: 50}}>
    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"></path>
    </svg>
  </div>
  <h1 style={{marginLeft: '10px'}}>Summarize PDF</h1>
 <button onClick={logout} >logout</button>
</div>

    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: 'white', color: 'black', padding: 20, gap: 20 }}>
      <form onSubmit={handleUpload} 
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed lightblue", borderRadius: "25px", padding: "2rem", width: "100vh", height: "300px"}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center"  }}>
          <svg fill="none" stroke="currentColor" strokeWidth="0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: "50px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
          <h3 style={{ marginLeft: "1rem" }}>Drag or Upload the PDF to be summarized</h3>
        </div>
        <input type="file" onChange={handleFileChange} accept=".pdf" style={{ marginBottom: "1rem" }} />
  {file ? (      <button type="submit" style={{ alignSelf: "flex-end" }}>Upload</button>): ''}
      </form>
      <AnimatePresence key={text.length}>
      {isLoading &&   <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ textAlign: "center", backgroundColor: 'darkblue', padding: 20, borderRadius: 25  }}
            key="loading"
          >
            
        <svg fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"></path>
        </svg>
        <p style={{color: 'white', fontWeight: 700}}>Summarizing...</p>
        </motion.div>}
      {text && (
        <motion.div 
        key="text" // Add a unique key for the extracted text component
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "10px",border: '5px solid darkblue' , borderRadius: 25, padding: 10}}>
          <h2 style={{ marginBottom: "1rem" }}>Extracted Text</h2>
          <p style={{ textAlign: "center" }}>{text}</p>
          <button onClick={handleSummarize} style={{ marginTop: "1rem", backgroundColor: 'darkblue'}}>Summarize</button>
          <div style={{backgroundColor: 'lightblue', borderRadius: 25, padding:20, marginTop: 20}}><p>{wordCount}/{wordLimit}</p></div>
        </motion.div>
      )}
      {summary && !isLoading && (
        <motion.div 
        key="summary" // Add a unique key for the summary text component
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",  backgroundColor: 'black',  boxShadow: "0px 0px 5px 1px rgba(0,0,0,0.2)" ,
        marginTop: "2rem",  padding: 20, borderRadius: 25, color: 'white'}}>
          <h2 style={{ marginBottom: "1rem" }}>Summary</h2>
          <div>
          <TypeAnimation
  style={{ whiteSpace: 'pre-line', height: '195px', display: 'block' }}
  sequence={[
    `${summary}`, // actual line-break inside string literal also gets animated in new line, but ensure there are no leading spaces
    1000,
  ]}
  repeat={Infinity}
  speed={75}
/>
</div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
</div>
  )
}

export default GptFile