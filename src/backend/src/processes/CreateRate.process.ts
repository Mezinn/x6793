import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Rate} from "../entities/Rate.entity";
import {Office} from "../entities/Office.entity";
import {CreateRateDto, RateService} from "../services/Rate.service";

@Injectable()
export class CreateRateProcess {
    constructor(
        @InjectRepository(Rate)
        private rateRepository: Repository<Rate>,
        private rateService: RateService
    ) {
    }

    async create(payload: CreateRateDto): Promise<void> {
        const rates = [
            payload,
            {
                ...payload,
                from_currency: payload.to_currency,
                to_currency: payload.from_currency,
                in_rate: 1,
                out_rate: 1 / (payload.in_rate / payload.out_rate)
            },
            {
                ...payload,
                from_currency: payload.from_currency,
                to_currency: payload.from_currency,
                in_rate: 1,
                out_rate: 1
            },
            {
                ...payload,
                from_currency: payload.to_currency,
                to_currency: payload.to_currency,
                in_rate: 1,
                out_rate: 1
            }
        ];

        for (const rate of rates) {
            try {
                await this.rateService.create(rate);
            } catch (e) {
                console.log(`Duplicate rate [${rate.office.id}, ${rate.from_currency}, ${rate.to_currency}]`);
            }
        }
    }

    find(office: Office, from: string, to: string): Promise<Rate | null> {
        return this.rateRepository.findOne({where: {office, from_currency: from, to_currency: to}});
    }
}
