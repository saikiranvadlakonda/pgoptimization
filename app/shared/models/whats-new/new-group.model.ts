export class NewGroupEntity {
    public title: string;
    public domainPath: string;
    public parentDomainId: string;
    public hasChildren: string;
    public containsGroups: string;
    public newsItems: NewItemEntity[];
}

export class NewItemEntity {
    public title: string;
    public domainPath: string;
    public hasChildren: string;
    public description: string;
    public datePublished: string;
    public link: string;
    public isPdf: string;
    public formatedDatePublished: Date;
    public newsCategory: string;
    public isSubscribed: boolean;
    public practiceAreaTitle: string;
}