import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Postagem } from '../entities';

export default class PostSeeder implements Seeder {

    track = false;

    public async run(_dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {

        const postFactory = factoryManager.get(Postagem);
        // save 1 factory generated entity, to the database
        await postFactory.save();

        // save 5 factory generated entities, to the database
        await postFactory.saveMany(8);
    }
}
