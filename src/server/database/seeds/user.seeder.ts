import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Usuario } from '../entities';

export default class UserSeeder implements Seeder {

    track = false;

    public async run(_dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {

        const userFactory = factoryManager.get(Usuario);
        // save 1 factory generated entity, to the database
        await userFactory.save();

        // save 5 factory generated entities, to the database
        await userFactory.saveMany(9);
    }
}
