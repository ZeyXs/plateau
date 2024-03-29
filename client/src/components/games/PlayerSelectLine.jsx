import React from 'react';
import Cards from './Cards';

const PlayerSelectLine = ({ lines }) => {
    return (
        <div className="relative">
            <div className="absolute flex items-center justify-center backdrop-blur-[2px] bg-black w-full h-[96vh] bg-opacity-50 z-[100]">
                <div className="flex flex-col space-y-4 ml-8">
                    {lines.map((line, i) => (
                        <div key={i} className="flex flex-row space-x-2">
                            <ul>
                                {line.map((card, index) => (
                                    <div key={index} className="w-[75px] h-[105px]">
                                        <Cards type={`CARD_${card}`} width="[75px]" height="[105px]" />
                                    </div>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerSelectLine;
