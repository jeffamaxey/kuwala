import React from "react";
import {useStoreActions, useStoreState} from "easy-peasy";

import PostgresDataSourceHandler from "./NodeHandlers/PostgresDataSourceHandler"

export default () => {
    const { canvasSelectedDataSource } = useStoreState(state => state.canvas);
    const {addNode, setNewNodeInfo} = useStoreActions(actions => actions.canvas);

    const onDragStart = (event, newNodeInfo) => {
        setNewNodeInfo(newNodeInfo)
        event.dataTransfer.effectAllowed = 'move';
    };

    const onClickAddNode = (newNodeInfo) => {
        addNode({
            ...newNodeInfo,
            position: {
                x: -100,
                y: Math.random() * window.innerHeight/2,
            },
        })
    }

    const getHandlerTemplate = (dataSource) => {
        switch (dataSource.data_catalog_item_id) {
            case 'postgres':
                return <
                    PostgresDataSourceHandler
                        onDragStart={onDragStart}
                        onClickAddNode={onClickAddNode}
                        dataSource={dataSource}
                />
            case 'bigquery':
                return 'bg'
            default:
                return null
        }
    }

    return (
        <div className={'flex flex-col justify-center items-center select-none'}>
            {
                canvasSelectedDataSource.map((dataSource, index) => {
                    const handlerToRender = getHandlerTemplate(dataSource);
                    return handlerToRender
                })
            }
        </div>
    )
}
