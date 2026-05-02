export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string

    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.name = 'AppError' //facilita a indentificação nos logs.
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado') {
        super(message, 401, 'UNAUTHORIZED')
        this.name = 'UnAuthorizedError'
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Acesso negado') {
        super(message, 403, 'FORBIDDEN')
        this.name = 'ForbiddenError'
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} não encontrado`, 404, 'NOT_FOUND')
        this.name = 'NotFoundError'
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Conflito de dados') {
        super(message, 409, 'CONFLICT')
        this.name = 'ConflictError'
    }
}
