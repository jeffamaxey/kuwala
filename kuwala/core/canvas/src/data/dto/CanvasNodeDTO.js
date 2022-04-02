module.exports = class CanvasNodeDTO {
    constructor
    ({
         id,
         dataCatalogItemId,
         connectionParameters,
         connected,
         logo,
         name
     }) {
        this.id = id
        this.dataCatalogItemId = dataCatalogItemId
        this.connectionParameters = connectionParameters
        this.connected = connected
        this.logo = logo
        this.name = name
    }
}