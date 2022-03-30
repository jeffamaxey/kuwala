import {getTablePreview} from "../api/DataSourceApi";
import React from "react";

export const populateSchema = (rawSchema) => {
    switch (rawSchema) {
        case 'postgres':
            return rawSchema.map((schema) => {
                return {
                    ...schema,
                    isOpen: false,
                    categories: schema.categories.map((category) => {
                        return {
                            ...category,
                            isOpen: false
                        }
                    })
                }
            })
        case 'bigquery':
            return rawSchema.map((schema) => {
                return {
                    ...schema,
                    schema: schema.project,
                    isOpen: false,
                    categories: schema.datasets.map((data) => {
                        return {
                            ...data,
                            category: data.dataset,
                            isOpen: false
                        }
                    })
                }
            })
        default:
            return rawSchema
    }
}

export const generateParamsByDataSourceType = (type, addressString) => {
    const arr = addressString.split('@')
    switch (type){
        case "postgres":
            return {
                schema_name: arr[0],
                table_name: arr[2],
                limit_columns: 200,
                limit_rows: 300,
            }
        case "bigquery":
            return {
                project_name: arr[0],
                dataset_name: arr[1],
                table_name: arr[2],
                limit_columns: 200,
                limit_rows: 300,
            }
        default: return ""
    }
}

export const getDataDictionary = (data, headers) => {
    let dictionary = [];
    data.map((row,i) => {
        let obj = {};
        row.map((cell, j) => {
            obj[headers[j]] = typeof data[i][j] === 'object' ? JSON.stringify(data[i][j]) : data[i][j];
        })
        dictionary.push(obj)
    })
    return dictionary;
};

export const preCreateSchemaExplorer = ({schemaList, addressString, setSchema}) => {
    const arr = addressString.split('@')
    const schemaAddress = arr[0]
    const categoryAddress = arr[1]

    let tempSchema;
    if(categoryAddress && schemaAddress) {
        tempSchema = schemaList.map((el) => {
            if (el.schema === schemaAddress) {
                return {
                    ...el,
                    isOpen: true,
                    categories: el.categories.map((cat) => {
                        if (cat.category === categoryAddress){
                            cat.isOpen = true
                        }
                        return cat
                    })
                }
            }
            return el
        })
    } else {
        tempSchema = schemaList.map((el) => {
            if (el.schema === schemaAddress){
                el.isOpen = true
                if (el.isOpen === false) {
                    return {
                        ...el,
                        categories: el.categories.map((cat) => {
                            cat.isOpen = false
                            return cat
                        })
                    }
                }
            }
            return el
        })
    }
    setSchema(tempSchema)
}