import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";


const SearchBar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState('');

    const handleSearch = () => {
        // faire en sorte que lorsqu'il est déjà sur la page de l'utilisateur recherché, il raffraichisse quand même les données
        navigate(`/user/${user}`, { replace: true });
    };

    return (
        <div>
            <label
                className="mb-2 text-sm font-medium sr-only text-white">
                Search
            </label>
            <div className="relative">
                <input
                    type="text"
                    className="block w-full ps-5 px-28 text-sm py-[0.625rem] rounded-3xl bg-[#4b4a5a] text-white"
                    placeholder="Rechercher un utilisateur..."
                    autoComplete="off"
                    onChange={e => setUser(e.target.value)}
                    value={user}
                    required
                />
                <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-[0.300rem] bg-[#231f31] hover:bg-[#2f2a42] rounded-3xl px-3 py-2"
                    onClick={handleSearch}>
                    <FaSearch size={15} color="#9a8bcc"/>
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
