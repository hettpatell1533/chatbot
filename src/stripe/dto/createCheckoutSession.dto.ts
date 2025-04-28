import { IsString } from "class-validator";

export class CreateCheckoutSession {
    @IsString({message: "Price is required"})
    price_id: string;

    @IsString({message: "Success url is required"})
    success_url: string;

    @IsString({message: "Cancel url is required"})
    cancel_url: string;
}