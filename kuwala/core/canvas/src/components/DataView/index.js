import React, {useEffect, useMemo, useState} from "react";
import {useStoreState} from "easy-peasy";
import ReactTable from "react-table-6";
import {getDataBlockPreview} from "../../api/DataBlockApi";
import {getDataDictionary} from "../../utils/SchemaUtils";
import Tab from "tw-elements/dist/src/js/bs/src/tab";

const Table = ({columns, data}) => {

    const memoizedCols = useMemo(()=> {
        return columns
    },[]);

    const memoizedRows = useMemo(()=> {
        return data
    },[]);

    let pageSize;
    if (data.length >= 300) pageSize = 300
    else if (data.length <= 20) pageSize = 20;
    else pageSize = data.length

    return (
        <ReactTable
            data={memoizedRows}
            columns={memoizedCols}
            defaultPageSize={pageSize}
            showPagination={false}
            showPaginationTop={false}
            showPaginationBottom={false}
            showPageSizeOptions={false}
            style={{
                height: "100%",
                overFlowX: 'hidden',
            }}
            className="-striped -highlight"
        />
    )
}

export default () => {
    const {selectedElement, openDataView} = useStoreState(state => state.canvas );
    const [isDataPreviewLoading, setIsDataPreviewLoading] = useState(false);
    const [blocksPreview, setBlocksPreview] = useState({
        columns: [],
        rows: [],
    })

    useEffect(()=> {
        if(openDataView) {
            console.log('Fetching data for preview')
            fetchPreviewFromSavedDataBlocks().then(null)
        }
    }, [openDataView])

    const fetchPreviewFromSavedDataBlocks = async () => {
        if(selectedElement) {
            if(selectedElement.data.dataBlocks) {
                setIsDataPreviewLoading(true)
                const blocks = selectedElement.data.dataBlocks
                try {

                    const res = await getDataBlockPreview({
                        dataBlockId: blocks.dataBlockEntityId,
                        params: {
                            limit_columns: 300,
                            limit_rows: 300,
                        }
                    });

                    if(res.status === 200) {
                        let cols = res.data.columns.map((el,i)=>{
                            return {
                                Header: el,
                                accessor: el,
                            }
                        });

                        cols = [{
                            Header: "#",
                            id: "row",
                            filterable: false,
                            width: 50,
                            Cell: (row) => {
                                return <div>{row.index+1}</div>;
                            }
                        }, ...cols]

                        setBlocksPreview({
                            columns: cols,
                            rows: getDataDictionary(res.data.rows, res.data.columns),
                        });
                    }

                    console.log(res.data)
                }catch (e) {
                    console.log('Failed when fetchin data blocks data');
                }
                setIsDataPreviewLoading(false)
            }
        }
    }

    return (
        // Table Wrapper
        <div
            className={`
                flex
                flex-col
                bottom-0
                h-2/5
                w-full
                z-10
                absolute
                ${selectedElement ? '' : 'hidden'}
                `
            }
        >
            <div className={'relative w-full flex-1 overflow-y-scroll overflow-x-hidden bg-stone-300'}>
                <div className={'flex flex-col overflow-x-auto mx-8 mt-4 rounded-lg border-2 border-kuwala-green bg-white h-full'}>
                    {
                        isDataPreviewLoading
                        ?
                            <div className="flex flex-col w-full h-full justify-center items-center rounded-tr-lg">
                                <div
                                    className="spinner-border animate-spin inline-block w-24 h-24 border-4 text-kuwala-green rounded-full"
                                    role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        :
                            <Table columns={blocksPreview.columns} data={blocksPreview.rows}/>
                    }
                </div>
            </div>
        </div>
    )
}