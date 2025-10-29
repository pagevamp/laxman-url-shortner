import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

interface QueryErrorWithCode extends QueryFailedError {
  code?: string;
}

export function handleError(error: unknown): never {
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof QueryFailedError) {
    const err = error as QueryErrorWithCode;

    switch (err.code) {
      case '23505':
        throw new ConflictException(
          'Duplicate key value violates unique constraint',
        );
      case '23503':
        throw new BadRequestException('Foreign key constraint violation');
      case '22P02':
        throw new BadRequestException('Invalid input syntax (e.g. UUID)');
      case '23502':
        throw new BadRequestException('Missing required field');
      default:
        throw new InternalServerErrorException('Database query error');
    }
  }

  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }

  throw new InternalServerErrorException('Unexpected server error');
}
