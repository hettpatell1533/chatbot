import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dtos/create-dashboard.dto';
import { Request, Response } from 'express';
import { AstService } from 'src/ast/ast.service';
import { CookieAuthGuard } from 'src/auth/token.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly astService: AstService,
  ) {}

  @Post('')
  @UseGuards(CookieAuthGuard, AuthGuard)
  async createDashboard(@Body() createDashboardDto: CreateDashboardDto, @Res() res: Response, @Req() req: Request): Promise<Response> {
    try {
      const newDashboard = await this.dashboardService.indexGithubRepo(createDashboardDto, req["user"]);
      return res.status(HttpStatus.CREATED).json({
        message: 'Dashboard created successfully',
        data: newDashboard,
      });
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error creating dashboard',
        error: error.message,
      });
    }
  }

  @Get('')
  async getAllProjects(@Res() res: Response): Promise<Response> {
    try {
      const projects = await this.dashboardService.getAllProjects();
      return res.status(HttpStatus.OK).json({
        message: 'Fetched projects successfully',
        data: projects,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error fetching projects',
        error: error.message,
      });
    }
  }
}
