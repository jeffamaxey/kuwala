import React, {useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {getSchema, getTablePreview} from "../../api/DataSourceApi";
import {populateSchema} from '../../utils/SchemaUtils';
import SchemaExplorer from '../TableExplorer/SchemaExplorer'
import PreviewExplorer from "../TableExplorer/PreviewExplorer";


export default ({isShow, configData}) => {
    const {toggleConfigModal} = useStoreActions(actions => actions.common);
    const {selectedElement} = useStoreState(state => state.canvas);
    const [schemaList, setSchema] = useState([])
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isTableDataPreviewLoading, setIsTableDataPreviewLoading] = useState(false);
    const [tableDataPreview, setTableDataPreview] = useState({
        columns: [],
        rows: []
    });

    useEffect( ()=> {
        fetchSchema().then(null)
    }, [selectedElement])

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
                                type="text" name="name" value={'Postgres'} disabled={true}
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
                        <SchemaExplorer
                            isSchemaLoading={isSchemaLoading}
                            schemaList={schemaList}
                            selectedTable={selectedTable}
                            setSchema={setSchema}
                            setIsTableDataPreviewLoading={setIsTableDataPreviewLoading}
                            setSelectedTable={setSelectedTable}
                            setTableDataPreview={setTableDataPreview}
                        />
                    </div>
                    <div className={'flex flex-col bg-white w-9/12 rounded-tr-lg'}>
                        <PreviewExplorer
                            selectedTable={selectedTable}
                            isTableDataPreviewLoading={isTableDataPreviewLoading}
                            tableDataPreview={tableDataPreview}
                        />
                    </div>
                </div>
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
            <div className="modal-dialog modal-dialog-centered modal-xl h-100 relative w-full pointer-events-none">
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
                                setTableDataPreview({
                                    columns: [],
                                    rows: []
                                })
                                setSelectedTable(null)
                            }}
                        />
                        <div>
                            {renderSelectedSourceHeader()}
                        </div>
                    </div>
                    <div className="flex modal-body overflow-y-scroll relative px-6 pt-2 pb-6">
                        {renderTableSelector()}
                    </div>
                </div>
            </div>
        </div>
    )
}