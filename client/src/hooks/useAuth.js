import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
    // Retourne les valeurs contenues dans le contexte "AuthContext"
    return useContext(AuthContext);
};

export default useAuth;
