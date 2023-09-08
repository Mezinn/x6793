import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany, Unique
} from 'typeorm';
import {Office} from "./Office.entity";

@Entity('country')
@Unique(["code"])
@Unique(["name"])
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', {length: 64})
    name: string;

    @Column('varchar', {length: 8})
    code: string;

    @OneToMany(() => Office, office => office.country)
    offices: Office[];
}
