import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Rate} from "../entities/Rate.entity";
import {Office} from "../entities/Office.entity";

export type CreateRateDto = {
    office: Office;
    from_currency: string;
    to_currency: string;
    in_rate: number;
    out_rate: number;
    reserve: number;
    date: Date;
}

@Injectable()
export class RateService {
    constructor(
        @InjectRepository(Rate)
        private rateRepository: Repository<Rate>,
    ) {
    }

    async create(
        {
            office,
            from_currency,
            to_currency,
            in_rate,
            out_rate,
            reserve,
            date
        }: CreateRateDto
    ): Promise<Rate> {
        const rate = new Rate();
        rate.office = office;
        rate.from_currency = from_currency;
        rate.to_currency = to_currency;
        rate.in_rate = in_rate;
        rate.out_rate = out_rate;
        rate.reserve = reserve;
        rate.date = date;
        return await this.rateRepository.save(rate);
    }

    find(office: Office, from: string, to: string): Promise<Rate | null> {
        return this.rateRepository.findOne({where: {office, from_currency: from, to_currency: to}});
    }

    clear(){
        return this.rateRepository.delete({});
    }
}
