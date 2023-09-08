import {Injectable, NotFoundException} from '@nestjs/common';
import {RateService} from "../services/Rate.service";
import {CreateExchangeDto, ExchangeService} from "../services/Exchange.service";

@Injectable()
export class CreateExchangeProcess {
    constructor(
        private rateService: RateService,
        private exchangeService: ExchangeService
    ) {
    }

    async create(payload: Omit<CreateExchangeDto, 'bid'>): Promise<void> {

        const rate = await this.rateService.find(payload.office, payload.from_currency, payload.to_currency);
        if (!rate) {
            throw new NotFoundException(`Rate [${payload.from_currency}, ${payload.to_currency}] not found.`);
        }
        const bid = payload.ask / (rate.in_rate / rate.out_rate);
        
        await this.exchangeService.create({...payload, bid});
    }
}
