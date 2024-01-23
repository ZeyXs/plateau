import { createContext, useState } from "react";

// Création du contexte ErrContext avec la valeur par défaut {}
const ErrContext = createContext("");

export const ErrorProvider = ({ children }) => {
    const [globalErr, setGlobalErr] = useState("");
    
    return (
        // Transmission des valeurs globalErr et setGlobalErr sur chacun des components enfants en leur appliquant le contexte "ErrContext" 
        <ErrContext.Provider value={{globalErr, setGlobalErr}}>
            {children}
        </ErrContext.Provider>
    )
};

export default ErrContext;