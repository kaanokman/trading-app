import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Login({ clientID, setClientID }) {
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

        const loginData = {
            client_id: displayClientID,
            password: password
        };

        axios.post('http://127.0.0.1:5000/login', loginData)
            .then(response => {
                setTimeout(() => {
                    if (response.data === 'Login Success') {
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
                setMessage('An error occurred during login.');
                setShowMessage(true);
            });
    };

    return (
        <>
            <form className="parent-login" onSubmit={handleSubmit}>
                {loading ? (<div className="spinner"></div>) : (
                    <>
                        <div className='login-text'>Log In</div>
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
                            <button className="login-button" type="submit">
                                LOG IN
                            </button>
                        </div>
                    </>)}
            </form>
            <div className={`error-message ${showMessage ? 'show' : ''}`}>
                {message}
            </div>
        </>
    );
}