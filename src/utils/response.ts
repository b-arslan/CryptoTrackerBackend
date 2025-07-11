export interface IApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    timestamp?: string;
    statusCode?: number;
}

export class ApiResponse<T = any> {
    public success: boolean;
    public message: string;
    public data?: T;
    public timestamp: string;
    public statusCode?: number;

    constructor(
        success: boolean,
        message: string,
        data?: T,
        statusCode?: number
    ) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
        this.statusCode = statusCode;
    }

    static success<T>(
        data?: T,
        message: string = "OK",
        statusCode: number = 200
    ): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data, statusCode);
    }

    static error<T>(
        message: string = "Something went wrong",
        statusCode: number = 500,
        data?: T
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data, statusCode);
    }

    static validationError<T>(
        message: string = "Invalid parameter",
        data?: T
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data, 400);
    }

    static notFound<T>(
        message: string = "The requested resource could not be found",
        data?: T
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data, 404);
    }

    static unauthorized<T>(
        message: string = "Unauthorized access",
        data?: T
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data, 401);
    }

    static forbidden<T>(
        message: string = "Unauthorized access",
        data?: T
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, message, data, 403);
    }

    toJSON(): IApiResponse<T> {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp,
            statusCode: this.statusCode,
        };
    }

    send(res: any): void {
        res.status(this.statusCode || (this.success ? 200 : 500)).json(
            this.toJSON()
        );
    }
}
