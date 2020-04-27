class Redis {
    private readonly seed : number | undefined;
    constructor() {
        // this.seed = Math.random();
    }

    public getSeed() {
        return this.seed;
    }
}

export default new Redis();