// Importation des différentes "pages"
import Register from './components/Register';
import Login from './components/Login';
import Unauthorized from './components/auth/Unauthorized';
import Missing from './components/Missing';
import Game from './components/Game';
import Debug from './components/auth/Debug';
import Home from './components/home/Home';
import User from './components/User';
import Leaderboard from './components/Leaderboard';

import RequireAuth from './components/auth/RequireAuth';
import PersistLogin from './components/auth/PersistLogin';

// Importations utilitaires
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import './index.css';
import GameValidity from './components/GameValidity';
import { GameProvider } from './context/GameProvider';
import Shop from './components/Shop';

const ROLES = {
    User: 2001,
    Admin: 5150,
};

function App() {

    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* routes publiques */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="user/:username" element={<User />}/>
                <Route path="leaderboard" element={<Leaderboard />}/>

                {/* routes protégées */}
                <Route element={<PersistLogin />}>
                    <Route path="/" element={<Home />} />
                    <Route
                        element={<RequireAuth allowedRoles={[ROLES.User]} />}>
                        <Route path="debug" element={<Debug />} />
                        <Route path="shop" element={<Shop />}/>
                    </Route>
                    
                    <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
                        <Route element={<GameValidity />}>
                            <Route path="game/:code" element={<GameProvider><Game /></GameProvider>} />
                        </Route>
                    </Route>
                    <Route path="game/" element={<Navigate to="/" state={{ from: location }} />}></Route>
                </Route>

                {/* route inexistante */}
                <Route path="*" element={<Missing />} />
            </Route>
        </Routes>
    );
}

export default App;
