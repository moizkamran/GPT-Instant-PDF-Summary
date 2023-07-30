import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Flex, Text, Title } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { Link } from 'react-router-dom';

const MyPublications = () => {
  const [publications, setPublications] = useState([]);

  function createHex() {
    var hexCode1 = '';
    var hexValues1 = '0123456789abcdef';

    for (var i = 0; i < 6; i++) {
      hexCode1 += hexValues1.charAt(Math.floor(Math.random() * hexValues1.length));
    }
    return hexCode1;
  }

  function generate() {
    var deg = Math.floor(Math.random() * 360);
    var newGradient = 'linear-gradient(' + deg + 'deg, ' + '#' + createHex() + ', ' + '#' + createHex() + ')';
    return newGradient;
  }

  useEffect(() => {
    const fetchUserPublications = async () => {
      const userJson = localStorage.getItem('user');
      const user = JSON.parse(userJson);
      const userUid = user?.uid;

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

  function getTextColor(gradientColor) {
    const rgbValues = gradientColor.match(/\d+/g);
    const brightness = (parseInt(rgbValues[0]) * 299 + parseInt(rgbValues[1]) * 587 + parseInt(rgbValues[2]) * 114) / 1000;
    return brightness < 128 ? '#fff' : '#000';
  }

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  const totalPublications = publications.length;
  console.log(totalPublications);

  


  return (
    <>
      <Flex mt={20} direction={'column'} align={'center'} justify={'center'}>
        <Title order={3}>Your Publications</Title>
       { totalPublications > 0 ? ( <Carousel
      withIndicators
      slideSize="100%"
      slideGap="xl"
      align="start"
      slidesToScroll={3}
    >
        {publications.map((publication, index) => {
          const gradient = generate(); // Generate a unique gradient for each publication box
          const textColor = getTextColor(gradient);

          const parsedDate = new Date(publication.timestamp);
            const formattedDate = parsedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // remove all html tags from the summary
            const summaryWithoutHeading = publication.summary.replace(/<h1[^>]*>([^<]+)<\/h1>/, '');
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
              bg={gradient}
              p={20}
              sx={{ borderRadius: 30, cursor: 'pointer', textDecoration: 'none' }}
              mt={20}
            >
              <Text fz={20} fw={700} color={textColor}>
                {truncateText(publication.heading, 30)}
              </Text>
              <Text fz={15} fw={400} color={textColor}>
                {formattedDate} {/* Assuming `timestamp` is the date field */}
              </Text>
              <Text c={textColor} fz={11} fw={400} mt={10}>
                {truncateText(summaryWithoutHtml, 90)}
              </Text>
            </Flex>
          );
        })}
        </Carousel>) : <Text c="dimmed" mt={10}>🤔 You have not published anything yet.</Text>}
      </Flex>
    </>
  );
};

export default MyPublications;
