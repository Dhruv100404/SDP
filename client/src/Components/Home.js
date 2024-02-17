import React from 'react';
// import '../css/home.css';
import 'tailwindcss/tailwind.css';

const loginwithgoogle = () => {
  window.open("http://localhost:6005/auth/google/callback", "_self");
};

const Home = () => {
  return (
    <>
      <div className="bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 h-screen flex items-center justify-center text-white text-center">
        <div className="container mx-auto">
          <h1 className="animate__animated animate__fadeIn text-8xl font-bold mb-8">Document Summarization</h1>
          <div className="summarization-icon"></div>
          <p className="text-lg mb-6">Welcome to our document summarization platform. Summarize your documents effortlessly!</p>
          <button className="login-button animate_animated animate_bounceInLeft bg-green-500 text-white py-2 px-4 rounded" onClick={loginwithgoogle}>
            Sign In
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
