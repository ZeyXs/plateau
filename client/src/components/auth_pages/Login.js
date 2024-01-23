import { useRef, useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { GiPokerHand } from "react-icons/gi";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";

import axios from "../../api/axios";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, setAuth } = useAuth();
    // Sauvegarde d'où le client vient
    const from = location.state?.from?.pathname || "/";

    // Variables de focus
    const userRef = useRef();
    const errRef = useRef();

    // Variables champs de saisie
    const [user, setUser] = useState("");
    const [pwd, setPwd] = useState("");

    // Variables erreur
    const [errMsg, setErrMsg] = useState("");

    // Au load de la page, se focus sur le champ de saisie nom utilisateur
    useEffect(() => {
        console.log(`[Login.js] ${auth?.accessToken}`);
        console.log(`[Login.js] ${auth?.username}`);
        userRef.current.focus();
    }, []);

    // Suppression du message d'erreur lors de la modification d'un champ
    useEffect(() => {
        setErrMsg("");
    }, [user, pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // cancel la soumission de base (celle d'html)
        try {
            const response = await axios.post(
                "/auth",
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, roles, accessToken });
            setUser("");
            setPwd("");
            // Redirection vers la page
            // ex: <page protégée x> -> <login> -> <page protégée x>
            navigate(from, { replace: true });
        } catch (err) {
            if (!err?.response)
                setErrMsg("Pas de réponse du serveur. Réessayez plus tard.");
            else if (err.response?.status === 400)
                setErrMsg(`Nom d'utilisateur ou mot de passe manquant.`);
            else if (err.response?.status === 401)
                setErrMsg(`Nom d'utilisateur et/ou mot de passe incorrect.`);
            else setErrMsg("Connexion échouée");
            errRef.current.focus();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-[100vh] text-gray-300">
            {/* Affichage message d'erreur */}
            <p
                ref={errRef}
                className={
                    errMsg
                        ? "flex flex-row items-center bg-red-500 text-white p-2 rounded-xl mb-5"
                        : "offscreen"
                }
                aria-live="assertive"
            >
                {errMsg ? (
                    <span className="px-[3px]">
                        <IoIosWarning size={20} />
                    </span>
                ) : (
                    ""
                )}
                {errMsg}
            </p>

            <a
                href="/"
                className="flex flex-row items-center mb-3 text-3xl font-bold text-white"
            >
                <GiPokerHand size={70} color="#984ed4" />
                <span className="px-2">Plateau</span>
            </a>

            <div className="flex flex-row items-center justify-center">
                <div className="px-10 h-[2px] my-8 border-0 bg-gray-300 rounded-xl"></div>
                <span className="px-3 text-lg">Connexion</span>
                <div className="px-10 h-[2px] my-8 border-0 bg-gray-300 rounded-xl"></div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-5 w-[300px]"
            >
                {/* _____ Champ nom utilisateur _____ */}
                <div className="relative">
                    <div className="absolute inset-y-0 start-1 flex items-center ps-3 pointer-events-none">
                        <FaUser size={14} color="#e3e3e3" />
                    </div>
                    <input
                        className="bg-[#0e0e14] rounded-3xl p-2 ps-10 py-2 placeholder-[#59595d] placeholder:font-bold placeholder:text-sm"
                        placeholder="Nom d'utilisateur"
                        type="text"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        required
                    />
                </div>

                {/* _____ Champ mot de passe _____ */}
                <div className="relative">
                    <div className="absolute inset-y-0 start-1 flex items-center ps-3 pointer-events-none">
                        <FaLock size={14} color="#e3e3e3" />
                    </div>
                    <input
                        className="bg-[#0e0e14] rounded-3xl p-2 ps-10 py-2 placeholder-[#59595d] placeholder:font-bold placeholder:text-sm"
                        placeholder="Mot de passe"
                        type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-yellow-500 to-yellow-300 disabled:from-gray-600 disabled:to-gray-400 h-10 rounded-3xl mx-auto w-full"
                    disabled={auth?.accessToken}
                >
                    <div className="flex justify-center items-center">
                        <span className="font-bold px-[5px]">Se connecter</span>
                    </div>
                </button>
            </form>

            <p className="flex flex-row mt-10 text-sm">
                Pas de compte ?
                <span className="px-2 line text-gray-500 underline">
                    <a href="/register">S'inscrire</a>
                </span>
            </p>
        </div>
    );
};

export default Login;
