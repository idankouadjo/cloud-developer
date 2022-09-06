import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE
    ){}

    async createTodo(newTodo: TodoItem): Promise<TodoItem>{
        logger.info("Creating todos...")
        await this.docClient.put({
            TableName: this.todoTable,
            Item: newTodo
        }).promise()
    
        return newTodo
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]>{
        logger.info("Getting todo's items...")

        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: process.env.TODOS_CREATED_AT_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const todoItems = result.Items
        return todoItems as TodoItem[]
    }

    async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate>{
        const results = await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                "done": updatedTodo.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        logger.info("Updated todo Item.")
        return results.Attributes as TodoUpdate
    }

    async deleteTodo(userId:string, todoId:string) {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key:{
                "userId": userId,
                "todoId": todoId
            }
        }).promise()
    }
}