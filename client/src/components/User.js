import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './home/Navbar'; 
import axios from '../api/axios';

const User = () => {
    const { username } = useParams();
    const [userData, setUserData] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isServerDown, setIsServerDown] = useState(false);

    useEffect(() => {
        let data;
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/api/user/${username}`);
                data = response?.data;
            } catch (err) {
                if (!err?.message) {
                    console.log(
                        '[User.js] Warning: Failed to fetch user data from API. (API_UNAVAILABLE)',
                    );
                    setIsServerDown(true);
                } else if (err.response?.status == 404)
                    console.log(
                        '[User.js] Warning: Failed to fetch user data from API. (USER_NOT_FOUND)',
                    );
                data = {};
            } finally {
                setUserData(data);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return isLoading ? (
        <p className="text-white">Chargement en cours...</p>
    ) : isServerDown ? (
        <p className="text-white">
            Failed to fetch user data from API. (API_UNAVAILABLE)
        </p>
    ) : Object.keys(userData).length == 0 ? (
        <p className="text-white">
            Désolé, nous n'avons pas trouvé d'utilisateur nommé {username}.
        </p>
    ) : (
        <>
            <Navbar />
            <div className="text-white h-[100vh] text-center flex flex-col space-y-5">
                <div className="my-auto">
                    <h1>{userData.username}</h1>
                    <h4>
                        Id: <i>{userData._id}</i>
                    </h4>
                    <img
                        src={userData.profilePicture}
                        width="100"
                        height="100"
                        className="mx-auto"
                    />
                    <hr />
                    <ul>
                        {Object.entries(userData.stats).map(game => (
                            <li>
                                <h3>
                                    <u>{game[0]}</u>
                                </h3>
                                <ul style={{ paddingLeft: '30px' }}>
                                    {Object.entries(game[1]).map(stats => (
                                        <li>
                                            <b>{stats[0]}</b> : {stats[1]}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default User;
