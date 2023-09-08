import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {typeOrmConfig} from "./config/typeorm";
import {Country} from "./entities/Country.entity";
import {Rate} from "./entities/Rate.entity";
import {Exchange} from "./entities/Exchange.entity";
import {Office} from "./entities/Office.entity";
import {CountryService} from "./services/Country.service";
import {OfficeService} from "./services/Office.service";
import {RateService} from "./services/Rate.service";
import {ExchangeService} from "./services/Exchange.service";
import {CreateRateProcess} from "./processes/CreateRate.process";
import {CreateExchangeProcess} from "./processes/CreateExchange.process";
import {ParseSourceProcess} from "./processes/ParseSourceProcess.service";
import {FetchTopExchangersProcess} from "./processes/FetchTopExchangers.process";

@Module({
    imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        TypeOrmModule.forFeature([
            Country,
            Office,
            Rate,
            Exchange
        ]),
    ],
    controllers: [AppController],
    providers: [
        CountryService,
        OfficeService,
        RateService,
        ExchangeService,

        CreateRateProcess,
        CreateExchangeProcess,
        ParseSourceProcess,
        FetchTopExchangersProcess
    ],
})
export class AppModule {
}
