import React, { useState } from 'react';
import { FaWhatsapp, FaPaperclip, FaSmile, FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import pandit from '../../../assets/img/newIcons/pandit.png';

const Chankya = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: "me", time: "Now" }]);
            setInput("");
        }
    };

    return (
        <div
            className="d-flex flex-column justify-content-between"
            style={{
                maxWidth: '500px',
                width: '100%',
                height: '380px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '12px'
            }}
        >
            {/* Image Centered */}
            <div className="d-flex justify-content-center align-items-center" style={{ flexGrow: 1 }}>
                <img
                    src={pandit}
                    alt="chankya"
                    style={{
                        maxHeight: '150px',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Input Bar Fixed at Bottom */}
            <div className="d-flex align-items-center px-2 py-1" style={{ backgroundColor: '#375494' }}>
                <input
                    className="form-control me-1"
                    placeholder="Type Your Message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        borderRadius: '15px',
                        fontSize: '11px',
                        padding: '4px 8px'
                    }}
                />
                <FaPaperclip color="white" className="mx-1" size={12} />
                <FaSmile color="white" className="mx-1" size={12} />
                <FaMicrophone color="white" className="mx-1" size={12} />
                <FaPaperPlane
                    color="white"
                    className="mx-1"
                    style={{ cursor: 'pointer' }}
                    size={12}
                    onClick={handleSend}
                />
            </div>
        </div>
    );
};

export default Chankya;
