import Model from './model';

class Graphql {
    constructor(model: Model) {
        model = Object.assign(model, {
            graphql: {}
        })
    }
}