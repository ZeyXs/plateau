import { useRef, useState, useEffect } from "react";
import { IoIosWarning } from "react-icons/io";
import axios from "../../api/axios";
import { GiPokerHand } from "react-icons/gi";
import { FaInfo, FaLock, FaUser } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import Popup from "../utils/Popup";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = () => {
    // Variables de focus
    const userRef = useRef();
    const errRef = useRef();
    // Variables champ nom utilisateur
    const [user, setUser] = useState("");
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    // Variables champ mot de passe
    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    // Variables champ confirmation mot de passe
    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // Variables erreur / succès
    const [errMsg, setErrMsg] = useState("");
    const [validMsg, setValidMsg] = useState("");

    // Au load de la page, se focus sur le champ de saisie nom utilisateur
    useEffect(() => {
        userRef.current.focus();
    }, []);

    // Vérification validité nom utilisateur
    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user]);

    // Vérification validité mot de passe
    // + correspondance avec champ de confirmation mdp
    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    // Suppression du message d'erreur lors de la modification d'un champ
    useEffect(() => {
        setErrMsg("");
    }, [user, pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // cancel la soumission de base (celle d'html)
        // si le bouton venait à être "enabled" avec un hack de JS
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        // Connexion à la base de données + sauvegarde nouveau user
        try {
            const response = await axios.post(
                "/register",
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            // Nettoyer les champs de saisie
            setUser("");
            setPwd("");
            setMatchPwd("");
            setValidMsg("Inscription realisée avec succès ! Vous pouvez désormais vous connecter.")
        } catch (err) {
            console.log(err);
            if (!err?.response)
                setErrMsg("Pas de réponse du serveur. Réessayez plus tard.");
            else if (err.response?.status === 409)
                setErrMsg("Ce nom d'utilisateur est déjà pris.");
            else setErrMsg("Inscription impossible. Réessayez plus tard.");
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

            {/* Affichage message de validation du register */}
            <p
                ref={errRef}
                className={
                    validMsg
                        ? "flex flex-row items-center bg-green-500 text-white p-2 rounded-xl mb-5"
                        : "offscreen"
                }
                aria-live="assertive"
            >
                {validMsg ? (
                    <span className="px-[3px]">
                        <FaInfoCircle size={20} />
                    </span>
                ) : (
                    ""
                )}
                {validMsg}
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
                <span className="px-3 text-lg">Inscription</span>
                <div className="px-10 h-[2px] my-8 border-0 bg-gray-300 rounded-xl"></div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-5 w-[300px]"
            >
                {/* _____ Champ nom d'utilisateur _____ */}

                {userFocus && user && !validName ? (
                    <Popup>
                        4 à 24 caractères.
                        <br />
                        Doit commencer par une lettre.
                        <br />
                        Lettres, chiffres, soulignés, traits d'union autorisés.
                    </Popup>
                ) : (
                    ""
                )}
                <div className="relative">
                    <div className="absolute inset-y-0 start-1 flex items-center ps-3 pointer-events-none">
                        <FaUser
                            size={14}
                            color={validName ? "#1fdb4b" : "#e3e3e3"}
                        />
                    </div>
                    <input
                        type="text"
                        className={`bg-[#0e0e14] rounded-3xl p-2 ps-10 py-2 placeholder-[#59595d] placeholder:font-bold placeholder:text-sm focus:outline-none ${
                            validName ? "focus:outline-green-400" : ""
                        }`}
                        placeholder="Nom d'utilisateur"
                        data-popover-target="popover-username"
                        id="username"
                        ref={userRef}
                        autoComplete="off" // Empêche de voir l'historique du champ
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        required
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote"
                        onFocus={() => setUserFocus(true)} // le client a cliqué sur le champ
                        onBlur={() => setUserFocus(false)} // le client est sorti du champ
                    />
                </div>

                {/* _____ Champ mot de passe _____ */}

                {pwdFocus && !validPwd ? (
                    <Popup>
                        <p>
                            8 à 24 caractères.
                            <br />
                            Doit comprendre des lettres majuscules et
                            minuscules, un chiffre et un caractère spécial.
                            <br />
                            Caractères spéciaux autorisés :{" "}
                            <span aria-label="exclamation mark">!</span>{" "}
                            <span aria-label="at symbol">@</span>{" "}
                            <span aria-label="hashtag">#</span>{" "}
                            <span aria-label="dollar sign">$</span>{" "}
                            <span aria-label="percent">%</span>
                        </p>
                    </Popup>
                ) : (
                    ""
                )}
                <div className="relative">
                    <div className="absolute inset-y-0 start-1 flex items-center ps-3 pointer-events-none">
                        <FaLock
                            size={14}
                            color={validPwd ? "#1fdb4b" : "#e3e3e3"}
                        />
                    </div>
                    <input
                        type="password"
                        className={`bg-[#0e0e14] rounded-3xl p-2 ps-10 py-2 placeholder-[#59595d] placeholder:font-bold placeholder:text-sm focus:outline-none ${
                            validPwd ? "focus:outline-green-400" : ""
                        }`}
                        placeholder="Mot de passe"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        aria-invalid={validPwd ? "false" : "true"}
                        aria-describedby="pwdnote"
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                        required
                    />
                </div>

                {/* _____ Champ confirmation mot de passe _____ */}
                {matchFocus && !validMatch ? (
                    <Popup>
                        Doit correspondre au premier champ de saisie du mot de
                        passe.
                    </Popup>
                ) : (
                    ""
                )}
                <div className="relative">
                    <div className="absolute inset-y-0 start-1 flex items-center ps-3 pointer-events-none">
                        <FaLock
                            size={14}
                            color={
                                validMatch && matchPwd ? "#1fdb4b" : "#e3e3e3"
                            }
                        />
                    </div>
                    <input
                        type="password"
                        className={`bg-[#0e0e14] rounded-3xl p-2 ps-10 py-2 placeholder-[#59595d] placeholder:font-bold placeholder:text-sm focus:outline-none ${
                            validMatch && matchPwd
                                ? "focus:outline-green-400"
                                : ""
                        }`}
                        placeholder="Confirmation mot de passe"
                        data-popover-target="popover-default"
                        id="confirm_pwd"
                        onChange={(e) => setMatchPwd(e.target.value)}
                        value={matchPwd}
                        required
                        aria-invalid={validMatch ? "false" : "true"}
                        aria-describedby="confirmnote"
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                    />
                </div>

                <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-yellow-500 to-yellow-300 disabled:from-gray-600 disabled:to-gray-400  h-10 rounded-3xl mx-auto w-full"
                    disabled={
                        !validName || !validPwd || !validMatch ? true : false
                    }
                >
                    <div className="flex justify-center items-center">
                        <span className="font-bold px-[5px]">
                            Créer un compte
                        </span>
                    </div>
                </button>
            </form>

            <p className="flex flex-row mt-10 text-sm">
                Déjà inscrit ?
                <span className="px-2 line text-gray-500 underline">
                    <a href="/login">Se connecter</a>
                </span>
            </p>
        </div>
    );
};

export default Register;
