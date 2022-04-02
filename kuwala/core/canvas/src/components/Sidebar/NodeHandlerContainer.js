import React from "react";
import {useStoreActions, useStoreState} from "easy-peasy";

import PostgresDataSourceHandler from "./NodeHandlers/DataBlocksHandler"
import {v4} from "uuid";
import DataBlocks from "../Nodes/DataBlocks";
import DataBlocksHandler from "./NodeHandlers/DataBlocksHandler";

export default () => {
    const { canvasSelectedDataSource } = useStoreState(state => state.canvas);
    const { setNewNodeInfo } = useStoreActions(actions => actions.canvas);
    const { addDataBlock } = useStoreActions((actions) => actions.canvas);

    const onDragStart = (event, newNodeInfo) => {
        setNewNodeInfo(newNodeInfo)
        event.dataTransfer.effectAllowed = 'move';
    };

    const onClickAddDataBlock = (dataBlocks) => {
        addDataBlock(dataBlocks)
    }

    const getHandlerTemplate = (dataSource) => {
        switch (dataSource.dataCatalogItemId) {
            case 'postgres':
            case 'bigquery':
                return <
                    DataBlocksHandler
                        onDragStart={onDragStart}
                        onClickAddDataBlock={onClickAddDataBlock}
                        dataSource={dataSource}
                />
            default:
                return null
        }
    }

    return (
        <div className={'flex flex-col justify-center items-center select-none space-y-6'}>
            {
                canvasSelectedDataSource.map((dataSource) => {
                    const handlerToRender = getHandlerTemplate(dataSource);
                    return handlerToRender
                })
            }
        </div>
    )
}
