import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const logger = createLogger("Todos");

export async function getTodosForUser(userId: string): Promise<TodoItem[]>{
    logger.info("Getting all todos for user", {
        userId: userId
    })
    return await todoAccess.getTodosForUser(userId)
}

export async function createTodo(userId: string, 
    newTodo: CreateTodoRequest): Promise<TodoItem>{
    const todoId: uuid = uuid.v4();

    const todoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        createdAt: Date.now().toString(),
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${userId}-${todoId}-`
    }
    try{
        logger.info("Creating new todo...", {
            todoId: todoId
        })
        const newItem = await todoAccess.createTodo(todoItem)
        return newItem
    } catch (e) {
        const err = createError(e)
        logger.error("An error occured. Use can not be created", {
            error: err
        })
    }
    
}

export async function updateTodo( 
    userId:string, 
    todoId:string, 
    updatedTodo: UpdateTodoRequest): 
    Promise<UpdateTodoRequest>{
        logger.info("Updating todo...", {
            todoId: todoId
        })
    return todoAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<any>{
    logger.info("Generating SignedUrl...")
    return attachmentUtils.generateUploadUrl(userId, todoId);
}

export async function deleteTodo(userId:string, todoId: string){
    todoAccess.deleteTodo(userId, todoId)
}