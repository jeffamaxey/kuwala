import ArrowDown from "../../icons/arrow-down-solid.svg";
import ArrowRight from "../../icons/arrow-right-solid.svg";
import ListSVG from "../../icons/list.svg";
import FolderSVG from "../../icons/folder-solid.svg";
import TableSVG from "../../icons/table-solid.svg";
import React from "react";
import {tableSelectionOnClick} from "../../utils/TablePreviewUtils";
import {useStoreState} from "easy-peasy";

export default ({selectedTable, setSelectedTable, isSchemaLoading, schemaList, setSchema, setIsTableDataPreviewLoading, setTableDataPreview}) => {
    const {selectedElement} = useStoreState(state => state.canvas);

    const renderDataPreviewTree = () => {
        return (
            <>
                <div className={'bg-kuwala-green w-full pl-4 py-2 text-white font-semibold'}>
                    Database: Kuwala
                </div>
                <div className={'overflow-y-scroll overflow-x-auto h-full w-full'}>
                    {isSchemaLoading
                        ?
                        <div className="flex flex-col w-full h-full justify-center items-center">
                            <div
                                className="spinner-border animate-spin inline-block w-16 h-16 border-4 text-kuwala-green rounded-full"
                                role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        :
                        schemaList.map(el => renderSchemaBlock(el))
                    }
                </div>
            </>
        )
    }

    const renderSchemaBlock = (schema) => {
        return (
            // PARENT CONTAINER
            <div className={'flex flex-col w-full bg-white'}>
                {/* SCHEMA */}
                {generateSchemaParent(schema)}
                {schema.isOpen ? generateCategories(schema.categories, schema.schema) : null}
            </div>
        )
    }

    const generateSchemaParent = (schemaObject) => {
        return (
            <div
                className={'flex flex-row items-center pl-4 pr-8 py-2 cursor-pointer w-full'}
                onClick={() => {
                    toggleTreeItem(schemaObject.schema)
                }}
            >
                <span className={'mr-4'}>
                    <img
                        src={schemaObject.isOpen ? ArrowDown : ArrowRight}
                        style={{minWidth: 16, height: 16}}
                    />
                </span>
                <span className={'mr-4'}>
                    <img
                        src={ListSVG}
                        style={{minWidth: 16, height: 16}}
                    />
                </span>
                <span className={'font-semibold text-md'}>
                    {schemaObject.schema}
                </span>
            </div>
        )
    }

    const generateCategories = (categories, parentSchema) => {
        return (
            categories.map((el, i) => {
                const currentKey = `${parentSchema}@${el.category}`
                return (
                    <div
                        key={currentKey}
                        className={`cursor-pointer min-w-max`}
                    >
                        <div
                            className={'flex flex-row items-center pl-12 pr-8 py-2 bg-white w-full'}
                            onClick={() => {
                                toggleTreeItem(currentKey)
                            }}
                        >
                        <span className={'mr-4 cursor-pointer'}>
                            <img
                                src={el.isOpen ? ArrowDown : ArrowRight}
                                style={{minWidth: 16, height: 16}}
                            />
                        </span>
                            <span className={'mr-4'}>
                            <img
                                src={FolderSVG}
                                style={{minWidth: 16, height: 16}}
                            />
                        </span>
                            <span className={'font-semibold text-md'}>
                            {el.category}
                        </span>
                        </div>
                        {el.isOpen ?
                            el.tables.map(el => generateCategoryTables(el, currentKey))
                            : null
                        }
                    </div>
                )
            })
        )
    }

    const generateCategoryTables = (tableName, parent) => {
        const tableKey = `${parent}@${tableName}`
        return (
            <div
                className={`
                    flex flex-row items-center pl-20 pr-8 py-2
                    cursor-pointer
                    min-w-max
                    ${tableKey === selectedTable ? `bg-kuwala-green text-white` : `bg-white text-black`}
                `}
                key={tableKey}
                onClick={()=>{
                    tableSelectionOnClick({
                        addressString: tableKey,
                        setSelectedTable,
                        setIsTableDataPreviewLoading,
                        dataCatalogItemId: selectedElement.data.dataSource.data_catalog_item_id,
                        setTableDataPreview: setTableDataPreview,
                        dataIndex: selectedElement.data.dataSource.id
                    })
                }}
            >
                <span className={'mr-4'}>
                    <img
                        src={TableSVG}
                        style={{minWidth: 16, minHeight: 16}}
                    />
                </span>
                <span className={'font-semibold text-md w-full'}>
                    {tableName}
                </span>
            </div>
        )
    }

    const toggleTreeItem = (addressString) => {
        const arr = addressString.split('@')
        const schemaAddress = arr[0]
        const categoryAddress = arr[1]

        let tempSchema;
        if(categoryAddress && schemaAddress) {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress) {
                    return {
                        ...el,
                        categories: el.categories.map((cat) => {
                            if (cat.category === categoryAddress){
                                cat.isOpen = !cat.isOpen
                            }
                            return cat
                        })
                    }
                }
                return el
            })
        } else {
            tempSchema = schemaList.map((el) => {
                if (el.schema === schemaAddress){
                    el.isOpen = !el.isOpen
                    if (el.isOpen === false) {
                        return {
                            ...el,
                            categories: el.categories.map((cat) => {
                                cat.isOpen = false
                                return cat
                            })
                        }
                    }
                }
                return el
            })
        }
        setSchema(tempSchema)
    }

    return (
        renderDataPreviewTree()
    )
}