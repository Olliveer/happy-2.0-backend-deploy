import { EntityRepository, Repository } from "typeorm";
import Orphanages from "../models/Orphanage";


@EntityRepository(Orphanages)
class OrphanagesRepository extends Repository<Orphanages> { }

export { OrphanagesRepository };
