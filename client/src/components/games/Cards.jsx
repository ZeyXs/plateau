// Mille bornes

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

// 6 Qui prend !
import CARD_1 from '../../assets/sixquiprend/1.svg';
import CARD_2 from '../../assets/sixquiprend/2.svg';
import CARD_3 from '../../assets/sixquiprend/3.svg';
import CARD_4 from '../../assets/sixquiprend/4.svg';
import CARD_5 from '../../assets/sixquiprend/5.svg';
import CARD_6 from '../../assets/sixquiprend/6.svg';
import CARD_7 from '../../assets/sixquiprend/7.svg';
import CARD_8 from '../../assets/sixquiprend/8.svg';
import CARD_9 from '../../assets/sixquiprend/9.svg';
import CARD_10 from '../../assets/sixquiprend/10.svg';
import CARD_11 from '../../assets/sixquiprend/11.svg';
import CARD_12 from '../../assets/sixquiprend/12.svg';
import CARD_13 from '../../assets/sixquiprend/13.svg';
import CARD_14 from '../../assets/sixquiprend/14.svg';
import CARD_15 from '../../assets/sixquiprend/15.svg';
import CARD_16 from '../../assets/sixquiprend/16.svg';
import CARD_17 from '../../assets/sixquiprend/17.svg';
import CARD_18 from '../../assets/sixquiprend/18.svg';
import CARD_19 from '../../assets/sixquiprend/19.svg';
import CARD_20 from '../../assets/sixquiprend/20.svg';
import CARD_21 from '../../assets/sixquiprend/21.svg';
import CARD_22 from '../../assets/sixquiprend/22.svg';
import CARD_23 from '../../assets/sixquiprend/23.svg';
import CARD_24 from '../../assets/sixquiprend/24.svg';
import CARD_25 from '../../assets/sixquiprend/25.svg';
import CARD_26 from '../../assets/sixquiprend/26.svg';
import CARD_27 from '../../assets/sixquiprend/27.svg';
import CARD_28 from '../../assets/sixquiprend/28.svg';
import CARD_29 from '../../assets/sixquiprend/29.svg';
import CARD_30 from '../../assets/sixquiprend/30.svg';
import CARD_31 from '../../assets/sixquiprend/31.svg';
import CARD_32 from '../../assets/sixquiprend/32.svg';
import CARD_33 from '../../assets/sixquiprend/33.svg';
import CARD_34 from '../../assets/sixquiprend/34.svg';
import CARD_35 from '../../assets/sixquiprend/35.svg';
import CARD_36 from '../../assets/sixquiprend/36.svg';
import CARD_37 from '../../assets/sixquiprend/37.svg';
import CARD_38 from '../../assets/sixquiprend/38.svg';
import CARD_39 from '../../assets/sixquiprend/39.svg';
import CARD_40 from '../../assets/sixquiprend/40.svg';
import CARD_41 from '../../assets/sixquiprend/41.svg';
import CARD_42 from '../../assets/sixquiprend/42.svg';
import CARD_43 from '../../assets/sixquiprend/43.svg';
import CARD_44 from '../../assets/sixquiprend/44.svg';
import CARD_45 from '../../assets/sixquiprend/45.svg';
import CARD_46 from '../../assets/sixquiprend/46.svg';
import CARD_47 from '../../assets/sixquiprend/47.svg';
import CARD_48 from '../../assets/sixquiprend/48.svg';
import CARD_49 from '../../assets/sixquiprend/49.svg';


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

    const getSixQuiPrendCard = (type) => {
        const number = type.replace("CARD_", "");
        return '../../assets/sixquiprend/' + number + '.svg';
    }

    return (
        <div className={`w-${width} h-${height} z-10 rounded-lg scale-100 bg-black`}>
            <img src={type.includes("CARD_") ? getSixQuiPrendCard(type) : CARD_DESIGN[type]} className={`rounded-lg object-cover ${disabled ? "opacity-35 transition ease-in-out" : ""}`} />
        </div>
    );
};

Cards.defaultProps = {
    width: "32",
    height: "44",
};

export default Cards;