import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const populateAPIResult = ({res, setColumnsPreview, addressString, insertOrRemoveSelectedColumnAddress}) => {
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
                    <FontAwesomeIcon
                        icon={'check'}
                        className={`
                            fill-kuwala-green h-4 w-4
                            ${row.original.selected ? '' : 'hidden'}
                        `}
                    />
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

const prePopulate = (raw, addressString) => {
    return raw.map((el)=> {
        return {
            ...el,
            selected: false,
            columnAddress: `${addressString}@${el.column}`
        }
    });
}

export const columnAddressSplitter = (columnAddress) => {
    const addressArray = columnAddress.split('@');
    return {
        schema: addressArray[0] || null,
        category: addressArray[1] || null,
        table: addressArray[2] || null,
        column: addressArray[3] || null,
    }
}

export const tableAddressSplitter = (tableAddress) => {
    const addressArray = tableAddress.split('@');
    return {
        schema: addressArray[0] || null,
        category: addressArray[1] || null,
        table: addressArray[2] || null,
    }
}