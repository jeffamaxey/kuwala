import { action, thunk } from "easy-peasy";
import {v4} from "uuid";
import {removeElements, addEdge} from 'react-flow-renderer'

import {getAllDataCatalogItems, saveSelectedDataCatalogItems} from '../../api/DataCatalogApi';
import {getDataSource} from '../../api/DataSourceApi';

const CanvasModel =  {
    elements: [],
    selectedElement: null,
    newNodeInfo: {},
    openDataView: false,
    dataSource: [],
    availableDataSource: [],
    selectedDataSource: [],
    canvasSelectedDataSource: [],
    selectedColumnAddress: [],
    selectedAddressObj: {},
    unConfiguredDataBlocks: [],
    dataBlocks: [],

    // Elements
    addNode: action((state, nodeInfo) => {
        const newNode = {
            id: v4(),
            ...nodeInfo
        };
        state.elements.push(newNode)
    }),
    updateNodePayloadByDataBlocks: action((state, {updatedNodeInfo, dataBlockId}) => {
        const updatedElements = state.elements.map((curEl) => {
            if(curEl.data.dataBlocks.dataBlockId === dataBlockId) {
                return {
                    ...curEl,
                    data: updatedNodeInfo.data
                }
            }
        });
        state.elements = updatedElements
    }),
    convertDataBlocksIntoElement: thunk(async (actions, nodeToRemove, {getState}) => {
        const {dataBlocks, elements} = getState();
        dataBlocks.forEach((el, i) => {
            const {dataSource, ...dataBlocks} = el;
            let dupeFlag = false;

            // Check if Data blocks already converted into node
            elements.forEach((curEl) => {
                if(curEl.data.dataBlocks.dataBlockId === dataBlocks.dataBlockId) dupeFlag = true;
            });

            const nodeInfo = {
                type: getNodeTypeByDataCatalogId(el.catalogItemType),
                data: {
                    label: 'Postgres',
                    dataSource: dataSource,
                    dataBlocks: dataBlocks,
                },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            if(dupeFlag) {
                // If node same node exists -> Update the node info
                actions.updateNodePayloadByDataBlocks({updatedNodeInfo: nodeInfo, dataBlockId: dataBlocks.dataBlockId})
            }else {
                // Else add new node
                actions.addNode({
                    ...nodeInfo,
                    position: {
                        x: -100,
                        y: Math.random() * window.innerHeight/2,
                    },
                })
            }
        });
    }),
    removeNode: thunk((actions, nodeToRemove, {getState}) => {
        actions.setElements(removeElements(getState().elements, nodeToRemove))
        actions.setSelectedElement(null)
    }),
    connectNodes: thunk((actions, params, {getState}) => {
        actions.setElements(addEdge(params, getState().elements))
    }),
    setElements: action((state, elements) => {
       state.elements = elements
    }),
    setSelectedElement: action((state, selectedNode) => {
        state.selectedElement = selectedNode
    }),
    setNewNodeInfo: action((state, newNodeInfo) => {
        state.newNodeInfo = newNodeInfo
    }),
    setOpenDataView: action((state, openDataView) => {
        state.openDataView = openDataView
    }),

    // Data Sources
    addDataSource: action((state, dataSource) => {
        state.dataSource = [...state.dataSource, ...dataSource]
    }),
    setDataSource: action((state, dataSource) => {
        state.dataSource = dataSource
    }),
    getDataSources: thunk(async (actions, params, {getState}) => {
        const result = await getDataSource();
        await actions.getAvailableDataSource();
        const dataCatalog = getState().availableDataSource;
        const populatedDataSource = result.data.map((e,i)=> {
            const data_catalog_item_id = e.data_catalog_item_id;
            const index = dataCatalog.findIndex((e, i) => {
                if(e.id === data_catalog_item_id) return true
            });
            return {
                ...e,
                logo: dataCatalog[index].logo,
                name: dataCatalog[index].name,
            }
        });
        actions.setDataSource(populatedDataSource)
    }),

    // Data Catalog
    setAvailableDataSource: action((state, newAvailableSource) => {
        state.availableDataSource = newAvailableSource
    }),

    getAvailableDataSource: thunk(async (actions) => {
        const response = await getAllDataCatalogItems();
        if (response.status === 200){
            const data = response.data
            actions.setAvailableDataSource(data)
        }else {
            actions.setAvailableDataSource([])
        }
    }),


    // Selected Data Sources
    setSelectedSources: action((state, newSelectedSources) => {
        state.selectedDataSource = newSelectedSources
    }),
    saveSelectedSources: thunk(async (actions, params, {getState}) => {
        const selectedSource = getState().selectedDataSource;

        if(selectedSource.length <= 0) {
            console.log("Selected source is empty")
            return;
        }
        const idList = selectedSource.map((el)=> el.id);
        await saveSelectedDataCatalogItems({
            item_ids: idList
        });
        actions.getDataSources()
    }),

    // Canvas Selected Data Source
    addDataSourceToCanvas: action((state, selectedDataSource) => {
        // Check for possible duplicate
        let isDuplicate = false;
        state.canvasSelectedDataSource.map((el) => {
            if (el.id === selectedDataSource.id) isDuplicate = true
        });

        if (!isDuplicate){
            state.canvasSelectedDataSource = [...state.canvasSelectedDataSource, selectedDataSource]
        }

    }),

    // Selected Column Address Action
    addSelectedColumnAddress: action((state, newAddress) => {
        let isDuplicate = false;
        const addressArray = newAddress.split('@');
        const schema = addressArray[0];
        const category = addressArray[1];
        const table = addressArray[2];
        const column = addressArray[3];

        let tempState = state.selectedAddressObj;
        if(typeof tempState[schema] === 'undefined') {
            tempState[schema] = {
                [category]: {
                    [table]: [column]
                }
            }
        } else if (typeof tempState[schema][category] === 'undefined'){
            tempState[schema][category] = {
                    [table]: [column]
            }
        } else if (typeof tempState[schema][category][table] === 'undefined') {
            tempState[schema][category][table] = [column]
        } else {
            tempState[schema][category][table].push(column)
            tempState[schema][category][table].forEach((el) => {
                if (el === newAddress) isDuplicate = true
            });

            if (!isDuplicate){
                // state.selectedColumnAddress = [...state.selectedColumnAddress, newAddress]
                state.selectedAddressObj = tempState
            }
        }
    }),

    removeSelectedColumnAddress: action((state, addressToRemove) => {
        const {schema, category, table, column} = columnAddressSplitter(addressToRemove);
        let tempState = state.selectedAddressObj
        try {
            const newSelectedTableList = tempState[schema][category][table].filter((el) => el !== column)
            tempState[schema][category][table] = newSelectedTableList
        } catch (e) {
            console.log(e)
        }
        state.selectedAddressObj = tempState
    }),

    generateStructureIfNotExists: action((state, columnAdress) => {
        const {schema, category, table} = columnAddressSplitter(columnAdress);

        let tempState = state.selectedAddressObj;
        if(typeof tempState[schema] === 'undefined') {
            tempState[schema] = {
                [category]: {
                    [table]: []
                }
            }
        } else if (typeof tempState[schema][category] === 'undefined'){
            tempState[schema][category] = {
                [table]: []
            }
        } else if (typeof tempState[schema][category][table] === 'undefined') {
            tempState[schema][category][table] = []
        }

        state.selectedAddressObj = tempState
    }),

    selectAllColumnAddresses: thunk((actions, bulkAddress) => {
        if(bulkAddress.length <= 0 || !bulkAddress) return

        bulkAddress.forEach((address) => {
            actions.addSelectedColumnAddress(address);
        });
    }),

    deselectAllColumnAddress: thunk((actions, bulkAddress) => {
        if(bulkAddress.length <= 0 || !bulkAddress) return

        bulkAddress.forEach((address) => {
            actions.removeSelectedColumnAddress(address);
        });
    }),

    insertOrRemoveSelectedColumnAddress: thunk(async (actions, params, {getState}) => {
        actions.generateStructureIfNotExists(params);
        const selectedAddressObj = getState().selectedAddressObj;
        const {schema, category, table, column} = columnAddressSplitter(params);

        if(selectedAddressObj[schema][category][table].includes(column)){
            actions.removeSelectedColumnAddress(params);
        } else {
            actions.addSelectedColumnAddress(params);
        }
    }),

    // Data Blocks
    addDataBlock: action((state, newDataBlocks)=>{
        state.dataBlocks = [...state.dataBlocks, newDataBlocks]
    }),

    setDataBlock: action((state, dataBlocks) => {
        state.dataBlocks = dataBlocks;
    }),

    updateDataBlock: thunk((actions, updatedBlocks,{getState})=> {
        const {dataBlocks} = getState();
        const blocks = dataBlocks.map((curEl) => {
            if(curEl.dataBlockId === updatedBlocks.dataBlockId){
                return updatedBlocks
            }
        });
        actions.setDataBlock(blocks);
        actions.convertDataBlocksIntoElement()
    }),
}

const columnAddressSplitter = (columnAddress) => {
    const addressArray = columnAddress.split('@');
    return {
        schema: addressArray[0],
        category: addressArray[1],
        table: addressArray[2],
        column: addressArray[3],
    }
}

const getNodeTypeByDataCatalogId = (catalogId) => {
    switch (catalogId){
        case('postgres'):
            return 'postgresDataSource'
        default:
            return 'transformation'
    }
}

export default CanvasModel;