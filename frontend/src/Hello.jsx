// frontend/src/Hello.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Hello() {
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        axios.get("/api/hello") // proxy to Symfony
            .then(res => setMessage(res.data.message))
            .catch(() => setMessage("Backend not reachable"));
    }, []);

    return (
        <div>
            <h1>Hello React Page</h1>
            <p>{message}</p>
        </div>
    );
}
