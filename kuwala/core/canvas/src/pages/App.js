import React, {useState, useRef, useEffect} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
} from 'react-flow-renderer';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DataView from "../components/DataView";
import {useStoreActions, useStoreState} from 'easy-peasy';
import DataSourceNode from "../components/Nodes/DataSourceNode";
import TransformationNode from "../components/Nodes/TransformationNode";
import VisualizationNode from "../components/Nodes/VisualizationNode";
import PostgresDataSourceNode from "../components/Nodes/PostgresDataSourceNode";
import {Link} from "react-router-dom";
import NodeConfigModal from "../components/Modals/NodeConfigModal";

export default function () {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const {elements, selectedElement, newNodeInfo, dataSource, dataBlocks, openDataView} = useStoreState(state => state.canvas);
    const {showConfigModal} = useStoreState(state => state.common);
    const {
        addNode, setSelectedElement, removeNode, connectNodes, setOpenDataView, getDataSources,
        convertDataBlocksIntoElement
    } = useStoreActions(actions => actions.canvas);

    useEffect(()=> {
        if (dataSource.length <= 0) getDataSources()
        if (dataBlocks.length > 0) convertDataBlocksIntoElement()
    }, [])

    const onConnect = (params) => connectNodes(params)
    const onElementsRemove = (elementsToRemove) => removeNode(elementsToRemove)
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        // addNode({
        //     ...newNodeInfo,
        //     position
        // });
    }

    const renderFlow = () => {
        if(dataSource.length > 0) {
            return <ReactFlowProvider>
                <main
                    className='flex h-full w-full flex-col max-h-screen relative'
                    ref={reactFlowWrapper}
                >
                    <ReactFlow
                        elements={elements}
                        onConnect={onConnect}
                        onElementsRemove={onElementsRemove}
                        onElementClick={(event, elements) => {
                            setOpenDataView(false)
                            setSelectedElement(elements)
                        }}
                        onPaneClick={()=> {
                            // setSelectedElement(null)
                            setOpenDataView(false)
                        }}
                        nodeTypes={{
                            dataSource: DataSourceNode,
                            transformation: TransformationNode,
                            visualization: VisualizationNode,
                            postgresDataSource: PostgresDataSourceNode,
                        }}
                        selectNodesOnDrag={false}
                        onLoad={onLoad}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        defaultPosition={[500,150]}
                    >
                        <Controls
                            style={{
                                right: 20,
                                left: 'auto',
                                zIndex: 20,
                                bottom: openDataView ?'calc(45% + 10px)' : 20,
                            }}
                        />
                    </ReactFlow>
                    {openDataView ? <DataView/> : null}
                </main>
            </ReactFlowProvider>
        } else {
            return (
                <div className={'flex flex-col items-center justify-center bg-kuwala-bg-gray w-full h-full'}>
                    <span className={'indent-2 text-xl'}>
                        To work with data on the canvas,
                    </span>
                    <span className={'indent-2 text-xl'}>
                        click on <Link to={'/data-catalog'}  className={'text-kuwala-green '}>Add data source</Link>
                    </span>
                </div>
            )
        }
    }

    return (
        <div className={`flex flex-col h-screen overflow-y-hidden antialiased text-gray-900 bg-white`}>
            <div className='flex flex-col h-full w-full'>
                <Header />
                <div className={'flex flex-row h-full w-full max-h-screen relative'}>
                    <Sidebar />
                    {renderFlow()}
                </div>
                <NodeConfigModal
                    isShow={showConfigModal}
                    configData={selectedElement}
                />
            </div>
        </div>
    )
}