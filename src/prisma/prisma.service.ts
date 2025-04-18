import { PrismaClient } from '@prisma/client';
import { INestApplication, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class PrismaService extends PrismaClient {
    async onModuleInit(){
        await this.$connect();

        this.$use(async (params, next) => {
          if (params.model === 'user') {
            if (params.action === 'create' || params.action === 'update') {
              const userData = params.args.data;
              if (userData.password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
              }
            }
          }
    
          return next(params);
        });
    }

    async enableShutdownHooks(app: INestApplication) {
        (this.$on as any)('beforeExit', async () => {
          await app.close();
        });
      }
}
