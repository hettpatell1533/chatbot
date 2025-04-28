import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dtos/create-dashboard.dto';
import { Request, Response } from 'express';
import { CookieAuthGuard } from 'src/auth/token.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { TokenService } from 'src/token/token.service';
import { ConfigService } from '@nestjs/config';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  @Post('')
  @UseGuards(CookieAuthGuard, AuthGuard)
  async createDashboard(@Body() createDashboardDto: CreateDashboardDto, @Res({ passthrough: true }) res: Response, @Req() req: Request): Promise<Response> {
    try {
      const newDashboard = await this.dashboardService.indexGithubRepo(createDashboardDto, req["user"].id);
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
  @UseGuards(CookieAuthGuard, AuthGuard)
  async getAllProjects(@Res() res: Response, @Req() req: Request): Promise<any> {
    try {
      const projects = await this.dashboardService.getAllProjects(req["user"].id);
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

  @Get('refresh-auth')
  async refreshAuth(@Res() res: Response, @Req() req: Request): Promise<Response> {
    try{
      const result = await this.tokenService.newAuthTokenFromRefreshToken(req.cookies.refresh_token);
      res.cookie('auth_token', result.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.access.expires_in
      });
      res.cookie('refresh_token', result.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.refresh.expires_in
      });
      return res.status(200).json({ message: 'Refresh token successfully', result });
    }
    catch (error) {
      return res.status(500).json({ message: error.message, error });
    }
  }
}
