import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get("/refresh", {
            withCredentials: true, // permet d'envoyer également le cookie httpOnly (jwt)
        });

        setAuth((prev) => {
            console.log(`aT useRefreshToken : ${response.data.accessToken}`);
            return {
                ...prev,
                roles: response.data.roles,
                accessToken: response.data.accessToken,
            };
        });
        // Renvoie le nouveau accessToken
        return response.data.accessToken;
    };
    return refresh;
};

export default useRefreshToken;
