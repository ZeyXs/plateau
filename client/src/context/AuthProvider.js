import { createContext, useEffect, useState } from "react";

// Création du contexte AuthContext avec la valeur par défaut {}
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const storedAuth = JSON.parse(localStorage.getItem("auth")) || {};
    const [auth, setAuth] = useState(storedAuth);
    const [persist, setPersist] = useState(true);
    //const [persist, setPersist] = useState(JSON.parse(localStorage.getItem("persist")) || false);

    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    return (
        // Transmission des valeurs auth et setAuth sur chacun des components enfants en leur appliquant le contexte "AuthContext"
        <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 