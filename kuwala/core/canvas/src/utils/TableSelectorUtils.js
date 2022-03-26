import {getColumns} from "../api/DataSourceApi";

import React from "react";
import {generateParamsByDataSourceType} from "./SchemaUtils";
import CheckSVG from "../icons/check-solid.svg";
import {useStoreActions, useStoreState} from "easy-peasy";

const onClickAddSelectedColumnAddress = async (
        {
            columnAddress,
            addSelectedColumnAddress,
            removeSelectedColumnAddress,
            isSelected,
            setColumnsPreview,
            rows,
        }) => {
    // If not selected add to selected column
    if(!isSelected) {
        console.log("Doing on selected on column address : " + columnAddress);
        addSelectedColumnAddress(columnAddress);
    } else {
        removeSelectedColumnAddress(columnAddress);
    }

    setColumnsPreview({
        rows: populateResData(rows, columnAddress, selectedColumnAddress),
    });
}

const populateResData = (raw, addressString, selectedColumnAddressList) => {
    return raw.map((el)=> {
        return {
            ...el,
            selected: selectedColumnAddressList.includes(addressString),
            columnAddress: `${addressString}_${el.column}`
        }
    });
}

export const tableSelectorOnclick = async (
        {
            addressString,
            setSelectedTable,
            dataCatalogItemId,
            dataIndex,
            setColumnsPreview,
            setIsColumnsDataPreviewLoading,
            selectedColumnAddress,
            addSelectedColumnAddress,
            removeSelectedColumnAddress
        }) => {
    setSelectedTable(addressString);
    setIsColumnsDataPreviewLoading(true);
    const params = generateParamsByDataSourceType(dataCatalogItemId, addressString);
    const res = await getColumns({
        id: dataIndex,
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
                            `}
                        onClick={()=> {
                            onClickAddSelectedColumnAddress({
                                columnAddress: row.original.columnAddress,
                                isSelected: row.original.selected,
                                addSelectedColumnAddress: addSelectedColumnAddress,
                                removeSelectedColumnAddress: removeSelectedColumnAddress,
                            })
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
        }, {
            Header: 'type',
            accessor: 'type',
            Cell: (row) => {
                return (
                    <span className={'bg-white px-4 py-1 text-sm font-semibold text-kuwala-green rounded-lg border-2 border-kuwala-green lowercase'}>
                        {row.value}
                    </span>
                );
            }
        }]

        setColumnsPreview({
            columns: cols,
            rows: populateResData(res.data, addressString, selectedColumnAddress),
        });
    }
    setIsColumnsDataPreviewLoading(false);
}