import { useNavigate } from "react-router-dom";

const Rejoin = () => {

    const codeToRejoin = localStorage.getItem("brutallyLeft") || "";

    //const { auth } = useAuth();
    const navigate = useNavigate();

    const acceptReconnect = () => {
        localStorage.removeItem("brutallyLeft");
        navigate(`/game/${codeToRejoin}`, { replace: true });
    }

    const refuseReconnect = () => {
        localStorage.removeItem("brutallyLeft");
        document.getElementById("reconnection_popup").remove();
    }

    return (
        !codeToRejoin ? <></> :
        <div id="reconnection_popup">
            <p>Il semblerait que vous ayez été abruptement déconnecté de votre dernière partie, souhaitez-vous la rejoindre ?</p><br/>
            <button onClick={acceptReconnect}>Oui</button><button onClick={refuseReconnect}>Non</button>
        </div>
                
    );
};

export default Rejoin;