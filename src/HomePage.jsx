import CustomHeader from "./CustomHeader";
import { Badge, Button, Center, FileButton, Flex, Select, Text, Textarea, Title } from "@mantine/core";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { auth } from "./Firebase/Firebase";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const fileName = file ? file.name : "";
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vibe, setVibe] = useState(null); // ['formal', 'informal', 'casual
  const [isUploaded, setIsUploaded] = useState(false);
  const [improvePrompt, setImprovePrompt] = useState("");

  // Limits
  const summaryLimit = 100;
  const wordLimit = 1500;

  const viveStyles = [
    { label: "Formal", value: "formal" },
    { label: "Informal", value: "informal" },
    { label: "Casual", value: "casual" },
    { label: "Business", value: "business"},
    { label: "Academic", value: "academic"},
    { label: "Technical", value: "technical"},
    { label: "Medical", value: "medical"},
    { label: "Legal", value: "legal"},
    { label: "Scientific", value: "scientific"},
    { label: "Literary", value: "literary"},
    { label: "Poetic", value: "poetic"},
  ];

  const userJson = localStorage.getItem("user");
  const user = JSON.parse(userJson);

  const userUid = user?.uid;

  console.log(userUid);


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
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setText(response.data.text);
      setIsUploaded(true);
    } catch (error) {
      console.log(error);
      setText("Failed to upload the PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = wordCountCalc(text);

  useEffect(() => {
    if (wordCount > wordLimit) {
      alert("The text is too long. Please upload a shorter PDF");
    }
  }, [text]);

  const summarizeText = async () => {
    try {
      const response = await axios.post("http://localhost:3000/summary", { text, vibe });
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
        wordCountHistory.push({ wordCount: wordCount, timestamp: new Date(), text: summary });

        // Check the length of word count history
        if (wordCountHistory.length > summaryLimit) {
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


  const improveText = async () => {
    try {
      const response = await axios.post("http://localhost:3000/improve", { summary: summary, improvement: improvePrompt });
      setSummary(response.data.summary);
      console.log(response.data.summary);
    } catch (error) {
      console.log("Error improve the text:", error);
      setSummary("Failed to improve the text");
    }
  };

  const handleImprovement = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      // Check word count history before summarizing
      const shouldProceed = await checkWordCountHistory();

      if (shouldProceed) {
        await improveText();
      } else {
        setIsLoading(false);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  function logout() {
    auth
      .signOut()
      .then(function () {
        // Logout successful. You can perform any additional tasks or redirection here.
        console.log("User logged out");
        navigate("/"); // Navigate to the root route
      })
      .catch(function (error) {
        // An error occurred while logging out.
        console.log("Logout error:", error);
      });
  }

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    setFile(selectedFile);
  };

  return (
    <div>
      <CustomHeader />
      <Center>
        <Flex direction={"column"}>
          <Flex align={"center"} direction={"column"}>
            <Text fz={20}>Rika</Text>
            <Title>Summarize PDF</Title>
            <Text>Use Rika'AI to generate a PDF summary</Text>
          </Flex>
          <Center mt={50}>
            <Flex gap={30} direction={"column"}> 
            <Flex gap={10} direction={"column"}>
              <Flex gap={20}>
              <Title ml={12} fz={22}>
                {" "}
                1: Select your PDF File{" "}
              </Title>
            {isUploaded ? (
              <Badge color={wordCount <= wordLimit ? "green" : "red"} variant="light">
                {wordCount}/{wordLimit} words
              </Badge>
            ) : (
              ""
            )}
              </Flex>
             
              <form
                onSubmit={handleUpload}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: "2px dashed black",
                  borderRadius: "10px",
                  width: "600px",
                  height: "45px",
                  display: "flex",
                  padding: "10px 20px 10px 20px",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  justifyItems: "center",
                }}
              >
         
                    <Text>
                      {fileName ? (fileName.length > 50 ? fileName.substring(0, 50) + "..." : fileName) : "Drag or Upload the PDF to be summarized"}
                    </Text>
                    <div style={{flex: 1}}></div>

                    {(file === null || isUploaded) && (
                      <FileButton onChange={(selectedFile) => {
                        setFile(selectedFile);
                        setIsUploaded(false);
                      }} accept="application/pdf" bg="black">
                        {(props) => (
                          <Button {...props}>
                            {isUploaded ? "Reselect PDF" : "Select PDF"}
                          </Button>
                        )}
                      </FileButton>
                    )}

                    {fileName && !isUploaded && (
                      <Button
                        type="submit"
                        loading={isLoading}
                        disabled={isLoading}
                        variant="outline"
                        color="dark"
                      >
                        Upload
                      </Button>
                    )}

              </form>
             
            </Flex>
           {isUploaded ? ( <Flex gap={10} direction={"column"}>
              <Title ml={12} fz={22}>
                {" "}
                2: Select your vibe {" "}
              </Title>
                <Flex   style={{
                      display: "flex",
                      flexDirection: "row",
                      border: "2px dashed black",
                      borderRadius: "10px",
                      width: "600px",
                      height: "45px",
                      padding: "10px 20px 10px 20px",
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      justifyItems: "center",
                    }}>
                    <Select

                      value={vibe}
                      onChange={(value) => setVibe(value)}
                      styles={{
                        root: {
                          border: "none !important",
                          borderRadius: "10px",
                        },
                        item: {
                          // applies styles to selected item
                          '&[data-selected]': {
                            '&, &:hover': {
                              backgroundColor: "black",
                              color: "white",
                            },
                          },
                
                          // applies styles to hovered item (with mouse or keyboard)
                          '&[data-hovered]': {},
                        },
                      }}
                      data={viveStyles}
                      placeholder="Select your vive"
                    /> <div style={{flex: 1}}></div>
                     { vibe ? ( <Button
                onClick={handleSummarize}
                loading={isLoading}
                disabled={isLoading}
                color="dark"
              >
                Summarize
              </Button>) :''}
                </Flex>
            </Flex>):''}

            {summary ? (<Flex gap={10} direction={"column"}>
              <Title ml={12} fz={22}>
                {" "}
                3: Improve Summary{" "}
              </Title>
              <Flex
                style={{
                  display: "flex",
                      flexDirection: "row",
                      border: "2px dashed black",
                      borderRadius: "10px",
                      width: "600px",
                      height: "45px",
                      padding: "10px 20px 10px 20px",
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      justifyItems: "center",
                }}
              >
  
                 <Textarea
                    value={improvePrompt}
                    onChange={(event) => setImprovePrompt(event.currentTarget.value)}
                    placeholder="Enter in words or phrases to improve the summary"
                    w={"80%"}
                    style={{
                      border: "none !important",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{flex: 1}}></div>
                     { improvePrompt ? ( <Button
                onClick={handleImprovement}
                loading={isLoading}
                disabled={isLoading}
                color="dark"
              >
                Improve
              </Button>) :''}
              </Flex>
            </Flex>): ''}
            
            { summary ? (<Flex gap={10} direction={"column"}>
              <Flex gap={20} align={'center'}>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-writing" width="50" height="50" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z"></path>
                <path d="M16 7h4"></path>
                <path d="M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3"></path>
              </svg>
                <Title ml={12} fz={26}>
                    Summary
                </Title>
              </Flex>
                <Flex  style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      border: "2px dashed black",
                      borderRadius: "10px",
                      width: "600px",
                      height: "400px",
                      padding: "10px 20px 10px 20px",
                      overflow: "hidden",
                    }}>
                

                  <Textarea
                    value={summary}
                    readOnly
                    w={"100%"}
                    h={"100%"}
                    autosize
                    maxRows={17}
                  />

                </Flex>
            </Flex>) :''}

           <Button color="dark">Download Summary</Button>


            </Flex>

          </Center>
        </Flex>
      </Center>
    </div>
  );
};

export default HomePage;
