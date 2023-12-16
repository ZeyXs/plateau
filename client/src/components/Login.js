import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import axios from '../api/axios';

const Login = () => {
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    // Sauvegarde d'où le client vient
    const from = location.state?.from?.pathname || "/"

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
    }, [])

    // Suppression du message d'erreur lors de la modification d'un champ
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])


    const handleSubmit = async (e) => {
        e.preventDefault(); // cancel la soumission de base (celle d'html)
        try {
            const response = await axios.post('/auth',
                JSON.stringify({ "username":user, "password":pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
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
            else if (err.response?.status === 400) setErrMsg(`Nom d'utilisateur ou mot de passe manquant`);
            else if (err.response?.status === 401) setErrMsg(`Nom d'utilisateur et/ou mot de passe incorrect`);
            else setErrMsg('Connection échouée');
            errRef.current.focus();
        }
    }

    return (

        <section>
            {/* Affichage message d'erreur */}
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            
            <h1>Connexion</h1>

            <form onSubmit={handleSubmit}>

                {/* _____ Champ nom utilisateur _____ */}
                <label htmlFor="username">Nom d'utilisateur :</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />

                {/* _____ Champ mot de passe _____ */}
                <label htmlFor="password">Mot de passe :</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />

                <button type="submit">Se connecter</button>
            </form>
            <p>
                Pas de compte ?<br/>
                <span className="line">
                    <a href="/register">S'inscrire</a>
                </span>
            </p>
        </section>
    )

}

export default Login