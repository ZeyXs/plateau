import { useRef, useState, useEffect } from 'react';
import {
    faCheck,
    faTimes,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../api/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = () => {
    // Variables de focus
    const userRef = useRef();
    const errRef = useRef();

    // Variables champ nom utilisateur
    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    // Variables champ mot de passe
    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    // Variables champ confirmation mot de passe
    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // Variables erreur / succès
    const [errMsg, setErrMsg] = useState('');
    const { setSuccess } = useState(false);

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
        setErrMsg('');
    }, [user, pwd, matchPwd]);

    const handleSubmit = async e => {
        e.preventDefault(); // cancel la soumission de base (celle d'html)
        // si le bouton venait à être "enabled" avec un hack de JS
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg('Invalid Entry');
            return;
        }
        // Connection à la base de données + sauvegarde nouveau user
        try {
            const response = await axios.post(
                '/register',
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                },
            );
            console.log(response?.accessToken);
            setSuccess(true);
            // Nettoyer les champs de saisie
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) setErrMsg('No Server Response');
            else if (err.response?.status === 409) setErrMsg('Username Taken');
            else setErrMsg('Registration Failed');
            errRef.current.focus();
        }
    };

    return (
        <section>
            {/* Affichage message d'erreur */}
            <p
                ref={errRef}
                className={errMsg ? 'errmsg' : 'offscreen'}
                aria-live="assertive">
                {errMsg}
            </p>

            <h1>Inscription</h1>

            <form onSubmit={handleSubmit}>
                {/* _____ Champ nom d'utilisateur _____ */}
                <label htmlFor="username">
                    Nom d'utilisateur :
                    <span className={validName ? 'valid' : 'hide'}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validName || !user ? 'hide' : 'invalid'}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off" // Empêche de voir l'historique du champ
                    onChange={e => setUser(e.target.value)}
                    value={user}
                    required
                    aria-invalid={validName ? 'false' : 'true'}
                    aria-describedby="uidnote"
                    onFocus={() => setUserFocus(true)} // le client a cliqué sur le champ
                    onBlur={() => setUserFocus(false)} // le client est sorti du champ
                />
                <p
                    id="uidnote"
                    className={
                        userFocus && user && !validName
                            ? 'instructions'
                            : 'offscreen'
                    }>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    4 à 24 caractères.
                    <br />
                    Doit commencer par une lettre.
                    <br />
                    Lettres, chiffres, soulignés, traits d'union autorisés.
                </p>

                {/* _____ Champ mot de passe _____ */}
                <label htmlFor="password">
                    Mot de passe :
                    <FontAwesomeIcon
                        icon={faCheck}
                        className={validPwd ? 'valid' : 'hide'}
                    />
                    <FontAwesomeIcon
                        icon={faTimes}
                        className={validPwd || !pwd ? 'hide' : 'invalid'}
                    />
                </label>
                <input
                    type="password"
                    id="password"
                    onChange={e => setPwd(e.target.value)}
                    value={pwd}
                    required
                    aria-invalid={validPwd ? 'false' : 'true'}
                    aria-describedby="pwdnote"
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                />
                <p
                    id="pwdnote"
                    className={
                        pwdFocus && !validPwd ? 'instructions' : 'offscreen'
                    }>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8 à 24 caractères.
                    <br />
                    Doit comprendre des lettres majuscules et minuscules, un
                    chiffre et un caractère spécial.
                    <br />
                    Caractères spéciaux autorisés :{' '}
                    <span aria-label="exclamation mark">!</span>{' '}
                    <span aria-label="at symbol">@</span>{' '}
                    <span aria-label="hashtag">#</span>{' '}
                    <span aria-label="dollar sign">$</span>{' '}
                    <span aria-label="percent">%</span>
                </p>

                {/* _____ Champ confirmation mot de passe _____ */}
                <label htmlFor="confirm_pwd">
                    Confirmation du mot de passe :
                    <FontAwesomeIcon
                        icon={faCheck}
                        className={validMatch && matchPwd ? 'valid' : 'hide'}
                    />
                    <FontAwesomeIcon
                        icon={faTimes}
                        className={validMatch || !matchPwd ? 'hide' : 'invalid'}
                    />
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange={e => setMatchPwd(e.target.value)}
                    value={matchPwd}
                    required
                    aria-invalid={validMatch ? 'false' : 'true'}
                    aria-describedby="confirmnote"
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                />
                <p
                    id="confirmnote"
                    className={
                        matchFocus && !validMatch ? 'instructions' : 'offscreen'
                    }>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Doit correspondre au premier champ de saisie du mot de
                    passe.
                </p>

                <button
                    type="submit"
                    disabled={
                        !validName || !validPwd || !validMatch ? true : false
                    }>
                    S'inscrire
                </button>
            </form>
            <p>
                Déjà inscrit ?<br />
                <span className="line">
                    <a href="/login">Se connecter</a>
                </span>
            </p>
        </section>
    );
};

export default Register;
