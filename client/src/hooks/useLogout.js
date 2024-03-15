import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        try {
            await axios("/logout", {
                withCredentials: true,
            });
        } catch (err) {
            console.error(err);
        }
        
        setAuth({});
        localStorage.removeItem("auth");
    };

    return logout;
};

export default useLogout;
