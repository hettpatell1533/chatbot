import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { CreateCheckoutSession } from './dto/createCheckoutSession.dto';
import { CookieAuthGuard } from 'src/auth/token.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import Stripe from 'stripe';
import { UsersService } from 'src/users/users.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService, private readonly userService: UsersService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string
  ) {
    const payload = req.body; 

    try {
      // Construct and verify the event using raw body
      const event = await this.stripeService.constructWebhookEvent(payload, signature);
      // Handle the event based on its type
      switch (event.type) {
        case 'customer.created':
          const customer = event.data.object;
          console.log(customer.email)
          if(!customer.email){
            throw new Error("email is not found")
          }
          await this.userService.updateUserByEmail(customer.email, {
            customer_id: customer.id
          })
          break;
        case 'customer.subscription.created':
          const subscription = event.data.object;
          console.log(JSON.stringify(subscription))
          await this.userService.updateUserByCustomerId(subscription.customer as string, {
            is_subscribed: true,
          })
          break;
        case 'charge.succeeded':
          const chargeSucceeded = event.data.object;
          // console.log(chargeSucceeded)
          break;
        case 'charge.failed':
          const chargeFailed = event.data.object;
          // console.log(chargeFailed)
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      // Respond to Stripe to acknowledge receipt
      res.status(200).send({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(400).send({ error: 'Webhook Error' });
    }
  }

  @Post('create-checkout-session')
  @UseGuards(CookieAuthGuard, AuthGuard)
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
