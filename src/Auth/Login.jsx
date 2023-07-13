import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import { Button, Center, Flex, Text, TextInput } from "@mantine/core";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from "../Context/AuthContext";
const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const { signIn } = UserAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(username, password, role);
            navigate("/gpt");
        } catch (error) {
            if (error.code === "auth/too-many-requests") {
                toast.error(
                    "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.",
                    {
                        position: toast.POSITION.TOP_RIGHT,
                    }
                );
            } else {
                toast.error("Invalid email or password", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
            console.log(error.message);
        }
    };
    localStorage.setItem("user", JSON.stringify(username));

  return (
<div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
  <div style={{ background: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '4px' }}>
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ color: 'darkblue' }}>Logo</h3>
      <h4 style={{ color: 'darkblue' }}>Secure Employee Career Pathing System using AES</h4>
    </div>

    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          className="form-control"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="John Doe"
          style={{ width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password"
          style={{ width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="/Register"
            style={{ color: 'blue', textDecoration: 'none', marginRight: '10px' }}
          >
            Register
          </a>
        </div>
      </div>

      <button
        style={{
          backgroundColor: 'darkblue',
          color: 'white',
          width: '100%',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
          cursor: 'pointer'
        }}
        type="submit"
      >
        Login
      </button>
    </form>

    <div style={{ textAlign: 'center' }}>
      <p>
        Interested in Employee Career Pathing System using AES? <a href="#">Contact us</a> to know
        more!
      </p>
    </div>
  </div>
  <ToastContainer /> {/* Add the ToastContainer component */}
</div>

  )
}

export default Login