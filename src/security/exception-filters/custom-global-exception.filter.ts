import { ArgumentsHost, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";
import { ExceptionConfigMap } from "./exception.config";

interface ExceptionResponse {
    statusCode: number;
    error: string;
    message: string | object;
}

@Injectable()
export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: ExceptionResponse;

        // Helper to safely extract error name
        const getErrorName = (ex: unknown): string => {
            if (ex && typeof ex === "object" && "constructor" in ex) {
                return (ex as { constructor: { name: string } }).constructor.name;
            }
            return "UnknownError";
        };

        // Helper to safely extract message
        const getErrorMessage = (ex: unknown, fallback: string | object): string | object => {
            if (typeof ex === "string") return ex;
            if (ex && typeof ex === "object" && "message" in ex) {
                return (ex as { message?: string }).message ?? fallback;
            }
            return fallback;
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            message = {
                statusCode: status,
                error: exception.name,
                message: getErrorMessage(res, "HttpException occurred"),
            };
        } else {
            const mappedEntry = Array.from(ExceptionConfigMap.entries()).find(
                ([cls]) => exception instanceof cls,
            );

            if (mappedEntry) {
                const [, config] = mappedEntry;
                status = config.status;
                message = {
                    statusCode: status,
                    error: getErrorName(exception),
                    message: getErrorMessage(exception, config.defaultMessage as string | object),
                };
            } else {
                // Unknown / unexpected errors
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                message = {
                    statusCode: status,
                    error: "InternalServerError",
                    message: "An unexpected error occurred",
                };
                console.error(exception);
            }
        }

        response.status(status).json({
            timestamp: new Date().toISOString(),
            path: request.url,
            ...message,
        });
    }
}
