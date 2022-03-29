import React, {useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {getColumns, getSchema} from "../../api/DataSourceApi";
import {populateSchema} from '../../utils/SchemaUtils';
import SchemaExplorer from '../Explorer/Preview/SchemaExplorer'
import PreviewExplorer from "../Explorer/Preview/PreviewExplorer";
import SelectorExplorer from "../Explorer/Selector/SelectorExplorer";
import SelectorSchemaExplorer from "../Explorer/Selector/SelectorSchemaExplorer";
import "./node-config-modal.css"
import {generateParamsByDataSourceType, preCreateSchemaExplorer} from '../../utils/SchemaUtils'
import {populateAPIResult, columnAddressSplitter} from "../../utils/TableSelectorUtils";
import {createNewDataBlock, updateDataBlockEntity} from "../../api/DataBlockApi";

export default ({isShow, configData}) => {
    const SELECTION_DISPLAY = 'selection';
    const PREVIEW_DISPLAY = 'preview';
    const {
        insertOrRemoveSelectedColumnAddress, selectAllColumnAddresses,
        updateDataBlock
    } = useStoreActions(actions => actions.canvas);
    const {toggleConfigModal} = useStoreActions(actions => actions.common);
    const {selectedElement, selectedAddressObj} = useStoreState(state => state.canvas);
    const [schemaList, setSchema] = useState([])
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isTableDataPreviewLoading, setIsTableDataPreviewLoading] = useState(false);
    const [isColumnsDataPreviewLoading, setIsColumnsDataPreviewLoading] = useState(false);
    const [selectorDisplay, setSelectorDisplay] = useState(SELECTION_DISPLAY);
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    });
    const [columnsPreview, setColumnsPreview] = useState({
        columns: [],
        rows: []
    });

    useEffect( ()=> {
        fetchSchema().then(null)
        populateConfigByDataBlocks().then(null)
    }, [selectedElement])

    const upsertDataBlocks = async () => {
        if(selectedElement){
            if(selectedElement.data.dataBlocks) {
                const blocks = selectedElement.data.dataBlocks;
                const selectedSource = selectedElement.data.dataSource;
                const {schema, category, table} = columnAddressSplitter(selectedTable);
                const newSelectedColumns = getSelectedColumnsOfCurrentTable();
                // Insert new data blocks
                if(blocks.dataBlockEntityId === null) {
                    const insertPayload = {
                        data_source_id: selectedSource.id,
                        name: `${blocks.catalogItemType}_${table}`,
                        columns: newSelectedColumns,
                    }

                    switch (selectedSource.data_catalog_item_id) {
                        case("bigquery"):
                            insertPayload.dataset_name = category
                            insertPayload.table_name = table
                            break;
                        case("postgres"):
                            insertPayload.schema_name = schema
                            insertPayload.table_name = table
                            break;
                        default:
                            return;
                    }

                    const res = await createNewDataBlock(insertPayload);

                    if(res.status === 200) {
                        const configuredDataBlock = {
                            ...insertPayload,
                            ...blocks,
                            data_source_id: selectedSource.id,
                            name: `${blocks.catalogItemType}_${table}`,
                            columns: newSelectedColumns,
                            dataBlockEntityId: res.data.id,
                            isConfigured: true,
                            dataSource: selectedSource,
                        }
                        updateDataBlock(configuredDataBlock);
                        alert('Successfully created a configured data blocks');
                    } else {
                        alert('Failed to create a new blocks')
                    }

                } else {
                    // Update blocks
                    const updatePayload = {
                        id: blocks.dataBlockEntityId,
                        name: `${blocks.catalogItemType}_${table}`,
                        columns: newSelectedColumns,
                        table_name: table,
                        schema_name: schema,
                    }
                    const res = await updateDataBlockEntity(updatePayload);
                    if(res.status === 200) {
                        const configuredDataBlock = {
                            ...updatePayload,
                            ...blocks,
                            data_source_id: selectedSource.id,
                            name: `${blocks.catalogItemType}_${table}`,
                            columns: newSelectedColumns,
                            isConfigured: true,
                            dataSource: selectedSource,
                        }
                        updateDataBlock(configuredDataBlock);
                        alert('Successfully created a configured data blocks');
                    } else {
                        alert('Failed to create a new blocks')
                    }
                }
            }
        }
    }

    const getSelectedColumnsOfCurrentTable = () => {
        const  {schema, table, category} = columnAddressSplitter(selectedTable)
        try {
            return selectedAddressObj[schema][category][table]
        } catch (e) {
            return []
        }
    }

    const populateConfigByDataBlocks = async () => {
        if(selectedElement){
            if(selectedElement.data.dataBlocks) {
                const blocks = selectedElement.data.dataBlocks;
                if(blocks.schema_name && blocks.table_name) {
                    const selectedAddress = `${blocks.schema_name}@tables@${blocks.table_name}`
                    setSelectedTable(selectedAddress)
                    setIsColumnsDataPreviewLoading(true)
                    setIsSchemaLoading(true)
                    const schemaRes = await getSchema(selectedElement.data.dataSource.id);
                    if(schemaRes.status === 200) {
                        const populatedSchema = populateSchema(schemaRes.data);
                        preCreateSchemaExplorer({
                            schemaList: populatedSchema,
                            addressString: selectedAddress,
                            setSchema: setSchema,
                        })
                    }
                    const params = generateParamsByDataSourceType(
                        selectedElement.data.dataSource.data_catalog_item_id,
                        selectedAddress
                    );
                    const res = await getColumns({
                        id: selectedElement.data.dataSource.id,
                        params
                    });
                    selectAllColumnAddresses(blocks.columns.map((el) => `${selectedAddress}@${el}`))
                    if (res.status === 200) {
                        populateAPIResult({
                            res: res,
                            setColumnsPreview: setColumnsPreview,
                            addressString: selectedAddress,
                            insertOrRemoveSelectedColumnAddress: insertOrRemoveSelectedColumnAddress
                        });
                    }
                    setIsColumnsDataPreviewLoading(false)
                    setIsSchemaLoading(false)
                }
            }
        }
    }

    async function fetchSchema() {
        if(selectedElement) {
            setIsSchemaLoading(true)
            const res = await getSchema(selectedElement.data.dataSource.id);
            if(res.status === 200) {
                const populatedSchema = populateSchema(res.data);
                setSchema(populatedSchema)
            }
        }
        setIsSchemaLoading(false)
    }

    const renderSelectedSourceHeader = () => {
        if (!selectedElement) {
            return <></>
        } else {
            return (
                <div className={'flex flex-row'}>
                    <div className={'flex flex-col items-center'}>
                        <div
                            className={'flex flex-col justify-center items-center bg-white rounded-xl drop-shadow-lg relative p-4 w-24 h-24'}
                        >
                            <img
                                src={selectedElement.data.dataSource.logo}
                                style={{height: 48, width: 48}}
                                draggable={false}
                            />
                            <span className={'mt-1 text-sm'}>{selectedElement.data.dataSource.name}</span>
                            <div
                                className={`
                                    absolute right-0 top-0 p-1 border rounded-full w-5 h-5 -mr-2 -mt-2
                                    ${selectedElement.data.dataSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                            `}
                            />
                        </div>
                    </div>

                    <div className={'flex flex-col ml-6 space-y-2 bottom-0 justify-end mb-2'}>
                        <span className={'px-3 py-1 bg-kuwala-light-green text-kuwala-green font-semibold rounded-lg w-36'}>
                            Data blocks
                        </span>

                        <div className={'flex flex-row items-center'}>
                            <label className={'font-semibold'}>Name:</label>
                            <input
                                type="text" name="name" value={`${selectedElement.data.dataBlocks.name}`} disabled={true}
                                className={`
                                    form-control
                                    block
                                    w-full                                   
                                    ml-2
                                    px-2
                                    py-0.5
                                    text-base
                                    font-light
                                    text-gray-700
                                    bg-gray-100 bg-clip-padding
                                    border border-solid border-kuwala-green
                                    rounded-lg
                                    transition
                                    ease-in-out
                                    m-0
                                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                                `}
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderTableSelector = () => {
        if (!selectedElement) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        } else {
            return (
                <div className={'flex flex-row bg-white border-2 border-kuwala-green rounded-t-lg h-full w-full'}>
                    <div className={'flex flex-col bg-white w-3/12 border border-kuwala-green h-full'}>
                        {renderSchemaExplorer(selectorDisplay)}
                    </div>
                    <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                        <div className={'flex flex-col w-full h-full'}>
                            {renderDisplaySelector()}
                            {renderDisplayType(selectorDisplay)}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderSchemaExplorer = (displayType) => {
        if(displayType === SELECTION_DISPLAY) {
            return (
                <SelectorSchemaExplorer
                    isSchemaLoading={isSchemaLoading}
                    schemaList={schemaList}
                    selectedTable={selectedTable}
                    setSchema={setSchema}
                    setSelectedTable={setSelectedTable}

                    columnsPreview={columnsPreview}
                    setColumnsPreview={setColumnsPreview}
                    setIsColumnsDataPreviewLoading={setIsColumnsDataPreviewLoading}
                />
            )
        } else if (displayType === PREVIEW_DISPLAY) {
            return (
                <SchemaExplorer
                    isSchemaLoading={isSchemaLoading}
                    schemaList={schemaList}
                    selectedTable={selectedTable}
                    setSchema={setSchema}
                    setSelectedTable={setSelectedTable}

                    setTableDataPreview={setTableDataPreview}
                    setIsTableDataPreviewLoading={setIsTableDataPreviewLoading}
                />
            )
        }
    }

    const renderDisplaySelector = () => {
        return <div className={'flex flex-row justify-center items-center p-8'}>
            <div className={'flex flex-row '}>
                <div
                    className={`
                          border-b-2 border-t-2 border-l-2 border-kuwala-green
                          flex
                          items-center
                          justify-center
                          block
                          text-xs
                          leading-tight
                          rounded-l-lg
                          w-24
                          py-2
                          focus:outline-none focus:ring-0
                          cursor-pointer
                          font-bold
                          ${selectorDisplay === SELECTION_DISPLAY ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                      `}
                    onClick={()=>{
                        setSelectorDisplay(SELECTION_DISPLAY)
                    }}
                    draggable={false}>
                    Selection
                </div>
                <div
                    className={`
                                  border-b-2 border-t-2 border-r-2 border-kuwala-green
                                  flex
                                  items-center
                                  justify-center
                                  block
                                  text-xs
                                  leading-tight
                                  rounded-r-lg
                                  w-24
                                  py-2
                                  focus:outline-none focus:ring-0
                                  cursor-pointer
                                  font-bold
                              ${selectorDisplay === PREVIEW_DISPLAY ? 'bg-kuwala-green text-white' : 'bg-white text-kuwala-green'}
                          `}
                    onClick={()=>{
                        setSelectorDisplay(PREVIEW_DISPLAY)
                    }}
                    draggable={false}>
                    Preview
                </div>
            </div>
        </div>
    }

    const renderDisplayType = (displayType) => {
        if(displayType === SELECTION_DISPLAY) {
            return (
                <SelectorExplorer
                    selectedTable={selectedTable}
                    isColumnsDataPreviewLoading={isColumnsDataPreviewLoading}
                    columnsPreview={columnsPreview}
                />
            )
        } else if (displayType === PREVIEW_DISPLAY) {
            return (
                <PreviewExplorer
                    selectedTable={selectedTable}
                    isTableDataPreviewLoading={isTableDataPreviewLoading}
                    tableDataPreview={tableDataPreview}
                />
            )
        }
    }

    // TODO: Implement on click out side
    return (
        <div
            className={`
                    modal
                    ${isShow ? '' : 'hidden'}
                    fixed 
                    top-0 left-0 
                    w-full h-screen outline-none 
                    overflow-x-hidden overflow-y-auto
                    bg-black
                    bg-opacity-50
                `}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-xl h-100 relative w-full pointer-events-none override-modal-dialog"
            >
                <div
                    className={`
                        modal-content
                        border-none shadow-lg 
                        relative flex flex-col 
                        w-full pointer-events-auto 
                        bg-white bg-clip-padding rounded-md 
                        outline-none text-current
                        h-full
                    `}>
                    <div
                        className="modal-header flex flex-col flex-shrink-0 justify-between px-6 py-4 rounded-t-md"
                    >
                        <button
                            type="button"
                            className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={()=> {
                                toggleConfigModal()
                                setSelectedTable(null)
                            }}
                        />
                        <div>
                            {renderSelectedSourceHeader()}
                        </div>
                    </div>
                    <div className="flex flex-col modal-body overflow-y-scroll relative px-6 pt-2 pb-4">
                        {renderTableSelector()}
                    </div>

                    <div className={'flex flex-row justify-between px-6 pb-4'}>
                        <div className={'flex flex-row items-center'}>
                                <span
                                    className={`
                                        bg-kuwala-green px-6 py-2 font-semibold text-white rounded-lg cursor-pointer
                                    `}
                                    onClick={toggleConfigModal}
                                >Back</span>
                        </div>
                        <div className={'flex flex-row items-center'}>
                                <span
                                    className={`
                                        bg-kuwala-green px-6 py-2 font-semibold text-white rounded-lg cursor-pointer
                                    `}
                                    onClick={async () => {
                                        await upsertDataBlocks()
                                    }}
                                >Save</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}