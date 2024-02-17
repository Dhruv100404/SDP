import React from 'react'
import "../css/home.css"

const Login = () => {

    const loginwithgoogle = ()=>{
        window.open("http://localhost:6005/auth/google/callback","_self")
    }

    return (
    <>
    <h1>Sign in Here</h1>
        <div>
        <a class="login-button animate__animated animate__bounceInLeft" onClick={loginwithgoogle}>Sign In</a>
        </div>
        
    </>
    )
}

export default Login