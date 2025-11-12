import { ForbiddenError } from "@casl/ability";
import { HttpStatus } from "@nestjs/common";

type ExceptionConstructor = new (...args: any[]) => unknown;

export const ExceptionConfigMap: Map<
    ExceptionConstructor,
    { status: number; defaultMessage?: string }
> = new Map([
    [
        ForbiddenError,
        {
            status: HttpStatus.FORBIDDEN,
            defaultMessage: "You are not allowed to perform this action",
        },
    ],
]);
