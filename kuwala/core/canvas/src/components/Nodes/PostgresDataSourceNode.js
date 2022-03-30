import React, {useState} from 'react';

import { Handle } from 'react-flow-renderer';
import NodeConfigModal from "../Modals/NodeConfigModal";
import {useStoreActions, useStoreState} from "easy-peasy";
import PostgreSVG from "../../icons/PostgreSQL.svg";

const PostgresDataSourceNode = (({data}) => {
    const {toggleConfigModal} = useStoreActions(actions => actions.common);
    const {toggleDataView} = useStoreActions(actions => actions.canvas);

    return (
        <div
            className={'bg-white shadow-md hover:shadow-xl duration-200 ease-in-out rounded-lg flex flex-col'}
        >
            <div
                className={'text-xs text-center'}
            >
                {/* BODY */}
                <div className={`
                    flex flex-row 
                    w-full h-full
                    pl-4 py-4 pr-7
                `}>
                    <div>
                        <img
                            src={PostgreSVG}
                            className={'user-select-none'}
                            style={{
                                width: 64,
                                height: 64,
                            }}
                            draggable={false}
                            alt={'Postgres logo'}
                        />
                    </div>
                    <div className={'flex flex-col justify-between ml-6'}>
                        <div className={'flex justify-between items-center text-lg font-semibold'}>
                            <span>Postgres table</span>
                        </div>
                        <div className={'flex flex-row space-x-2'}>
                            <div className="flex space-x-2 justify-center">
                                <button
                                    type="button"
                                    className={`
                                        inline-block px-4 py-1 border-2 border-kuwala-green
                                        text-kuwala-green font-medium text-xs leading-tight 
                                        rounded-lg hover:bg-black hover:bg-opacity-5 
                                        focus:outline-none focus:ring-0 transition duration-150 ease-in-out
                                        `}
                                    draggable={false}
                                    onClick={() => {
                                        toggleConfigModal()
                                    }}
                                >
                                    Configure
                                </button>
                            </div>
                            <div className="flex space-x-2 justify-center">
                                <button
                                    type="button"
                                    className={`
                                        inline-block px-4 py-1 
                                        font-medium text-xs leading-tight rounded-lg shadow-sm 
                                        hover:shadow-lg focus:shadow-lg 
                                        focus:outline-none focus:ring-0 active:bg-kuwala-green active:shadow-lg 
                                        transition duration-150 ease-in-out
                                        focus:outline-none focus:ring-0
                                        active:shadow-lg 
                                        hover:text-stone-300
                                        ${data.dataBlocks.isConfigured ? `
                                            bg-kuwala-green  text-white
                                        ` : `bg-stone-300 text-white`}
                                    `}
                                    disabled={!data.dataBlocks.isConfigured}
                                    onClick={toggleDataView}
                                    draggable={false}
                                >Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <Handle
                    className={`
                        h-full
                        bg-kuwala-green
                        shadow-lg
                    `}
                    style={{
                        backgroundColor: '#00A99D',
                        width: 36,
                        right: -30,
                        height: '100%',
                        borderRadius: 0,
                        border: 'medium none',
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                    d={`${data.id}`}
                    type="source"
                    position="right"
                    isConnectable
                />
            </div>
        </div>
    );
});

export default PostgresDataSourceNode;