export class TocItemViewModel {
    public title: string;
    public domainId: string;
    public domainPath: string;
    public isSubscribed: boolean;
    public hasChildren: boolean;
    public type: string;
    public level: number;
    public index: number;
    public subTocItem: TocItemViewModel[];
}
