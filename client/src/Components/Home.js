import React from 'react';
import 'tailwindcss/tailwind.css';
import '../css/home.css'
const loginWithGoogle = () => {
  window.open("http://localhost:6005/auth/google/callback", "_self");
};

const Home = () => {
  return (
    <>
      <div className="bg-gradient-to-br bg-gradient-animation min-h-screen flex items-center justify-center text-black text-center">
        <div className="container mx-auto p-8">
          <h2 className="animate__animated animate__fadeIn text-3xl md:text-6xl lg:text-6xl font-bold mb-4 md:mb-8">
            <span className="compression-animation">Document Summarization</span>
          </h2>
          <div className="summarization-icon"></div>
          <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6">
            Welcome to our document summarization platform. Summarize your documents effortlessly!
          </p>
          <button className="login-button animate__animated animate__bounceInLeft bg-red-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={loginWithGoogle}>
            Sign In with Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
