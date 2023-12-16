import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";


const Users = () => {
    const [users, setUsers] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const getUsers = async () => {
            try {
                const response = await axiosPrivate.get('/users', {
                    signal: controller.signal
                });
                isMounted && setUsers(response.data);
            } catch(err) {
                console.error(err);
                navigate('/login', { state: {from: location}, replace: true })
            }
        }

        getUsers();
        
        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    return (
        <article>
            <h2>Liste des utilisateurs</h2>
            {users?.length
                ? (
                    <ul>
                        {users.map((user, i) => <li key={i}>{user?.username}</li>)}
                    </ul>
                ) : <p>Pas d'utilisateur à afficher</p>
            }
        </article>
    );
};

export default Users;