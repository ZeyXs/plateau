import React, { useState, useEffect } from 'react';

const CARD_TO_FILENAME = {
    // Mille bornes
    KM25: "25",
    KM50: "50",
    KM75: "75",
    KM100: "100",
    KM200: "200",

    FEU_ROUGE: "feu_rouge",
    PANNE_D_ESSENCE: "panne_essence",
    ACCIDENT: "accident",
    CREVAISON: "crevaison",
    LIMITE_DE_VITESSE: "limitation_vitesse",

    FEU_VERT: "feu_vert",
    ESSENCE: "essence",
    REPARATION: "reparations",
    ROUE_DE_SECOURS: "roue_secours",
    FIN_DE_LIMITATION_DE_VITESSE: "fin_limitation_vitesse",

    VEHICULE_PRIORITAIRE: "vehicule_prioritaire",
    CITERNE_D_ESSENCE: "citerne_essence",
    INCREVABLE: "increvable",
    AS_DU_VOLANT: "as_volant",

    DOS_CARTE: "dos_carte",
};

const Cards = ({ type, width, height, disabled }) => {
    const [cardSrc, setCardSrc] = useState(null);

    useEffect(() => {
        const fetchCard = async () => {
            if (type.includes("CARD_")) {
                const number = type.replace("CARD_", "");
                const { default: svg } = await import(`../../assets/sixquiprend/${number}.svg`);
                setCardSrc(svg);
            } else if (type.substring(0, 2) === "b_") {
                const { default: svg } = await import(`../../assets/bataille/${type}.svg`);
                setCardSrc(svg);
            } else {
                const { default: svg } = await import(`../../assets/millebornes_min/${CARD_TO_FILENAME[type]}.svg`);
                setCardSrc(svg);
            }
        };
        fetchCard();
    }, [type]);

    return (
        <div className={`w-${width} h-${height} z-10 rounded-lg scale-100 bg-black`}>
            {cardSrc && <img src={cardSrc} className={`rounded-lg object-cover ${disabled ? "opacity-35 transition ease-in-out" : ""}`} />}
        </div>
    );
};

Cards.defaultProps = {
    width: "32",
    height: "44",
};

export default Cards;
