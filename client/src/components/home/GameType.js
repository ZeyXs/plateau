import { useState } from "react";

const GameType = ({ title, bg, onClick }) => {
    
    const [selected, setSelected] = useState(false);

    return (
        <div className={`rounded-lg border-2 border-white p-3`} onClick={onClick}>
            {title}
        </div>
    );
};


export default GameType;