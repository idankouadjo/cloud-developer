import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
export class AttachmentUtils {
    constructor(
        private readonly buckname: string = process.env.ATTACHMENT_S3_BUCKET,
        private readonly expiration: string = process.env.SIGNED_URL_EXPIRATION
    ){}
    async generateUploadUrl(userId: string, todoId: string): Promise<string>{
        const presignedUrl: string = await s3.getSignedUrl('putObject',{
            Bucket: this.buckname,
            Key: `${userId}-${todoId}-`,
            Expires: parseInt(this.expiration)
        })

        return presignedUrl
    }
}