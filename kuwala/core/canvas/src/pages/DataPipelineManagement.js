import React, {useEffect, useState} from "react";
import Header from "../components/Header";
import {useNavigate, Link} from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import "./styles/data-pipeline-management.style.css";
import AddSVG from '../icons/add_sources_green.png';
import {v4} from "uuid";
import DataBlocksDTO from "../data/dto/DataBlocksDTO";

export default () => {
    const navigate = useNavigate();
    const { dataSource } = useStoreState((state) => state.canvas);
    const { getDataSources, addDataSourceToCanvas, addDataBlock } = useStoreActions((actions) => actions.canvas);
    const [ isAddToCanvasLoading, setIsAddToCanvasLoading ] = useState(false)

    useEffect(()=> {
        getDataSources()
    }, []);

    const addToCanvas = async (selectedSource) => {
        if(!selectedSource) return
        setIsAddToCanvasLoading(true);

        const dto = new DataBlocksDTO({
            tableName: null,
            schemaName: null,
            dataSetName: null,
            dataBlockId: v4(),
            dataBlockEntityId: null,
            isConfigured: false,
            dataSourceDTO: selectedSource,
            dataSourceId: selectedSource.id,
            columns: [],
            name: `${selectedSource.dataCatalogItemId}`,
            dataCatalogType: selectedSource.dataCatalogItemId,
        });

        addDataBlock(dto);
        navigate('/')
        setIsAddToCanvasLoading(false);
    }

    const renderPipelineManager = () => {
        if(dataSource.length <= 0) {
            return (
                <div>
                    No data source is selected, please add a new data source from the <Link to={'/data-catalog'} className={'text-kuwala-green'}>Data Catalog</Link>
                </div>
            )
        } else if (dataSource.length > 0){
            return (
                <table className="w-full rounded-table max-h-100 flex flex-col">
                    <thead className={'rounded-t-md uppercase rounded-header flex w-full'}>
                        <tr className={'bg-white border-2 text-center flex w-full'}>
                            <th className={'px-6 py-3 flex-1 text-white bg-kuwala-green text-left capitalize'}>Name</th>
                            <th className={'px-6 py-3 flex-1 text-white bg-kuwala-green capitalize'}>Status</th>
                            <th className={'px-6 py-3 flex-1 text-white bg-kuwala-green'}/>
                        </tr>
                    </thead>
                    <tbody
                        className={`bg-grey-light flex flex-col items-center overflow-y-auto w-full`}
                        style={{height: '100rem'}}
                    >
                        {dataSource.map((dto, i)=>{
                        return (
                            <tr
                                key={i} className={'bg-white border-2 text-center flex w-full'}
                            >
                                <td className={'py-6 flex-1'}>
                                    <div className={'flex flex-row ml-8 items-center'}>
                                        <img
                                            src={dto.logo}
                                            style={{height: 48, width: 48}}
                                        />
                                        <label className={'ml-10 text-lg font-medium'}>{dto.name}</label>
                                    </div>
                                </td>
                                <td className={'py-6 flex-1'}>
                                <span
                                    className={`
                                        px-4 py-2 rounded-xl text-white font-semibold
                                        ${dto.connected ? 'bg-kuwala-green' : 'bg-red-400'}
                                    `}
                                >
                                    {dto.connected ? 'Active' : 'Inactive'}
                                </span>
                                </td>
                                <td className={'py-6 space-x-2 flex-1'}>
                                    <div className={'flex flex-row justify-end space-x-4 px-8'}>
                                        <Link
                                            to={'/data-source-config'}
                                            state={{
                                                dataSourceDTO: dto,
                                            }}
                                            className={'flex bg-white px-4 py-2 text-white rounded-md border-2 border-kuwala-green hover:bg-kuwala-bg-gray items-center '}
                                        >
                                            <span className={'text-kuwala-green font-semibold'}>Configure</span>
                                        </Link>
                                        <Link
                                            disabled={dto.connected}
                                            to={'/data-source-preview'}
                                            state={{
                                                dataSourceDTO: dto,
                                            }}
                                            className={`
                                                bg-white text-kuwala-green px-4 py-2 rounded-md border-2 border-kuwala-green hover:bg-kuwala-bg-gray
                                            ${dto.connected ? '' : 'hidden'}
                                        `}
                                        >
                                            <span className={'text-kuwala-green font-semibold'}>Preview Data</span>
                                        </Link>
                                        <button
                                            className={`
                                                bg-kuwala-green text-white px-4 py-2 rounded
                                                font-semibold
                                                hover:bg-kuwala-light-green 
                                                ${dto.connected ? '' : 'hidden'}
                                            `}
                                            disabled={isAddToCanvasLoading}
                                            onClick={async ()=>{
                                                addDataSourceToCanvas(dto)
                                                await addToCanvas(dto)
                                            }}
                                        >
                                            <span className={'text-white w-full py-2'}>
                                                {isAddToCanvasLoading ?
                                                    <div className="flex justify-center items-center">
                                                        <div
                                                            className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full"
                                                            role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                    :
                                                    'Add to canvas'
                                                }
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            )
        }
    }

    return (
        <div className={`flex flex-col h-screen antialiased text-gray-900`}>
            <Header />
            <main className={'flex flex-col justify-between h-full w-full bg-kuwala-bg-gray'}>
                <div className={'px-20'}>
                    <div className={'flex flex-col mt-8'}>
                        <span className={'font-semibold text-3xl'}>
                            Data Pipeline Management
                        </span>
                        <span className={'font-light text-xl mt-3'}>
                            Configure and manage your selected data sources
                        </span>
                    </div>

                    {/* Data Sources Container*/}
                    <div className={'relative mt-12'}>
                        <div className={'space-x-8 relative'}>
                            {renderPipelineManager()}
                        </div>
                        <div className={'absolute -bottom-16 -mb-6'}>
                            <Link
                                to={'/data-catalog'}
                            >
                                <div className={'flex flex-row bg-white items-center px-4 py-4 rounded-lg relative space-x-2 hover:'}>
                                    <img
                                        src={AddSVG}
                                        style={{
                                            height: 36,
                                            width: 36,
                                        }}
                                    />
                                    <span className={'text-lg'}>Add a new data source</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={'flex flex-row-reverse px-20 mb-12'}>
                    <button
                        className={'bg-kuwala-green text-white rounded-md px-4 py-2 mt-8 hover:text-stone-300'}
                        onClick={()=>{
                            navigate('/')
                        }}
                    >
                        Go to canvas
                    </button>
                </div>
            </main>
        </div>
    )
}