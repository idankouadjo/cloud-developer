import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
export class AttachmentUtils {
    constructor(
        private readonly buckname: string = process.env.ATTACHMENT_S3_BUCKET
    ){}
    async generateUploadUrl(userId: string, todoId: string): Promise<any>{
        const presignedUrl: string = await s3.getSignedUrl('putObject',{
            Bucket: this.buckname,
            Key: `${userId}-${todoId}-`,
            Expires: '300'
        }).promise()

        return presignedUrl
    }
}