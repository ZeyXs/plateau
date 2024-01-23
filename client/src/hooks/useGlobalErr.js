import { useContext } from "react";
import ErrContext from "../context/ErrorProvider";

const useErr = () => {
    // Retourne les valeurs contenues dans le contexte "ErrContext"
    return useContext(ErrContext);
}

export default useErr;