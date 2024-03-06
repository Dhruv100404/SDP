import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FaCloudUploadAlt, FaFileDownload } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ImStatsBars } from "react-icons/im";

const countWords = (text) => {
    // Split the text into words and filter out empty strings
    const words = text.split(/\s+/).filter(word => word !== '');
    return words.length;
};

const StatisticsModal = ({ inputWordCount, outputWordCount, onClose }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-lg font-bold mb-4">Word Counts</h2>
                <p className="mb-2">Input Word Count: {inputWordCount}</p>
                <p className="mb-4">Output Word Count: {outputWordCount}</p>
                <button onClick={onClose} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-bg">
                    Close
                </button>
            </div>
        </div>
    );
};
const Main = () => {
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [inputType, setInputType] = useState('TEXT');
    const [question, setQuestion] = useState('');
    const [file, setFile] = useState(null);
    const [processingComplete, setProcessingComplete] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [questionInProgress, setQuestionInProgress] = useState(false);
    const [textProcessing, setTextProcessing] = useState(false);
    const [inputWordCount, setInputWordCount] = useState(0);
    const [outputWordCount, setOutputWordCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const downloadAsPdf = () => {
        // Create a new blob with the output text
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const toggleModal = () => {
        setShowModal(!showModal);
    };
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
            setTextProcessing(true);
            apiUrl = 'https://api-inference.huggingface.co/models/google/pegasus-cnn_dailymail';
            requestBody = { inputs: inputText };
            headers = {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
            };
        }
        setInputWordCount(countWords(inputText));
        console.log(inputWordCount);


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
                    summary = result[0]['summary_text'].replace(/<n>/g, '');
                }
                toast.success('Summary Generated')
                setOutputWordCount(countWords(summary));

                setOutputText(summary);
            } else {
                console.error('Error generating summary:', response.statusText);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
        }
        finally {
            setTextProcessing(false);
        }
    };

    const handleFileUpload = async (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);

        if (!selectedFile) {
            console.error('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('pdf_files', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/process_pdfs', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('PDF Upload Successful');
                setProcessingComplete(true);
                setUploadingPdf(false);
                toast.success('PDF uploaded successfully!');
            } else {
                console.error('Error uploading PDF:', response.statusText);
                toast.error('Error uploading PDF');
            }
        } catch (error) {
            console.error('Error uploading PDF:', error);
            toast.error('Error uploading PDF');
        }
    };

    const askQuestion = async () => {
        if (!processingComplete) {
            console.error('PDF processing not complete. Please wait.');
            return;
        }

        setQuestionInProgress(true);
        console.log('Asking Question')
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_question: question }),

            });

            if (response.ok) {
                const result = await response.json();
                setOutputText(result.response);
                console.log(result)
                toast.success('Question answered!');
            } else {
                console.error('Error asking question:', response.statusText);
                toast.error('Error asking question');
            }
        } catch (error) {
            console.error('Error asking question:', error);
            toast.error('Error asking question');
        }
        finally {
            setQuestionInProgress(false);
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
            <ToastContainer />
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

                    {inputType === 'PDF' && (
                        <div className="mb-4 flex flex-col items-center">
                            <label htmlFor="pdfUpload" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white py-4 px-8 rounded-full transition-bg flex items-center w-full justify-center">
                                <FaCloudUploadAlt className="h-6 w-6 mr-2" />
                                Choose PDF
                                <input
                                    type="file"
                                    id="pdfUpload"
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    className="hidden"
                                />
                            </label>
                            <span className="mt-2" id="selectedPdfFileName">
                                {file ? file.name : "No file selected"}
                            </span>
                            <br />
                            <br />
                            <label htmlFor="question" className="text-lg block mb-2">Ask a Question:</label>
                            <input
                                type="text"
                                id="question"
                                value={question}
                                onChange={handleQuestionChange}
                                className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
                            />

                        </div>
                    )}


                    {inputType !== 'ARTICLE' && inputType !== 'PDF' && (
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
                    {inputType === 'TEXT' && (
                        <button onClick={generateSummary} className="generate-summary-btn bg-green-500 text-white py-2 px-4 rounded mt-4 hover:bg-green-600 transition-bg">
                            Generate Summary
                        </button>
                    )}
                    {inputType === 'ARTICLE' && (
                        <button onClick={generateSummary} className="generate-summary-btn bg-green-500 text-white py-2 px-4 rounded mt-4 hover:bg-green-600 transition-bg">
                            Generate Summary
                        </button>
                    )}
                    {inputType === 'PDF' &&
                        (<button onClick={askQuestion} className="generate-summary-btn bg-green-500 text-white py-2 px-4 rounded mt-4 hover:bg-green-600 transition-bg">
                            Ask Question
                        </button>

                        )}


                </div>
                <div className="output-container m-4 p-6 bg-white rounded shadow-md hover:shadow-lg transition-shadow w-full md:w-1/2 mt-16">
                    <label htmlFor="outputText" className="text-lg mb-2 block">
                        Output Text:
                    </label>
                    {questionInProgress || textProcessing ? (
                        <div className="loader">Loading...</div>
                    ) : (
                        <>
                            <textarea
                                id="outputText"
                                value={outputText}
                                className="w-full h-36 md:h-48 border rounded p-2 focus:border-blue-500 focus:outline-none resize-none"
                            ></textarea>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={toggleModal}
                                    className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600 transition-bg flex items-center"
                                >
                                    <ImStatsBars />
                                </button>
                                <button
                                    onClick={downloadAsPdf}
                                    className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600 transition-bg flex items-center"
                                >
                                    <FaFileDownload className="md-2" />
                                </button>

                            </div>
                            {showModal && (
                                <StatisticsModal
                                    inputWordCount={inputWordCount}
                                    outputWordCount={outputWordCount}
                                    onClose={toggleModal}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Main;
