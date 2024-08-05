import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
  ) {
    this.bot.start((ctx) => ctx.reply('Welcome!'));
    this.bot.command('hello', (ctx) => ctx.reply('Hello there!'));
    this.bot.command('newcars', this.handleNewCars.bind(this));
    this.bot.command('availability', this.handleAvailability.bind(this));
    this.bot.command('orders', this.handleOrders.bind(this));
    this.bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

    const webhookUrl = this.configService.get<string>('WEBHOOK_URL');
    if (webhookUrl) {
      this.bot.telegram.setWebhook(webhookUrl).then(() => {
        this.logger.log('Webhook set successfully');
      }).catch(err => {
        this.logger.error('Error setting webhook', err);
      });
    } else {
      this.bot.launch().then(() => this.logger.log('Telegram bot started')).catch(err => this.logger.error('Error launching bot', err));
    }
  }

  async sendNotification(chatId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      this.logger.error('Error sending notification', error);
    }
  }

  private async handleNewCars(ctx: Context) {
    const newCars = await this.fetchNewCars();
    ctx.reply(`New cars available: ${newCars.join(', ')}`);
  }

  private async handleAvailability(ctx: Context) {
    const availability = await this.checkAvailability();
    ctx.reply(`Car availability: ${availability}`);
  }

  private async handleOrders(ctx: Context) {
    const orders = await this.fetchUserOrders(ctx.message.from.id);
    ctx.reply(`Your orders: ${orders.join(', ')}`);
  }

  private async fetchNewCars(): Promise<string[]> {
    return ['Car1', 'Car2', 'Car3'];
  }

  private async checkAvailability(): Promise<string> {
    return 'Available';
  }

  private async fetchUserOrders(userId: number): Promise<string[]> {
    return ['Order1', 'Order2', 'Order3'];
  }
}
