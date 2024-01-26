import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState('');

    const handleSearch = () => {
        if(user) navigate(`/user/${user}`, { replace: true });
    }

    return (

        <div className="search">
            <label htmlFor="search_field"></label>
            <input
                type="text"
                id="search_field"
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                placeholder="nom d'utilisateur"
                value={user}
                required
            />
            <button id="search_button" onClick={handleSearch}>Rechercher</button>
        </div>


    );
};

export default SearchBar;