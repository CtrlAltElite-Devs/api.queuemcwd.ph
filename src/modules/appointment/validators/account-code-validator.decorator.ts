import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsNumericString(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isNumericString",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                validate(value: any, _: ValidationArguments) {
                    // Ensure value is a string containing only digits
                    return typeof value === "string" && /^\d+$/.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a numeric string`;
                },
            },
        });
    };
}
