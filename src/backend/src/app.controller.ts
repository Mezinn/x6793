import {BadRequestException, Controller, Get, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import {ParseSourceProcess} from "./processes/ParseSourceProcess.service";
import {Readable} from "stream";
import {FetchTopExchangersProcess} from "./processes/FetchTopExchangers.process";

@Controller()
export class AppController {

    constructor(
        private readonly fetchTopExchangersProcess: FetchTopExchangersProcess,
        private parseSourceProcess: ParseSourceProcess
    ) {
    }

    @Get('/top')
    async getTop() {
        return await this.fetchTopExchangersProcess.getTopOffices();
    }

    @Post('/refresh')
    @UseInterceptors(new (FileInterceptor('file')))
    async uploadFile(@UploadedFile() file) {
        try {
            const {buffer} = file;
            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);
            return await this.parseSourceProcess.parse(stream);
        } catch (e) {
            throw new BadRequestException('Wrong format.');
        }
    }
}
