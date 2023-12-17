import { useNavigate } from "react-router-dom";

const Unauthorized = () => {

    const navigate = useNavigate();
    const goBack = () => navigate(-1);

    return (
        <section>
            <h1>Non autorisé</h1>
            <br/>
            <p>Vous n'avez pas accès à la page demandée.</p>
            <div className="flexGrow">
                <button onClick={goBack}>Retourner en arrière</button>
            </div>
        </section>
    );
};

export default Unauthorized;