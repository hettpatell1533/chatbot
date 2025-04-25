import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { CreateCheckoutSession } from './dto/createCheckoutSession.dto';
import { CookieAuthGuard } from 'src/auth/token.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('stripe')
@UseGuards(CookieAuthGuard, AuthGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() createChekoutSession: CreateCheckoutSession, @Res() res: Response, @Req() req: Request): Promise<Response> {
    try{
      const url = await this.stripeService.createCheckoutSession(createChekoutSession, req['user'].id);
      return res.status(HttpStatus.OK).json({
        url,
        message: "Successfully creatred checkout page"
      })
    }
    catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while processing the request.',
        error: error.message,
      });
    }
  }
}
