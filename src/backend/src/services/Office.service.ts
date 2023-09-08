import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Country} from "../entities/Country.entity";
import {Office} from "../entities/Office.entity";

export type CreateOfficeDto = {
    country: Country,
    name: string
};

@Injectable()
export class OfficeService {
    constructor(
        @InjectRepository(Office)
        private officeRepository: Repository<Office>,
    ) {
    }

    create(
        {
            country,
            name
        }: CreateOfficeDto
    ): Promise<Office> {
        const office = new Office();
        office.country = country;
        office.name = name;
        return this.officeRepository.save(office);
    }

    findByName(name: string): Promise<Office | null> {
        return this.officeRepository.findOne({where: {name}});
    }
    clear(){
        return this.officeRepository.delete({});
    }
}
