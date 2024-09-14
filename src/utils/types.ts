// t refers to the type of returned data if request is successful 

export type ServiceResponse<t> = {
    success: true,
    message?: string
    data?: t
} | FailServiceResponse

export type FailServiceResponse = {
    success: false
    message?: string
    statusCode: number
}