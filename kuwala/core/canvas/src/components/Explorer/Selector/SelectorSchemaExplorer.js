import ArrowDown from "../../../icons/arrow-down-solid.svg";
import ArrowRight from "../../../icons/arrow-right-solid.svg";
import ListSVG from "../../../icons/list.svg";
import FolderSVG from "../../../icons/folder-solid.svg";
import TableSVG from "../../../icons/table-solid.svg";
import React, {useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "easy-peasy";
import {generateParamsByDataSourceType} from "../../../utils/SchemaUtils";
import {prePopulate} from "../../../utils/TableSelectorUtils";
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
        dataSource,
    }) => {
    const tableSelectorOnClick = async ({addressString}) => {
        setSelectedTable(addressString);
        setIsColumnsDataPreviewLoading(true);
        const params = generateParamsByDataSourceType(dataSource.dataCatalogItemId, addressString);

        try {
            const res = await getColumns({
                id: dataSource.id,
                params
            });

            if(res.status === 200) {
                setColumnsPreview({
                    columns: [],
                    rows: prePopulate(res.data, addressString),
                });
            }
        } catch (e) {
            console.error('Failed to populate by selected blocks', e)
        }
        setIsColumnsDataPreviewLoading(false);
    }

    const renderDataPreviewTree = () => {
        return (
            <>
                <div className={'bg-kuwala-green w-full pl-4 py-2 text-white font-semibold'}>
                    Database: {getDatabaseTitleValue()}
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

    const getDatabaseTitleValue = () => {
        if(dataSource.dataCatalogItemId === 'postgres') {
            return dataSource.connectionParameters[4].value
        }
        return 'Something else'
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
                    tableSelectorOnClick({
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