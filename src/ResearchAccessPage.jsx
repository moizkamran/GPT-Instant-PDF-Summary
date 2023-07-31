import React, { useState, useEffect } from 'react';
import CustomHeader from './CustomHeader';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { ActionIcon, Avatar, Button, Chip, Flex, Group, LoadingOverlay, Modal, Text, TextInput, Textarea, Title, TypographyStylesProvider } from '@mantine/core';
import { IconChevronRight, IconEditCircle, IconFileDescription, IconFolderOpen } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const ResearchAccessPage = () => {
  const { id } = useParams();
  console.log(id);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedHeading, setEditedHeading] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(null);
  console.log(page);

  //create a useEffect to check if the user is the author of the page we can get the user id from the local storrage use
  //the user id to check if the user is the author of the page if the user is the author of the page then we can show the edit button

  const [isAuthor, setIsAuthor] = useState(false);
  console.log(isAuthor);

  useEffect(() => {
    if (page) {
      setEditedHeading(page.heading);
      setEditedSummary(page.summary);
    }
  }, [page]);

  useEffect(() => {
    const checkIfAuthor = async () => {
      const userJson = localStorage.getItem('user');
      const user = JSON.parse(userJson);
      const userUid = user?.uid;

      if (!userUid) {
        return; // User not logged in or user ID not found, handle as needed.
      }

      const pageAuthor = page.userId;

      if (userUid === pageAuthor) {
        setIsAuthor(true);
      }
    };

    checkIfAuthor();
  }, [page]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const pageRef = doc(db, 'Pages', id);

        const pageSnapshot = await getDoc(pageRef);
        if (pageSnapshot.exists()) {
          const pageData = pageSnapshot.data();
          setPage(pageData);
          setLoading(false);
        } else {
          console.log('Page not found');
          setLoading(false);
          // You can handle the case where the page with the provided ID is not found.
        }
      } catch (error) {
        console.log('Error fetching page data:', error);
        setLoading(false);
        // Handle the error accordingly, e.g., show an error message to the user.
      }
    };

    // Fetch the page data when the component is mounted
    fetchPageData();
  }, [id]); // Dependency array ensures this effect runs when 'id' changes.

  useEffect(() => {
    if (page) {
      document.title = page.heading; // Set the window title to the page heading
    }
  }, [page]);

  const pageSummary = page && page.summary;
  // remove the first h1 tag from the summary
    const summaryWithoutHeading = pageSummary && pageSummary.replace(/<h1[^>]*>([^<]+)<\/h1>/, '');

  const publishedDate = page && page.timestamp;

  //parse the date into a readable format
    const date = new Date(publishedDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    const [opened, { open, close }] = useDisclosure(false);

    const colors = [
        'teal',
        'cyan',
        'blue',
        'indigo',
        'purple',
        'pink',
        'red',
        'orange',
        'yellow',
        'lime',
        'green',
        'gray',
        'darkGray',
        'black',
        'white',
    ];

     // Function to update the page heading in Firestore
     const updateHeading = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const pageRef = doc(db, 'Pages', id);
  
        // Update the heading field
        const updatedFields = {
          heading: editedHeading,
        };
  
        await setDoc(pageRef, updatedFields, { merge: true });
        console.log('Page heading updated successfully');
        setPage((prevPage) => ({
          ...prevPage,
          heading: editedHeading, // Update the page state with the new heading
        }));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log('Error updating page heading:', error);
        // Handle the error accordingly, e.g., show an error message to the user.
      }
    };

    const updateSummary = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const pageRef = doc(db, 'Pages', id);
  
        // Update the summary field
        const updatedFields = {
          summary: editedSummary,
        };
  
        await setDoc(pageRef, updatedFields, { merge: true });
        console.log('Page summary updated successfully');
        setPage((prevPage) => ({
          ...prevPage,
          summary: editedSummary, // Update the page state with the new summary
        }));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log('Error updating page summary:', error);
        // Handle the error accordingly, e.g., show an error message to the user.
      }
    };
  




  return (
    <>
    <Modal opened={opened} onClose={close} withCloseButton={false}>
      <Title order={3}>Video Description</Title>
      <Text color="dimmed" size="xs" mt={10}>
        {page?.videoDescription}
      </Text>
    </Modal>
    <CustomHeader />
    {/* Render the page data here or pass it to child components */}
    <LoadingOverlay visible={loading} />
    {page && (
      <div style={{ padding: '0px 120px 0px 120px' }}>
        <Flex direction={'column'} gap={10}>
          <Flex align={'center'} justify={'space-between'}>
            {!isEditingHeading ? (
              <Title order={1}>{page.heading}</Title>
            ) : (
              <TextInput
                size="lg"
                width={'max-content'}
                value={editedHeading} // Use editedHeading state for the input value
                onChange={(event) => setEditedHeading(event.currentTarget.value)} // Update editedHeading state on change
              />
            )}
            {isAuthor && (
              <Button
                variant="subtle"
                color="red"
                size="sm"
                leftIcon={<IconEditCircle />}
                onClick={() => {
                  setIsEditingHeading(!isEditingHeading);
                  if (isEditingHeading) {
                    updateHeading(); // Call updateHeading when the user clicks on the Save button
                  }
                }}
              >
                {isEditingHeading ? 'Save' : 'Edit'}
              </Button>
            )}
          </Flex>
          <Text color="dimmed" size="xs">
            {formattedDate}
          </Text>
          <Group mt={10}>
            <Avatar src={page.profilePicture} radius="xl" />
            <div style={{ flex: 1 }}>
              <Text size="sm" weight={500}>
                {page.name}
              </Text>
              <Text color="dimmed" size="xs">
                {page.email}
              </Text>
            </div>
          </Group>
        </Flex>
        <div style={{ marginTop: 50 }}>
          {/* You can embed the YouTube video player here */}
          <iframe
            width="100%"
            height="450"
            src={`https://www.youtube.com/embed/${page.videoId}`}
            title="YouTube Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <Flex gap={10} mt={10} align={'center'} justify={'space-between'}>
            <Flex gap={10}>
              {page.tags &&
                page.tags.map((tag, index) => {
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <Chip key={index} readOnly variant="light" checked={true} color={randomColor} styles={{ iconWrapper: { display: 'none' } }}>
                      {tag}
                    </Chip>
                  );
                })}
            </Flex>
            <ActionIcon onClick={open} color="teal" radius={'xl'} variant="filled">
              <IconFileDescription size={'20px'} />
            </ActionIcon>
          </Flex>
        </div>
        {!isEditingSummary ? (
          <TypographyStylesProvider>
            <div id="summary" dangerouslySetInnerHTML={{ __html: `${summaryWithoutHeading}` }} />
          </TypographyStylesProvider>
        ) : (
          <Textarea
            autosize
            value={editedSummary} // Use editedSummary state for the textarea value
            onChange={(event) => setEditedSummary(event.currentTarget.value)} // Update editedSummary state on change
          />
        )}
        {isAuthor && (
          <Button
            variant="subtle"
            color="red"
            size="sm"
            leftIcon={<IconEditCircle />}
            onClick={() => {
              setIsEditingSummary(!isEditingSummary);
              if (isEditingSummary) {
                updateSummary(); // Call updateSummary when the user clicks on the Save button
              }
            }}
          >
            {isEditingSummary ? 'Save' : 'Edit'}
          </Button>
        )}
      </div>
    )}
  </>
  );
};

export default ResearchAccessPage;
