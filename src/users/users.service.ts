import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async createUser(userData: any) {
        try {
            const existingUser = await this.prismaService.user.findUnique({
                where: { email: userData.email }
            });
            if (existingUser) {
                throw new Error('User already exists');
            }
            const user = await this.prismaService.user.create({
                data: userData
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async findUserByEmail(email: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { email },
                include: {
                    projects: true,
                }
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    async findUserById(id: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id }
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    async updateUser(id: string, userData: any) {
        try {
            const user = await this.prismaService.user.update({
                where: { id },
                data: userData
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await this.prismaService.user.delete({
                where: { id }
            });
            return user;
        }
        catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}
