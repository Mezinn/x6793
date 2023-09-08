import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Country} from "../entities/Country.entity";

export type CreateCountryDto = {
    code: string,
    name: string
};

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(Country)
        private countryRepository: Repository<Country>,
    ) {
    }

    create(
        {
            code,
            name
        }: CreateCountryDto
    ): Promise<Country> {
        const country = new Country();
        country.name = name;
        country.code = code;
        return this.countryRepository.save(country);
    }

    findByCode(code: string): Promise<Country | null> {
        return this.countryRepository.findOne({where: {code}});
    }

    findByName(name: string): Promise<Country | null> {
        return this.countryRepository.findOne({where: {name}});
    }

    clear() {
        return this.countryRepository.delete({});
    }
}
