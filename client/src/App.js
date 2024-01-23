// Importation des différentes "pages"
import Register from './components/Register';
import Login from './components/Login';
import Unauthorized from './components/auth/Unauthorized';
import Missing from './components/Missing';
import Game from './components/Game';
import Debug from './components/auth/Debug';
import Home from './components/home/Home';

import RequireAuth from './components/auth/RequireAuth';
import PersistLogin from './components/auth/PersistLogin';

// Importations utilitaires
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './index.css';
import GameValidity from './components/GameValidity';

const ROLES = {
    User: 2001,
    Admin: 5150,
};

const SOCKET_URI = process.env.REACT_APP_SERVER_URI;

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* routes publiques */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="unauthorized" element={<Unauthorized />} />

                {/* routes protégées */}
                <Route element={<PersistLogin />}>
                    <Route path="/" element={<Home />} />
                    <Route
                        element={<RequireAuth allowedRoles={[ROLES.User]} />}>
                        <Route path="debug" element={<Debug />} />
                    </Route>

                    <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
                        <Route element={<GameValidity />}>
                            <Route path="game/:code" element={<Game />} />
                        </Route>
                    </Route>
                </Route>

                {/* route inexistante */}
                <Route path="*" element={<Missing />} />
            </Route>
        </Routes>
    );
}

export default App;
