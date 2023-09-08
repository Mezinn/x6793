import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn, Unique
} from 'typeorm';
import {Country} from "./Country.entity";
import {Rate} from "./Rate.entity";
import {Exchange} from "./Exchange.entity";

@Entity('office')
@Unique(["name"])
export class Office {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 64})
    name: string;

    @ManyToOne(() => Country)
    @JoinColumn({name: "country_id"})
    country: Country;

    @OneToMany(() => Rate, rate => rate.office)
    rates: Rate[];

    @OneToMany(() => Exchange, exchange => exchange.office)
    exchanges: Exchange[];
}
