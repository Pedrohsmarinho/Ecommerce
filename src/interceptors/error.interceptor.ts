import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    return next.handle().pipe(
      catchError(error => {
        // Log unauthorized access attempts
        if (error instanceof HttpException && error.getStatus() === HttpStatus.UNAUTHORIZED) {
          this.logger.warn(
            `Unauthorized access attempt - IP: ${ip}, Method: ${method}, URL: ${originalUrl}, User-Agent: ${userAgent}`,
          );
        }

        // Log all errors with details
        this.logger.error(
          `Error occurred - IP: ${ip}, Method: ${method}, URL: ${originalUrl}, User-Agent: ${userAgent}`,
          error.stack,
        );

        // Standardize error response
        if (error instanceof HttpException) {
          return throwError(() => ({
            statusCode: error.getStatus(),
            message: error.message,
            error: error.name,
            timestamp: new Date().toISOString(),
            path: originalUrl,
          }));
        }

        // Handle unknown errors
        return throwError(() => ({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'InternalServerError',
          timestamp: new Date().toISOString(),
          path: originalUrl,
        }));
      }),
    );
  }
}