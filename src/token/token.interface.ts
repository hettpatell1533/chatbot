import { TokenType } from "src/utils/token_type.enum";

export interface JwtPayload {
    sub: string;
    role: string;
    type: TokenType;
    iat?: number;
    exp?: number;
}