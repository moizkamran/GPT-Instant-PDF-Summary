import React, { useState, useEffect } from 'react';
import CustomHeader from './CustomHeader';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ActionIcon, Avatar, Button, Chip, Flex, Group, Modal, Text, TextInput, Textarea, Title, TypographyStylesProvider } from '@mantine/core';
import { IconChevronRight, IconEditCircle, IconFileDescription, IconFolderOpen } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const ResearchAccessPage = () => {
  const { id } = useParams();
  console.log(id);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [page, setPage] = useState(null);
  console.log(page);

  //create a useEffect to check if the user is the author of the page we can get the user id from the local storrage use
  //the user id to check if the user is the author of the page if the user is the author of the page then we can show the edit button

  const [isAuthor, setIsAuthor] = useState(false);
  console.log(isAuthor);

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
        const db = getFirestore();
        const pageRef = doc(db, 'Pages', id);

        const pageSnapshot = await getDoc(pageRef);
        if (pageSnapshot.exists()) {
          const pageData = pageSnapshot.data();
          setPage(pageData);
        } else {
          console.log('Page not found');
          // You can handle the case where the page with the provided ID is not found.
        }
      } catch (error) {
        console.log('Error fetching page data:', error);
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
      {page && (
        <div style={{padding: '0px 120px 0px 120px'}}>
            <Flex direction={'column'} gap={10}>
              <Flex align={'center'} justify={'space-between'}>
            {!isEditingHeading ? (<Title order={1}>{page.heading}</Title>) :<TextInput size="lg" width={'max-content'} value={page.heading} onChange={(event) => setPage({ ...page, heading: event.currentTarget.value })} />}
            {isAuthor && (
            <Button
              variant="subtle"
              color="red"
              size='sm'
              leftIcon={<IconEditCircle />}
              onClick={() => setIsEditingHeading(!isEditingHeading)}
            >
              {isEditingHeading ? 'Save' : 'Edit'}
            </Button>)}
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
            <div style={{marginTop: 50 }}>
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
                    {page.tags && page.tags.map((tag, index) => {
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        return (
                            <Chip key={index} readOnly variant='light' checked={true} color={randomColor} styles={{ iconWrapper: {display: 'none'}}}>{tag}</Chip>
                        );
                    })}
                    </Flex>
                     <ActionIcon onClick={open} color='teal' radius={'xl'} variant='filled'><IconFileDescription size={'20px'}/></ActionIcon>
                </Flex>
                
            </div>
            {!isEditingSummary ? (<TypographyStylesProvider>
                    <div id="summary" dangerouslySetInnerHTML={{ __html: `${summaryWithoutHeading}` }} />
            </TypographyStylesProvider>): 
            <Textarea autosize value={page.summary} onChange={(event) => setPage({ ...page, summary: event.currentTarget.value })} />}
            {isAuthor && (
            <Button
              variant="subtle"
              color="red"
              size='sm'
              leftIcon={<IconEditCircle />}
              onClick={() => setIsEditingSummary(!isEditingSummary)}
            >
              {isEditingSummary ? 'Save' : 'Edit'}
            </Button>)
  
            }
        </div>
      )}
    </>
  );
};

export default ResearchAccessPage;
