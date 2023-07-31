import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Button, Flex, Text, Title } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { Link } from 'react-router-dom';
import { IconChevronCompactDown } from '@tabler/icons-react';

const MyPublications = () => {
  const [publications, setPublications] = useState([]);
  const [userUid, setUserUid] = useState(null); // Declare userUid state variable
  

  useEffect(() => {
    const fetchUserPublications = async () => {
      const userJson = localStorage.getItem('user');
      const user = JSON.parse(userJson);
      const userUid = user?.uid;
      setUserUid(userUid); // Set userUid state variable

      if (!userUid) {
        return; // User not logged in or user ID not found, handle as needed.
      }

      const db = getFirestore();
      const publicationsRef = collection(db, 'Pages');
      const q = query(publicationsRef, where('userId', '==', userUid));

      try {
        const querySnapshot = await getDocs(q);
        const userPublications = querySnapshot.docs.map((doc) => {
            // Include the document ID in the data
            const dataWithId = { id: doc.id, ...doc.data() };
            return dataWithId;
          });
        setPublications(userPublications);
      } catch (error) {
        console.log('Error fetching user publications:', error);
        // Handle the error accordingly, e.g., show an error message to the user.
      }
    };

    fetchUserPublications();
  }, []);

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  const totalPublications = publications.length;
  console.log(totalPublications);

  const firstFourPublications = publications.slice(0, 4);

  return (
    <>
      <Flex mt={20} direction={'column'} align={'center'} justify={'center'}>
        <Title order={3}>Your Publications</Title>
        {totalPublications > 0 ? (
          <>
            <Flex
              direction={'row'}
            >
              {firstFourPublications.map((publication, index) => {
                const parsedDate = new Date(publication.timestamp);
                const formattedDate = parsedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                // remove all html tags from the summary
                const summaryWithoutHeading = publication.summary.replace(
                  /<h1[^>]*>([^<]+)<\/h1>/,
                  ''
                );
                const summaryWithoutHtml = summaryWithoutHeading.replace(/<[^>]*>?/gm, '');

                return (
                  <Flex
                    key={index}
                    direction={'column'}
                    maw={200}
                    mah={200}
                    component={Link}
                    to={`/pages/${publication.id}`}
                    ml={10}
                    bg={'white'}
                    p={20}
                    sx={{ borderRadius: 30, cursor: 'pointer', textDecoration: 'none', border: '1px solid #e0e0e0'}}
                    mt={20}
                  >
                    <Text fz={20} fw={700} color={'black'}>
                      {truncateText(publication.heading, 30)}
                    </Text>
                    <Text fz={15} fw={400} color={'black'}>
                      {formattedDate} {/* Assuming `timestamp` is the date field */}
                    </Text>
                    <Text c={'black'} fz={11} fw={400} mt={10}>
                      {truncateText(summaryWithoutHtml, 90)}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
            {totalPublications > 4 && (
             <Button component={Link} to={`/publications/${userUid}`} mt={20} leftIcon={<IconChevronCompactDown/>} variant={'subtle'} color='dark'>View All</Button>
            )}
          </>
        ) : (
          <Text c="dimmed" mt={10}>
            🤔 You have not published anything yet.
          </Text>
        )}
      </Flex>
    </>
  );
};

export default MyPublications;
