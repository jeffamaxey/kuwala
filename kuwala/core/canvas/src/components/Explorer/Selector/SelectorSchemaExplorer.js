import ArrowDown from "../../../icons/arrow-down-solid.svg";
import ArrowRight from "../../../icons/arrow-right-solid.svg";
import ListSVG from "../../../icons/list.svg";
import FolderSVG from "../../../icons/folder-solid.svg";
import TableSVG from "../../../icons/table-solid.svg";
import React, {useEffect, useState} from "react";
import {action, useStoreActions, useStoreState} from "easy-peasy";
import {generateParamsByDataSourceType} from "../../../utils/SchemaUtils";
import {getColumns} from "../../../api/DataSourceApi";

export default (
    {
        selectedTable,
        setSelectedTable,
        isSchemaLoading,
        schemaList,
        setSchema,
        setIsColumnsDataPreviewLoading,
        setColumnsPreview,
    }) => {
    const { selectedElement } = useStoreState(state => state.canvas);
    const { insertOrRemoveSelectedColumnAddress } = useStoreActions(actions => actions.canvas);

    const prePopulate = (raw, addressString) => {
        return raw.map((el)=> {
            return {
                ...el,
                selected: false,
                columnAddress: `${addressString}@${el.column}`
            }
        });
    }

    const tableSelectorOnclick = async ({addressString}) => {
        setSelectedTable(addressString);
        setIsColumnsDataPreviewLoading(true);
        const params = generateParamsByDataSourceType(selectedElement.data.dataSource.data_catalog_item_id, addressString);
        const res = await getColumns({
            id: selectedElement.data.dataSource.id,
            params
        });

        if(res.status === 200) {
            const cols = [{
                Header: "",
                id: "row",
                filterable: false,
                width: 50,
                Cell: (row) => {
                    return (
                        <div
                            className={`
                                flex flex-row justify-center items-center h-6 w-6 rounded-full
                                border-2 border-kuwala-green 
                                cursor-pointer
                                select-none
                            `}
                            onClick={()=> {
                                insertOrRemoveSelectedColumnAddress(row.original.columnAddress)
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                className={`
                                fill-kuwala-green h-4 w-4
                                ${row.original.selected ? '' : 'hidden'}
                            `}
                            >
                                <path d="M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z"/>
                            </svg>
                        </div>
                    );
                }
            }, {
                Header: 'name',
                accessor: 'column',
                Cell: (row) => {
                    return <div className={'font-light select-none'}>
                        {row.value}
                    </div>
                }
            }, {
                Header: 'type',
                accessor: 'type',
                Cell: (row) => {
                    return (
                        <span className={'bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-400 rounded-lg lowercase'}>
                        {row.value}
                    </span>
                    );
                }
            }]

            setColumnsPreview({
                columns: cols,
                rows: prePopulate(res.data, addressString),
            });
        }
        setIsColumnsDataPreviewLoading(false);
    }

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
                    tableSelectorOnclick({
                        addressString: tableKey,
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