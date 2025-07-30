import React from 'react';

interface BottomComponentProps {
    section: 'left' | 'middle' | 'right';
}

const BottomComponent: React.FC<BottomComponentProps> = ({ section }) => {
    return (
        <div className={`bottom-section bottom-${section}`}>
            <h5>Bottom {section.charAt(0).toUpperCase() + section.slice(1)}</h5>
            {/* Add your content for the {section} bottom area here */}
            <p>Content for the {section} bottom section.</p>
        </div>
    );
};

export default BottomComponent;