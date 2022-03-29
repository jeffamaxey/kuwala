import React, { DragEvent } from 'react';

export default ({onDragStart, onClickAddNode, dataSource}) => {
    const type = 'postgresDataSource'
    const nodeInfo = {
        type,
        data: {
            label: 'Postgres',
            dataSource,
        },
        sourcePosition: 'right',
        targetPosition: 'left',
    }
    return (
        <div
            className={`
                    p-5
                    m-0
                    shadow-xl
                    rounded-lg
                    w-24
                    h-24
                    flex flex-col justify-center items-center
                    relative
            `}
            onDragStart={(event: DragEvent) => onDragStart(event, nodeInfo)}
            onClick={() => onClickAddNode(nodeInfo)}
            draggable
        >
            <img
                draggable={false}
                src={dataSource.logo}
                alt={'Postgres logo'}
            />
            <span className={'mt-1 font-semibold text-xs'}>{dataSource.name}</span>
            <div
                className={`
                    absolute right-0 top-0 p-1 border rounded-full w-5 h-5 -mr-2 -mt-2
                    ${dataSource.connected ? "bg-kuwala-green" : "bg-red-400"}
                `}
            />
        </div>
    )
}