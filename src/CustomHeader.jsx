import {
  createStyles,
  Header,
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  Title,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from "./Context/AuthContext";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));

const mockdata = [
  {
    title: "Free for everyone",
    description: "The fluid of Smeargle’s tail secretions changes",
  },
  {
    title: "Documentation",
    description: "Yanma is capable of seeing 360 degrees without",
  },
  {
    title: "Security",
    description: "The shell’s rounded shape and the grooves on its.",
  },
  {
    title: "Analytics",
    description: "This Pokémon uses its flying ability to quickly chase",
  },
  {
    title: "Notifications",
    description: "Combusken battles with the intensely hot flames it spews",
  },
];


export default function CustomHeader() {
  const navigate = useNavigate();
  const { signIn } = UserAuth();
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Set login state to false by default

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      //save user to localstotage
      signIn();
      localStorage.setItem("user", JSON.stringify(auth.currentUser));
      toast.success("Signed in with Google successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to sign in with Google", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  //create a useEffect to check if user is logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);


  const handleLogout = () => {
    setIsLoggedIn(false); // Set login state to false on logout
    localStorage.removeItem("user"); // Remove user from local storage
    window.location.reload(); // Reload the page
  };

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group noWrap align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md"></ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" color="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box pb={120}>
      <Header height={60} px="md">
        <Group position="apart" sx={{ height: "100%" }}>
          <Title>RIKA</Title>
          <Group
            sx={{ height: "100%" }}
            spacing={0}
            className={classes.hiddenMobile}
          >
            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Featured
                    </Box>
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                <Group position="apart" px="md">
                  <Text fw={500}>Features</Text>
                  <Anchor href="#" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider
                  my="sm"
                  mx="-md"
                  color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group position="apart">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" color="dimmed">
                        Their food sources have decreased, and their numbers
                      </Text>
                    </div>
                    <Button variant="default">Get started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Rescources
                    </Box>
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                <Group position="apart" px="md">
                  <Text fw={500}>Features</Text>
                  <Anchor href="#" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider
                  my="sm"
                  mx="-md"
                  color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group position="apart">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" color="dimmed">
                        Their food sources have decreased, and their numbers
                      </Text>
                    </div>
                    <Button variant="default">Get started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>

          <Group className={classes.hiddenMobile}>
            <Button color="dark">Contact</Button>

            { !isLoggedIn ? (<Flex gap={10} justify={'center'} align={'center'}>
           
            <Button onClick={handleGoogleSignIn} color="yellow" leftIcon={ <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-google" width="24" height="24" viewBox="0 0 24 24" stroke-width="4" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8"></path>
            </svg>}>
              Log in with Google
            </Button>
            </Flex>) : ''}
           
           
            {isLoggedIn ?(<Button onClick={handleLogout} color="red" variant="outline">
              Logout
            </Button>):''}
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          />
        </Group>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <a href="#" className={classes.link}>
            Home
          </a>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group position="center" grow pb="xl" px="md">
            <Button color="dark">Contact</Button>

            <Button onClick={handleGoogleSignIn}>Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
