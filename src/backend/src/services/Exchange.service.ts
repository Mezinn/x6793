import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Office} from "../entities/Office.entity";
import {Exchange} from "../entities/Exchange.entity";

export type CreateExchangeDto = {
    office: Office;
    from_currency: string;
    to_currency: string;
    ask: number;
    bid: number;
    date: Date;
}

@Injectable()
export class ExchangeService {
    constructor(
        @InjectRepository(Exchange)
        private exchangeRepository: Repository<Exchange>
    ) {
    }

    async create(
        {
            office,
            from_currency,
            to_currency,
            ask,
            bid,
            date
        }: CreateExchangeDto
    ): Promise<Exchange> {

        const exchange = new Exchange();
        exchange.office = office;
        exchange.from_currency = from_currency;
        exchange.to_currency = to_currency;
        exchange.ask = ask;
        exchange.bid = bid;
        exchange.date = date;
        return this.exchangeRepository.save(exchange);
    }
    clear(){
        return this.exchangeRepository.delete({});
    }
}
