import React from "react";

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
