import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSession } from './dto/createCheckoutSession.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StripeService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService
    ) {}

    private stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2025-03-31.basil',
      });

    async createCheckoutSession(createChekoutSessionDto: CreateCheckoutSession, userId: string): Promise<string> {
        try {
            const userData = await this.userService.findUserById(userId);
            if(!userData) throw new Error("User not found")
            const customer = await this.stripe.customers.create({
                email: createChekoutSessionDto.customer_email,
                name: userData.name,
                metadata: {
                    user_id: userId,
                    quantity: 1,
                    price_id: createChekoutSessionDto.price_id,
                    email: userData.email,
                    name: userData.name
                }

            })
            const session = await this.stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                customer: customer.id,
                line_items: [
                    {
                        price: createChekoutSessionDto.price_id,
                        quantity: 1,
                    },
                ],
                customer_email: createChekoutSessionDto.customer_email,
                metadata: {
                    user_id: userId,
                    quantity: 1,
                    price_id: createChekoutSessionDto.price_id,
                    email: userData.email,
                    name: userData.name
                },
                success_url: createChekoutSessionDto.success_url,
                cancel_url: createChekoutSessionDto.cancel_url,
            })
    
            return session.url!
        } catch (error) {
            throw new Error(`Error creating checkout session: ${error.message}`);
        }
    }
}
