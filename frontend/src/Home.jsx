// src/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Notes Application</h1>
            <ul>
                <li><Link to="/notes">View Notes</Link></li>
            </ul>
        </div>
    );
}