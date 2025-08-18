import { PaginationDto, PaginationResponseDto } from '../dto/pagination.dto';

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationDto,
): PaginationResponseDto<T> {
  const { page = 1, limit = 20 } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPaginationSkip(pagination: PaginationDto): number {
  const { page = 1, limit = 20 } = pagination;
  return (page - 1) * limit;
}

export function getPaginationTake(pagination: PaginationDto): number {
  return pagination.limit || 20;
}
