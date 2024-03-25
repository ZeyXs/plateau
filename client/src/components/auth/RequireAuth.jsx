import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RequireAuth = ({ allowedRoles }) => {
    // Récupération de l'objet "auth" via le contexte "AuthContext"
    // (voir le fichier useAuth.js)
    const { auth } = useAuth();

    // Récupération des informations relatives à l'URL actuelle
    const location = useLocation();

    return (
        // Vérifie si l'utilisateur possède un des rôles autorisés
        auth?.roles?.find(role => allowedRoles?.includes(role)) ? (
            <Outlet />
        ) : auth?.accessToken ? ( // Dans le cas où l'utilisateur ne possède pas le rôle, on vérifie si celui-ci est authentifié
            <Navigate to="/unauthorized" state={{ from: location }} replace />
        ) : (
            <Navigate to="/login" state={{ from: location }} replace />
        )
        // state={{ from: location }} replace -> Permet de retourner sur la page précédente
    );
};

export default RequireAuth;
