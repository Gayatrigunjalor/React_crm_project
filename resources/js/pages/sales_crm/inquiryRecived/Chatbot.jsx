import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaWhatsapp, FaPaperclip, FaSmile, FaMicrophone, FaPaperPlane } from 'react-icons/fa';

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm here to assist you with any questions you may have about Inorbvict Health Care. How can I help you today? 😊", sender: "them", time: "Yesterday" },
        { text: "Hello! I'm here to assist you with any questions you may have about Inorbvict Health Care. How can I help you today? 😊", sender: "me", time: "6:40 PM" },
        { text: "Hello! I'm here to assist you with any questions you may have about Inorbvict Health Care. How can I help you today? 😊", sender: "them", time: "Today" }
    ]);

    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: "me", time: "Now" }]);
            setInput("");
        }
    };

    return (
        <div
            className="d-flex flex-column"
            style={{
                maxWidth: '500px',
                width: '100%',
                height: '380px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '12px' // shrink all font sizes
            }}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center px-2 py-1" style={{ backgroundColor: 'transparent' }}>
                <div className="d-flex gap-1">
                    <Button variant="primary" size="sm" style={{ fontSize: '10px', padding: '3px 6px' }}>Flow Based</Button>
                    <Button variant="secondary" size="sm" style={{ fontSize: '10px', padding: '3px 6px' }}>Template Based</Button>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span style={{ color: '#7c8cac', fontSize: '10px' }}>Customer Name: Avneesh Kumar</span>
                    <FaWhatsapp size={12} />
                    <FaPaperPlane size={12} />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow-1 px-2 py-1 overflow-auto" style={{ backgroundColor: '#ffffff' }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        {(index === 0 || messages[index - 1].time !== msg.time) && (
                            <div className="text-center text-muted small my-1" style={{ fontSize: '10px' }}>
                                {msg.time}
                            </div>
                        )}
                        <div className={`d-flex ${msg.sender === "me" ? "justify-content-end" : "justify-content-start"} my-1`}>
                            <div style={{
                                maxWidth: '70%',
                                backgroundColor: msg.sender === "me" ? '#375494' : '#f1f1f1',
                                color: msg.sender === "me" ? 'white' : '#111A2E',
                                padding: '6px 10px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                lineHeight: '1.3'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Field */}
            <div className="d-flex align-items-center px-2 py-1" style={{ backgroundColor: '#375494' }}>
                <input
                    className="form-control me-1"
                    placeholder="Type Your Message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ borderRadius: '15px', fontSize: '11px', padding: '4px 8px' }}
                />
                <FaPaperclip color="white" className="mx-1" size={12} />
                <FaSmile color="white" className="mx-1" size={12} />
                <FaMicrophone color="white" className="mx-1" size={12} />
                <FaPaperPlane color="white" style={{ cursor: 'pointer' }} size={12} onClick={handleSend} />
            </div>
        </div>
    );
};

export default ChatBox;
