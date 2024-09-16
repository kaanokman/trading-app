import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Signup({ clientID, setClientID }) {
    const [password, setPassword] = useState('');
    const [displayClientID, setDisplayClientID] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setDisplayClientID('');
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setShowMessage(false);

        const signupData = {
            client_id: clientID,
            password: password
        };

        axios.post('http://127.0.0.1:5000/signup', signupData)
            .then(response => {
                setTimeout(() => {
                    if (response.data === 'Signup Success') {
                        setClientID(displayClientID);
                        navigate('/dashboard');
                    }
                    else {
                        setLoading(false);
                        setMessage(response.data);
                        setShowMessage(true);
                    };
                }, 1000);
            })
            .catch(error => {
                console.error('Error occurred:', error);
                setMessage('An error occurred during signup.');
                setShowMessage(true);
                setLoading(false);

            });
    };

    return (
        <>
            <form className="parent-signup" onSubmit={handleSubmit}>
                {loading ? (<div className="spinner"></div>) : (
                    <>
                        <div className='signup-text'>Sign Up</div>
                        <div className="wrapper">
                            <input className="box_a"
                                type="text"
                                placeholder="Client ID"
                                value={displayClientID}
                                onChange={(e) => setDisplayClientID(e.target.value)}
                                required
                            />
                            <input className="box_b"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button className="signup-button" type="submit">
                                SIGN UP
                            </button>
                        </div>
                    </>)}
            </form>
            <div className={`error-message-signup  ${showMessage ? 'show' : ''}`}>
                {message}
            </div>
        </>
    );
}