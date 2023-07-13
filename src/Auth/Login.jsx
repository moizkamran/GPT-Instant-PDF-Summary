import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import { Button } from "@mantine/core";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from "../Context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = UserAuth();
  const auth = getAuth();

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

      navigate("/gpt"); // Redirect to the desired page after successful login
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to sign in with Google", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <div style={{ background: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '4px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 200 }}>
            <svg
              fill="none"
              stroke="darkblue"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              ></path>
            </svg>
          </div>
          <h4 style={{ color: 'darkblue', margin: '0px 40px 0px 40px' }}>PDF Instant Text Summarization</h4>
        </div>
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          color="darkblue"
          fullWidth
          style={{ marginTop: '1rem' }}
        >
          Sign in with Google
        </Button>
      </div>
      <ToastContainer /> {/* Add the ToastContainer component */}
      <footer style={{ marginTop: "2rem", width: '100%', textAlign: 'center' }}>
        <p style={{ textAlign: "center" }}>
          Made with{" "}
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
          by{" "}
          <a href="#" target="_blank" rel="noopener noreferrer">
            Team 1
          </a>
        </p>
        <p>This site is using OpenAI's API for text summaraziation your data will be sent to their servers. By using this site you agree to <a href="adw">Terms and Conditions</a> <br /> If you reside in EU or any other affiliated domicile please read <a>GDPR EU Policy</a></p>
        <p style={{ opacity: 0 }}> DEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVEDEVLOPMENT TAG DO NOT REMOVE</p>
      </footer>
    </div>

  )
}

export default Login