import { Body, Controller, Delete, Get, Patch, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  async createUser(@Body() userData: any, @Res() res: Response): Promise<Response>{
    try {
      const user = await this.usersService.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Get(':email')
  async findUserByEmail(@Body('email') email: string, @Res() res: Response): Promise<Response>{
    try {
      const user = await this.usersService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Get(':id')
  async findUserById(@Body('id') id: string, @Res() res: Response): Promise<Response>{
    try {
      const user = await this.usersService.findUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Patch(':id')
  async updateUser(@Body() userData: any, @Res() res: Response): Promise<Response>{
    try {
      const user = await this.usersService.updateUser(userData.id, userData);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Delete(':id')
  async deleteUser(@Body('id') id: string, @Res() res: Response): Promise<Response>{
    try {
      const user = await this.usersService.deleteUser(id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
