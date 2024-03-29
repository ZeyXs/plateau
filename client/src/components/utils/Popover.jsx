import { useState } from 'react';

const Popover = ({ children, content }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true); 
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <div
            className="flex flex-row"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isHovered && (
                <div className="absolute">
                    {content}
                </div>
            )}
        </div>
    );
};

export default Popover;