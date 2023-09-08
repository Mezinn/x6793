import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';
import {EntityManager} from 'typeorm';

@Injectable()
export class FetchTopExchangersProcess {

    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager
    ) {
    }

    async getTopOffices(): Promise<any> {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 10);

        const query = `
WITH profit_data AS (
    SELECT ex.office_id,
           SUM((ex.ask * (rate_in.in_rate / rate_in.out_rate) -
                ex.bid * (rate_out.in_rate / rate_out.out_rate))) as profit
    FROM exchange AS ex
             JOIN rate AS rate_in ON ex.office_id = rate_in.office_id
        AND ex.from_currency = rate_in.from_currency
        AND rate_in.to_currency = 'USD'
             JOIN rate AS rate_out ON ex.office_id = rate_out.office_id
        AND ex.to_currency = rate_out.from_currency
        AND rate_out.to_currency = 'USD'
    GROUP BY ex.office_id
),
     RankedOffices AS (
         SELECT country.name AS country_name,
                office.*,
                profit_data.profit,
                ROW_NUMBER() OVER(PARTITION BY country.id ORDER BY profit_data.profit DESC) as office_rank
         FROM profit_data
                  JOIN office ON profit_data.office_id = office.id
                  JOIN country on office.country_id = country.id
     ),
     TopCountries AS (
         SELECT country_name,
                MAX(profit) as max_profit
         FROM RankedOffices
         GROUP BY country_name
         ORDER BY max_profit DESC
         LIMIT 3
     )
SELECT ro.*
FROM TopCountries tc
         JOIN RankedOffices ro ON tc.country_name = ro.country_name
WHERE ro.office_rank <= 3
ORDER BY tc.max_profit DESC, ro.profit DESC;
        `;

        return await this.entityManager.query(query, []);
    }
}
