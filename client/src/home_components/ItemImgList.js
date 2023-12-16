const ItemImgList = ({ idList, items }) => {
    return (
        <select id={idList}>
            {items.map((item) => (
                <option id={item.nom.toLowerCase()}>{item.nom}</option>
            ))}
        </select>
    );
}

export default ItemImgList;