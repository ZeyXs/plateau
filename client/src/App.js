// Importation des différentes "pages"
import Register from './components/Register';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import Missing from './components/Missing';
import Game from './components/Game';
import Home from './components/Home';

import RequireAuth from './components/RequireAuth';
import PersistLogin from './components/PersistLogin';

// Importations utilitaires 
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const ROLES = {
  'User': 2001,
  'Admin': 5150
};

function App() {

  return (
        
    <Routes>
      <Route path="/" element={<Layout/>}>
        
        {/* routes publiques */}
        <Route path="login" element={<Login/>}/>
        <Route path="register" element={<Register/>}/>
        <Route path="unauthorized" element={<Unauthorized/>}/>

        {/* routes protégées */}
        <Route element={<PersistLogin/>}>
          <Route element={<RequireAuth allowedRoles={[ROLES.User]}/>}>
            <Route path="home" element={<Home/>}/>
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.User]}/>}>
            <Route path="game/:code" element={<Game/>}/>
          </Route>
        </Route>

        {/* route inexistante */}
        <Route path="*" element={<Missing/>}/>

      </Route>
    </Routes>
  
  );
}

export default App;
