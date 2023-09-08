import {Injectable} from '@nestjs/common';
import {CountryService} from "../services/Country.service";
import {OfficeService} from "../services/Office.service";
import {CreateRateProcess} from "./CreateRate.process";
import {CreateExchangeProcess} from "./CreateExchange.process";
import {Readable} from 'stream';
import {createInterface} from "readline";
import {Country} from "../entities/Country.entity";
import {RateService} from "../services/Rate.service";
import {ExchangeService} from "../services/Exchange.service";

const countStartSpaces = (line: string) => line.length - line.trimStart().length;

function createStack(
    stack: { depth: number, value: any }[] = [],
    previousDepth = -Infinity
) {

    return function (depth: number, value: any) {
        if (depth <= previousDepth) {
            for (let i = stack.length - 1; i >= 0; --i) {
                if (stack[i].depth <= depth) {
                    stack.splice(i);
                    break;
                }
            }
        }
        previousDepth = depth;
        stack.push({depth, value});
        return stack.map(({value}) => value);
    }
}

function parseAsArray(object: object, property: string): any[] {
    if (!object.hasOwnProperty(property)) {
        return [];
    }
    return object[property] instanceof Array ? object[property] : [object[property]];
}

function createLogger() {
    let result = '';
    return function (message: string = '') {
        if (message) {
            result += message + '\n';
        }
        return result;
    }
}

@Injectable()
export class ParseSourceProcess {
    constructor(
        private countryService: CountryService,
        private officeService: OfficeService,
        private rateService: RateService,
        private exchangeService: ExchangeService,
        private createRateProcess: CreateRateProcess,
        private createExchangeProcess: CreateExchangeProcess
    ) {
    }

    async parse(stream: Readable) {

        return new Promise((resolve, reject) => {
            const resolveStack = createStack();
            let stack = [];
            const root = {};

            const r1 = createInterface({
                input: stream,
            });

            r1.on('line', (line: string) => {
                try {
                    const [key, value] = line.split('=').map(x => x.trim());
                    if (value) {
                        let current = root;
                        for (const step of stack) {
                            current = current[step] instanceof Array ? current[step].slice().pop() : current[step];
                        }
                        current[key] = value;
                        return;
                    }

                    const depth = countStartSpaces(line);
                    stack = resolveStack(depth, key);

                    let current = root;
                    let previous = null;
                    let step = null;
                    const needle = stack.slice().pop();
                    for (step of stack.slice(0, -1)) {
                        previous = current;
                        current = current[step] instanceof Array ? current[step].slice().pop() : current[step];
                    }
                    if (current.hasOwnProperty(needle)) {
                        current = {};
                        previous[step] = [].concat(previous[step], [current]);
                    }
                    if (!current.hasOwnProperty(needle)) {
                        current[needle] = {};
                    }
                } catch (e) {
                    reject(e);
                }
            });

            r1.on('close', async () => {
                resolve(this.createEntitiesFromRoot(root));
            });
        });
    }

    async createEntitiesFromRoot(root: any): Promise<string> {

        await this.rateService.clear();
        await this.exchangeService.clear();
        await this.officeService.clear();
        await this.countryService.clear();

        const logger = createLogger();

        for (const {country: payload} of parseAsArray(root, 'countries')) {
            try {
                const country = await this.countryService.create(payload);
                logger(`Country [${country.code}, ${country.name}] successfully added.`);
            } catch (e) {
                logger(`Error creating country: ${e.message}`);
            }
        }

        for (const {['exchange-office']: officePayload} of parseAsArray(root, 'exchange-offices')) {
            let country: Country | null = null;

            try {
                country = await this.countryService.findByCode(officePayload.country);
                if (country) {
                    logger(`Found country ${country.name} for office ${officePayload.name}.`);
                }
            } catch (e) {
                logger(`Error fetching country: ${e.message}`);
            }

            if (!country) {
                logger(`Country ${officePayload.country} not found. Skipping office ${officePayload.name}.`);
                continue;
            }

            try {
                const office = await this.officeService.create({
                    country,
                    name: officePayload.name
                });
                logger(`Office ${office.name} created successfully for country ${country.name}.`);

                for (const {rate: payload} of parseAsArray(officePayload, 'rates')) {
                    try {
                        await this.createRateProcess.create({
                            office,
                            from_currency: payload.from,
                            to_currency: payload.to,
                            in_rate: payload.in,
                            out_rate: payload.out,
                            reserve: payload.reserve,
                            date: payload.date
                        });
                        logger(`Rate from ${payload.from} to ${payload.to} for office ${office.name} added successfully.`);
                    } catch (e) {
                        logger(`Error creating rate for office ${office.name}: ${e.message}`);
                    }
                }

                for (const {exchange: payload} of parseAsArray(officePayload, 'exchanges')) {
                    try {
                        await this.createExchangeProcess.create({
                            office,
                            from_currency: payload.from,
                            to_currency: payload.to,
                            ask: payload.ask,
                            date: payload.date
                        });
                        logger(`Exchange from ${payload.from} to ${payload.to} for office ${office.name} added successfully.`);
                    } catch (e) {
                        logger(`Error creating exchange for office ${office.name}: ${e.message}`);
                    }
                }

            } catch (e) {
                logger(`Error creating office: ${e.message}`);
            }
        }

        return logger();
    }
}
