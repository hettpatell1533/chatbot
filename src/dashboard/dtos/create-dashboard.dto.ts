import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDashboardDto {
    @IsString()
    @IsNotEmpty()
    project_name: string;

    @IsString()
    @IsNotEmpty()
    github_url: string;

    @IsString()
    @IsOptional()
    github_token: string;
}