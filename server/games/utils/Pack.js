class Pack {

    constructor() {
        this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        this.colors = ['Carreau', 'Coeur', 'Trèfle', 'Pique'];
        this.package = [];
    }

    createPack() {
        for (var v in this.values) {
            for (var c in this.colors) {
                this.package.push({
                    value: this.values[v],
                    color: this.colors[c],
                });
            }
        }
    }

    shufflePack() {
        for (let i = this.package.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.package[i], this.package[j]] = [
                this.package[j],
                this.package[i],
            ];
        }
    }

    get getPack() {
        return this.package;
    }
    
}

module.exports = Pack;
