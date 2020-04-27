

abstract class Singleton<T> {

    public static getInstance<T>(Class: new(params: any) => T, params : any = undefined) : T {
        // @ts-ignore
        if( !Class.instance ) {
            // @ts-ignore
            Class.instance = new Class(params);
        }
        // @ts-ignore
        return Class.instance;
    }

}



export default Singleton;
