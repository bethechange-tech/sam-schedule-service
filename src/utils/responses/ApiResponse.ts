import { APIGatewayProxyResult } from 'aws-lambda';
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    CREATED,
    NOT_FOUND,
    NO_CONTENT,
    UNAUTHORIZED,
    getStatusText,
} from '../HttpClient/http-status-codes';


export type ApiResponseBody = Record<string, any> | string;
export type ApiResponseHeaders = {
    [header: string]: boolean | number | string | null;
};
export default class ApiResponse {
    // SUCCESS RESPONSES
    public static ok(body: ApiResponseBody, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createResponse(200, headers, body);
    }

    public static created(body: ApiResponseBody, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createResponse(CREATED, headers, body);
    }

    public static noContent(headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createResponse(NO_CONTENT, headers);
    }

    // ERROR RESPONSES
    public static badRequest(message?: string, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createErrorResponse(BAD_REQUEST, headers, message);
    }

    public static notFound(message?: string, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createErrorResponse(NOT_FOUND, headers, message);
    }

    public static unauthorized(message?: string, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createErrorResponse(UNAUTHORIZED, headers, message);
    }

    public static internalServerError(message?: string, headers?: ApiResponseHeaders): APIGatewayProxyResult {
        return ApiResponse.createErrorResponse(INTERNAL_SERVER_ERROR, headers, message);
    }

    public static createErrorResponse(statusCode: number, headers?: ApiResponseHeaders, message?: string): APIGatewayProxyResult {
        return ApiResponse.createResponse(statusCode, headers, {
            error: {
                code: statusCode,
                message: message || getStatusText(statusCode),
            },
        });
    }

    private static createResponse(
        statusCode: number,
        headers?: ApiResponseHeaders,
        body?: ApiResponseBody,
    ): APIGatewayProxyResult {
        const normalizedHeaders = ApiResponse.normalizeHeaders(headers);

        return {
            statusCode,
            headers: {
                'content-type': typeof body === 'string' ? 'text/plain' : 'application/json',
                ...normalizedHeaders,
            },
            body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '',
        };
    }

    private static normalizeHeaders(headers: ApiResponseHeaders = {}): ApiResponseHeaders {
        return Object.entries(headers).reduce(
            (normalizedHeaders, [key, value]) => ({
                ...normalizedHeaders,
                [key.toLocaleLowerCase()]: value,
            }),
            {},
        );
    }
}
