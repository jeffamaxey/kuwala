import React from "react";

import ExampleDataSource from "./DataConnectors/ExampleDataSource";
import ExampleProcessorNode from "./DataConnectors/ExampleProcessorNode";
import ExampleOutputNode from "./DataConnectors/ExampleOutputNode";

export default ({sidebar, toggleSidebar, onClickAddNode}) => {
    const onDragStart = (event, {type, data}) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({type, data}));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className={`
                            absolute
                            z-10
                            flex
                            flex-row
                            transition-all
                            transform
                            h-full
                            ${sidebar ? '-translate-x-full' : ''}`}
        >
            <div className={'relative w-64'}>
                <aside
                    className={`
                            inset-y-0
                            flex flex-col flex-shrink-0
                            w-64
                            overflow-hidden
                            bg-white
                            border-r
                            h-full
                            shadow-sm
                            top-0`
                    }
                >
                    {/* Header and Toggle */}
                    <div className={`flex items-center justify-center flex-shrink-0 p-2`}>
                        <span className={`p-2 text-xl font-semibold tracking-wider whitespace-nowrap`}>
                            <span>DATA SOURCES</span>
                        </span>
                    </div>

                    {/* CONNECTOR CONTAINERS */}
                    <div className={'flex flex-col p-2 pr-8 pl-8 space-y-4'}>
                        <ExampleDataSource onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                        <ExampleProcessorNode onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                        <ExampleOutputNode onDragStart={onDragStart} onClickAddNode={onClickAddNode}/>
                    </div>
                </aside>
            </div>

            <div className={'relative'}>
                <button
                    onClick={()=>alert('Will show modal')}
                    className={`
                            ml-4
                            mt-4
                            w-12
                            h-12
                            rounded-lg 
                            absolute
                            text-xl
                            font-bold
                            border-2
                            border-kuwala-red
                            bg-white
                            text-kuwala-red
                        `}
                >
                    +
                </button>

                <button
                    onClick={toggleSidebar}
                    className={`
                            ml-4
                            mt-20
                            w-12
                            h-12
                            rounded-lg 
                            absolute
                            text-xl
                            font-bold
                            border-2
                            border-kuwala-green
                            bg-white
                            text-kuwala-green
                        `}
                >
                    {sidebar ? '>' : '<'}
                </button>
            </div>
        </div>
    )
}