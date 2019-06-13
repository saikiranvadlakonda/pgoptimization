import {NavigationElementModel} from './navigationElement.model';
export class NavigationEntryModel {
    public id: string;
    public name: string;
    public displayName: string;
    public modifier: string;
    public hitCount: string;
    public minDateInRange: string;
    public maxDateInRange: string;
    public navigationElements: NavigationElementModel[];
}