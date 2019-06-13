
export class SubTocItemViewModel {
    public title: string = null;
    public domainId: string = null;
    public domainPath: string = null;
    public isSubscribed: boolean = false;
    public hasChildren: boolean = false;
    public type: string = null;
    public level: number = 0;
    public index: number = 0;
    public subTocItem: SubTocItemViewModel[] = [];
}