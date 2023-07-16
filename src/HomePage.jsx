import CustomHeader from "./CustomHeader";
import { Badge, Button, Center, FileButton, Flex, Group, Select, Text, Textarea, Title, TypographyStylesProvider } from "@mantine/core";
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
import { Dropzone } from '@mantine/dropzone';
import { IconBook2, IconPdf, IconUpload, IconX } from "@tabler/icons-react";

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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userSummaryCount, setUserSummaryCount] = useState(0);

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

  // create an use effet to check if the user is logged in
  useEffect(() => {
    if (user) {
      setIsUserLoggedIn(true);
    }
  }, []);

  const [active, setActive] = useState(false);
  const wordCountCalc = (str) => {
    return str.split(" ").length;
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    // alert user to login if they are not logged in
    if (!isUserLoggedIn) {
      alert("Please login to continue");
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
        setUserSummaryCount(wordCountHistory.length);

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

  //create a word count history length check USE EFFECT
  useEffect(() => {
    if (userUid) {
      const db = getFirestore();
      const docRef = doc(db, "users", userUid);

      // Get the existing document data
      const docSnap = getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const wordCountHistory = data.wordCountHistory || [];
          setUserSummaryCount(wordCountHistory.length);
        }
      });
    }
  }, []);

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


  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    setFile(selectedFile);
  };

  return (
    <>
    <Dropzone.FullScreen
    active={true}
    accept={['application/pdf']}
    onDrop={(files) => {
      console.log(files);
      setFile(files[0]);
      setActive(false);
    }}
  >
    <Group position="center" spacing="xl" mih={220} sx={{ pointerEvents: 'none' }}>
      <Dropzone.Accept>
        <IconUpload
          size="3.2rem"
          stroke={1.5}
          color={"black"}
        />
      </Dropzone.Accept>
      <Dropzone.Reject>
        <IconX
          size="3.2rem"
          stroke={1.5}
          color={"black"}
        />
      </Dropzone.Reject>
      <Dropzone.Idle>
        <IconPdf size="3.2rem" stroke={1.5} />
      </Dropzone.Idle>

      <div>
        <Text size="xl" inline>
          Drag images here or click to select files
        </Text>
        <Text size="sm" color="dimmed" inline mt={7}>
          Attach as many files as you like, each file should not exceed 5mb
        </Text>
      </div>
    </Group>
    </Dropzone.FullScreen>
    <div>
      <CustomHeader />
      <Center>
        <Flex direction={"column"}>
          <Flex align={"center"} direction={"column"}>
            <Text fz={20}>Rika</Text>
            <Title>Summarize PDF</Title>
            <Text>Use Rika'AI to generate a PDF summary</Text>
            {isUserLoggedIn && userSummaryCount ? (<Badge color="grape" size="xl" mt={20}>
              {userSummaryCount}/{summaryLimit} summaries
            </Badge>):''}
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
            <IconBook2 size="3.2rem" stroke={1.5} />
                <Title ml={12} fz={26}>
                    Summary
                </Title>
              </Flex>
                <Flex  style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start", // Change from "center" to "flex-start"
                      border: "2px dashed black",
                      borderRadius: "10px",
                      width: "600px",
                      minHeight: "400px",
                      maxHeight: "400px",
                      padding: "10px 20px 10px 20px",
                      overflowY: "scroll",
                    }}>
                
                
                <TypographyStylesProvider>
                    <div dangerouslySetInnerHTML={{ __html: `${summary}` }} />
                </TypographyStylesProvider>

                </Flex>
            </Flex>) :''}

           {summary ? (<Button disabled={isLoading} color="dark">Download Summary</Button>) : ''}


            </Flex>

          </Center>
        </Flex>
      </Center>
    </div>
    </>
  );
};

export default HomePage;
