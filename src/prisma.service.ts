import { PrismaClient } from '@prisma/client';
import { INestApplication, Injectable } from '@nestjs/common';


@Injectable()
export class PrismaService extends PrismaClient {
    async onModuleInit(){
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        (this.$on as any)('beforeExit', async () => {
          await app.close();
        });
      }
}
