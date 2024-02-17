import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Main = () => {
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [inputType, setInputType] = useState('TEXT');

    const generateSummary = async () => {
        let requestBody;
        let apiUrl;
        let headers = {};

        if (inputType === 'ARTICLE') {
            apiUrl = 'http://127.0.0.1:5000/scrape';
            requestBody = { url: inputText };
            headers = {
                'Content-Type': 'application/json',
            };
        } else {
            apiUrl = 'https://api-inference.huggingface.co/models/google/pegasus-cnn_dailymail';
            requestBody = { inputs: inputText };
            headers = {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
            };
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });


            if (response.ok) {
                const result = await response.json();
                let summary;

                if (inputType === 'ARTICLE') {
                    summary = result.content
                } else {
                    summary = result[0]['summary_text'];
                }

                setOutputText(summary);
            } else {
                console.error('Error generating summary:', response.statusText);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataFromCookie = Cookies.get('sakemaru');

                if (userDataFromCookie) {
                    const parsedUserData = JSON.parse(userDataFromCookie);
                    if (parsedUserData.displayName) {
                        setUserName(parsedUserData.displayName);
                    }
                    if (parsedUserData.image) {
                        setUserImage(parsedUserData.image);
                    }
                }
            } catch (error) {
                console.error('Error fetching User:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        var headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');

        headers.append('Access-Control-Allow-Origin', 'http://localhost:3000/home');
        headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
        headers.append('Access-Control-Allow-Credentials', 'true');

        headers.append('GET', 'POST', 'OPTIONS');

        try {
            const response = await fetch('http://localhost:6005/logout', {
                method: 'GET',
                headers: headers
            });

            if (response.status === 200) {
                window.location.href = 'http://localhost:3000';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="main-container flex-col items-center p-4 md:p-8 min-h-screen">

            <nav className="navbar fixed top-0 left-0 right-0  bg-gray-800 p-4 flex justify-between items-center box-shadow-md">
                <div className="user-info flex items-center text-white">
                    <img src={userImage} alt="User" className="user-image w-10 h-10 rounded-full mr-2 border-2 border-white" />
                    <span className="user-name">{userName}</span>
                </div>
                <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
            </nav>

            <div className="content-container flex flex-col md:flex-row w-full mt-4 justify-center">
                <div className="input-container m-4 p-6 bg-white rounded shadow-md hover:shadow-lg transition-shadow w-full md:w-1/2 ">
                    <div className="flex flex-wrap space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <button
                            className={`button bg-red-500 hover:bg-blue-500 text-white py-2 px-4 rounded transition-bg`}
                            onClick={() => setInputType('PDF')}
                        >
                            PDF
                        </button>
                        <button
                            className={`button bg-red-500 hover:bg-blue-500 text-white py-2 px-4 rounded transition-bg`}
                            onClick={() => setInputType('TEXT')}
                        >
                            TEXT
                        </button>
                        <button
                            className={`button bg-red-500 hover:bg-blue-500 text-white py-2 px-4 rounded transition-bg`}
                            onClick={() => setInputType('ARTICLE')}
                        >
                            ARTICLE
                        </button>
                    </div>

                    {inputType === 'ARTICLE' && (
                        <div className="mb-4">
                            <label htmlFor="articleUrl" className="text-lg block">Article URL:</label>
                            <input
                                type="text"
                                id="articleUrl"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {inputType !== 'ARTICLE' && (
                        <div className="mb-4">
                            <label htmlFor="inputText" className="text-lg block">Input Text:</label>
                            <textarea
                                id="inputText"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-36 md:h-48 border rounded p-2 focus:border-blue-500 focus:outline-none resize-none"
                            />
                        </div>
                    )}

                    <button onClick={generateSummary} className="generate-summary-btn bg-green-500 text-white py-2 px-4 rounded mt-4 hover:bg-green-600 transition-bg">
                        Generate Summary
                    </button>
                </div>

                <div className="output-container m-4 p-6 bg-white rounded shadow-md hover:shadow-lg transition-shadow w-full md:w-1/2 mt-16">
                    <label htmlFor="outputText" className="text-lg mb-2 block">Output Text:</label>
                    <textarea id="outputText" value={outputText} className="w-full h-36 md:h-48 border rounded p-2 focus:border-blue-500 focus:outline-none resize-none"></textarea>
                </div>
            </div>
        </div>
    );
};

export default Main;
