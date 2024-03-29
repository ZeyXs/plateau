import KM25 from '../../assets/millebornes_min/25.svg';
import KM50 from '../../assets/millebornes_min/50.svg';
import KM75 from '../../assets/millebornes_min/75.svg';
import KM100 from '../../assets/millebornes_min/100.svg';
import KM200 from '../../assets/millebornes_min/200.svg';

import FEU_ROUGE from '../../assets/millebornes_min/feu_rouge.svg';
import PANNE_D_ESSENCE from '../../assets/millebornes_min/panne_essence.svg';
import ACCIDENT from '../../assets/millebornes_min/accident.svg';
import CREVAISON from '../../assets/millebornes_min/crevaison.svg';
import LIMITATION_DE_VITESSE from '../../assets/millebornes_min/limitation_vitesse.svg';

import FEU_VERT from '../../assets/millebornes_min/feu_vert.svg';
import ESSENCE from '../../assets/millebornes_min/essence.svg';
import REPARATIONS from '../../assets/millebornes_min/reparations.svg';
import ROUE_DE_SECOURS from '../../assets/millebornes_min/roue_secours.svg';
import FIN_DE_LIMITATION_DE_VITESSE from '../../assets/millebornes_min/fin_limitation_vitesse.svg';

import VEHICULE_PRIORITAIRE from '../../assets/millebornes_min/vehicule_prioritaire.svg';
import CITERNE_D_ESSENCE from '../../assets/millebornes_min/citerne_essence.svg';
import INCREVABLE from '../../assets/millebornes_min/increvable.svg';
import AS_DU_VOLANT from '../../assets/millebornes_min/as_volant.svg';

import DOS_CARTE from '../../assets/millebornes_min/dos_carte.svg';


const CARD_DESIGN = {
    // Mille bornes
    KM25: KM25,
    KM50: KM50,
    KM75: KM75,
    KM100: KM100,
    KM200: KM200,

    FEU_ROUGE: FEU_ROUGE,
    PANNE_D_ESSENCE: PANNE_D_ESSENCE,
    ACCIDENT: ACCIDENT,
    CREVAISON: CREVAISON,
    LIMITE_DE_VITESSE: LIMITATION_DE_VITESSE,

    FEU_VERT: FEU_VERT,
    ESSENCE: ESSENCE,
    REPARATION: REPARATIONS,
    ROUE_DE_SECOURS: ROUE_DE_SECOURS,
    FIN_DE_LIMITATION_DE_VITESSE: FIN_DE_LIMITATION_DE_VITESSE,

    VEHICULE_PRIORITAIRE: VEHICULE_PRIORITAIRE,
    CITERNE_D_ESSENCE: CITERNE_D_ESSENCE,
    INCREVABLE: INCREVABLE,
    AS_DU_VOLANT: AS_DU_VOLANT,

    DOS_CARTE: DOS_CARTE,
};

const Cards = ({ type, width, height, disabled }) => {
    return (
        <div className={`w-${width} h-${height} z-10 rounded-lg scale-100 bg-black`}>
            <img src={CARD_DESIGN[type]} className={`rounded-lg object-cover ${disabled ? "opacity-35 transition ease-in-out" : ""}`} />
        </div>
    );
};

Cards.defaultProps = {
    width: "32",
    height: "44",
};

export default Cards;