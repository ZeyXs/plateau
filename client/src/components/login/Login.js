import { useRef, useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { GiPokerHand } from 'react-icons/gi';
import { useNavigate, useLocation } from 'react-router-dom';

import axios from '../../api/axios';

const Login = () => {
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    // Sauvegarde d'où le client vient
    const from = location.state?.from?.pathname || '/';

    // Variables de focus
    const userRef = useRef();
    const errRef = useRef();

    // Variables champs de saisie
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');

    // Variables erreur
    const [errMsg, setErrMsg] = useState('');

    // Au load de la page, se focus sur le champ de saisie nom utilisateur
    useEffect(() => {
        userRef.current.focus();
    }, []);

    // Suppression du message d'erreur lors de la modification d'un champ
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd]);

    const handleSubmit = async e => {
        e.preventDefault(); // cancel la soumission de base (celle d'html)
        try {
            const response = await axios.post(
                '/auth',
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                },
            );
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, pwd, roles, accessToken });
            setUser('');
            setPwd('');
            // Redirection vers la page
            // ex: <page protégée x> -> <login> -> <page protégée x>
            navigate(from, { replace: true });
        } catch (err) {
            if (!err?.response) setErrMsg('Pas de réponse du serveur');
            else if (err.response?.status === 400)
                setErrMsg(`Nom d'utilisateur ou mot de passe manquant`);
            else if (err.response?.status === 401)
                setErrMsg(`Nom d'utilisateur et/ou mot de passe incorrect`);
            else setErrMsg('Connection échouée');
            errRef.current.focus();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-[100vh]">
            {/* Affichage message d'erreur */}
            <p
                ref={errRef}
                className={errMsg ? 'errmsg' : 'offscreen'}
                aria-live="assertive">
                {errMsg}
            </p>

            <a
                href="/"
                className="flex flex-row items-center mb-6 text-3xl font-bold text-white">
                <GiPokerHand size={70} />
                <span className="px-2">Plateau</span>
            </a>

            <p className="flex flex-row">Connexion</p>

            <div className="">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* _____ Champ nom utilisateur _____ */}
                    <input
                        className="bg-[#4e3e5f] rounded-3xl px-6 py-2"
                        type="text"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={e => setUser(e.target.value)}
                        value={user}
                        required
                    />

                    {/* _____ Champ mot de passe _____ */}
                    <label htmlFor="password">Mot de passe :</label>
                    <input
                        type="password"
                        id="password"
                        onChange={e => setPwd(e.target.value)}
                        value={pwd}
                        required
                    />

                    <button type="submit">Se connecter</button>
                </form>
            </div>
            <p>
                Pas de compte ?<br />
                <span className="line">
                    <a href="/register">S'inscrire</a>
                </span>
            </p>
        </div>
    );
};

export default Login;
