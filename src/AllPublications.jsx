import { useState, useEffect } from 'react';
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
} from '@mantine/core';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions from the Firebase SDK
import { keys } from '@mantine/utils';
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomHeader from './CustomHeader';

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },

  control: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: rem(21),
    height: rem(21),
    borderRadius: rem(21),
  },
}));

function Th({ children, reversed, sorted, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size="0.9rem" stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

export function TableSort() {
  const { id } = useParams();
  console.log(id);

  // use effect to set search the id passed in the url and set it to the search state variable


  const [publications, setPublications] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);


  useEffect(() => {
    setSearch(id ? id : '');
  }, [id]);

  useEffect(() => {
    const fetchUserPublications = async () => {


      const db = getFirestore();
      const publicationsRef = collection(db, 'Pages');
      const q = query(publicationsRef);

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

  useEffect(() => {
    const sortedPublications = sortData(publications, {
      sortBy,
      reversed: reverseSortDirection,
      search,
    });
    setSortedData(sortedPublications);
  }, [publications, sortBy, reverseSortDirection, search]);

  function filterData(data, search) {
    const query = search?.toLowerCase().trim();
    return data.filter((item) =>
      keys(item).some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false; // Return false for non-string values
      })
    );
  }

  function sortData(data, payload) {
    const { sortBy } = payload;
  
    if (!sortBy) {
      return filterData(data, payload.search);
    }
  
    const dataCopy = [...data];
    dataCopy.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
  
      // Move items with missing sortBy property to the end
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;
  
      if (payload.reversed) {
        return valueB.localeCompare(valueA);
      }
  
      return valueA.localeCompare(valueB);
    });
  
    return filterData(dataCopy, payload.search);
  }
  

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/pages/${id}`); // Navigate to the /pages/:id route with the publication ID
  };

  const rows = sortedData?.map((publication) => (
    <tr key={publication.id} onClick={() => handleRowClick(publication.id)} style={{cursor: 'pointer' , ':hover':{color: 'blue'}}}>
      <td>{publication.heading}</td>
      <td>{publication.name}</td>
      <td>{new Date(publication.timestamp).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
    </tr>

  ));

  return (
    <>
    <CustomHeader />
    <ScrollArea sx={{padding: '0px 80px 0px 80px'}}>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size="0.9rem" stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} sx={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <Th
              sorted={sortBy === 'headings'}
              reversed={reverseSortDirection}
              onSort={() => setSortBy('headings')}
            >
              Paper Name
            </Th>
            <Th
              sorted={sortBy === 'name'}
              reversed={reverseSortDirection}
              onSort={() => setSortBy('name')}
            >
              Author
            </Th>
            <Th
              sorted={sortBy === 'timestamp'}
              reversed={reverseSortDirection}
              onSort={() => setSortBy('timestamp')}
            >
              Date Published
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={3}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
    </>
  );
}

export default TableSort;
