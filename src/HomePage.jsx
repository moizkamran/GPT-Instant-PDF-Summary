import CustomHeader from "./CustomHeader";
import { ActionIcon, Badge, Button, Center, FileButton, Flex, Group, Input, LoadingOverlay, MultiSelect, Select, Text, TextInput, Textarea, Title, Tooltip, TypographyStylesProvider } from "@mantine/core";
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
import app, { auth } from "./Firebase/Firebase";
import { Dropzone } from '@mantine/dropzone';
import html2pdf from "html2pdf.js";
import { IconBook2, IconDownload, IconPdf, IconReload, IconUpload, IconWritingSign, IconX } from "@tabler/icons-react";
import { getAuth } from "firebase/auth";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const fileName = file ? file.name : "";
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vibe, setVibe] = useState(null); // ['formal', 'informal', 'casual
  console.log(vibe);
  const [isUploaded, setIsUploaded] = useState(false);
  const [improvePrompt, setImprovePrompt] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userSummaryCount, setUserSummaryCount] = useState(0);

  // Limits
  const summaryLimit = 100;
  const wordLimit = 1500;

  const vibeStyles = [
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
    { label: "Poetic", value: "of mahmood darwish"},
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
    setIsUploaded(false);
  };

  
  const downloadSummary = () => {
    const element = document.getElementById("summary"); // Add an id to the summary element
  
    // Customize the content
    const header = document.createElement("div");
    header.innerText = `Summary in the style of ${vibe}`;
    element.insertBefore(header, element.firstChild);
  
    const footer = document.createElement("div");
    footer.innerText = "GENERATED USING RIKA AI";
    element.appendChild(footer);
  
    // Use html2pdf library to convert the HTML element to PDF with custom options
    html2pdf()
    .set({
      margin: [20, 20, 20, 20], // Set top, right, bottom, and left margins (in millimeters)
      filename: `${'RIKA AI '+ fileName + vibe + new Date().toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' })}`, // Set the filename of the downloaded PDF
    })
    .from(element)
    .save()
    .then(() => {
      // Remove the watermark element after the PDF is generated
      header.remove();
      footer.remove();
    });
};

  const handleReset = () => {
    setFile(null);
    setText("");
    setSummary("");
    setIsUploaded(false);
    setImprovePrompt("");
  };

  const [tags, setTags] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  const handleYTUpload = async () => {
    event.preventDefault();
    try {
      // Get the user's access token from Firebase Auth
      const user = auth.currentUser;
      if (!user) {
        console.log("User not logged in.");
        return;
      }
  
      const accessToken = await user.getIdToken();
  
      const formData = new FormData();
      formData.append("videoTitle", videoTitle);
      formData.append("videoDescription", videoDescription);
      formData.append("videoFile", file);
  
      const response = await axios.post("http://localhost:3000/uploadToYouTube", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`, // Pass the access token in the Authorization header
        },
      });
      console.log(response.data.summary);
    } catch (error) {
      console.log("Error uploading to YouTube:", error);
    }
  };
  
  

  return (
    <>
    <Dropzone.FullScreen
    active={true}
    accept={['video/mp4']}
    onDrop={(files) => {
      console.log(files);
      setFile(files[0]);
      setActive(false);
      setIsUploaded(false);
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
            <Text fz={20}>VR Tools</Text>
            <Title>Research Access</Title>
            <Text>Generate research access page</Text>
            {isUserLoggedIn && userSummaryCount ? (<Badge color="grape" size="xl" mt={20}>
              {userSummaryCount}/{summaryLimit} summaries
            </Badge>):''}
          </Flex>
          <Center mt={50}>
            <Flex gap={30} direction={"column"}> 
            <Flex gap={10} direction={"column"}>
              <Flex gap={20} align={'center'}>
              <Title ml={12} fz={22}>
                {" "}
                1: Select video{" "}
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
                onSubmit={handleYTUpload}
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
                      {fileName ? (fileName.length > 50 ? fileName.substring(0, 50) + "..." : fileName) : "Drag or Upload the Video to be uploaded to YouTube"}
                    </Text>
                    <div style={{flex: 1}}></div>

                    {(file === null || isUploaded) && (<Flex align={'center'} gap={10}>
                      {isUploaded ? (
                        <Tooltip label="Reset" position="left">
                      <ActionIcon color="red" size="lg" radius="xl" onClick={handleReset}>
                        <IconReload size="1.625rem" />
                      </ActionIcon>
                      </Tooltip>):''}
                      <FileButton onChange={(selectedFile) => {
                        setFile(selectedFile);
                        setIsUploaded(false);
                      }} accept="video/mp4" bg="black">
                        {(props) => (
                          <Button {...props}>
                            {isUploaded ? "Reselect Video" : "Select Video"}
                          </Button>
                        )}
                      </FileButton></Flex>
                    )}

                    {fileName && !isUploaded && (<>
                      <Button
                        type="submit"
                        loading={isLoading}
                        disabled={isLoading}
                        variant="outline"
                        color="dark"
                      >
                        Upload
                      </Button>
                      </>
                    )}

              </form>
              {fileName && !isUploaded && (<>
              <Flex direction={'column'} w={'100%'} gap={10}>
                        <TextInput placeholder="Video Title" 
                        onChange={(event) => setVideoTitle(event.currentTarget.value)}
                        defaultValue={fileName}
                        label="Video Title"
                        />
                        <TextInput placeholder="Video Description" 
                        onChange={(event) => setVideoDescription(event.currentTarget.value)}
                        label="Video Description"
                        />
                        <MultiSelect
                          label="Video Tags"
                          placeholder="add tags"
                          searchable
                          data={tags}
                          onChange={setTags}
                          creatable
                          getCreateLabel={(query) => `+ Create ${query}`}
                          onCreate={(query) => {
                            const item = { value: query, label: query };
                            setTags((current) => [...current, item]);
                            return item;
                          }}
                        />
                      </Flex>
             </>)}
            </Flex>
           {isUploaded ? ( <Flex gap={10} direction={"column"}>
              <Title ml={12} fz={22}>
                {" "}
                2: Select script {" "}
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
                      data={vibeStyles}
                      placeholder="Select your vibe"
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
                3: Provide Instructions{" "}
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
                    Reseach Access Page Preview
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
                      position: "relative",
                      maxHeight: "400px",
                      padding: "10px 20px 10px 20px",
                      overflowY: isLoading ? "hidden" : "scroll",
                    }}>
                
                <LoadingOverlay visible={isLoading} overlayBlur={6} transitionDuration={200}/>
                <TypographyStylesProvider>
                    <div id="summary" dangerouslySetInnerHTML={{ __html: `${summary}` }} />
                </TypographyStylesProvider>

                </Flex>
            </Flex>) :''}

           {summary ? (<Button disabled={isLoading} onClick={downloadSummary} color="dark" leftIcon={<IconWritingSign/>}>Publish Page</Button>) : ''}


            </Flex>

          </Center>
        </Flex>
      </Center>
    </div>
    </>
  );
};

export default HomePage;
