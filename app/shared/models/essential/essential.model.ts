export class Essential {
  public topicName: string;
  public subTopicName: string;
  public pageType: string;
  public essentials: ContentDomainEntity[];
  public isValid: boolean;
}

export class ContentDomainEntity {
  public parentDomainId: string;
  public domainId: string;
  public title: string;
  public isSubscribed: boolean;
  public domainPath: string;
  public hasChildren: boolean;
  public hasModule: boolean;
  public topicType: string;
  public zoneId: number;
  public subscriberId: number;
  public contentLevel: number;
  public rawContent: string;
  public mimeType: string;
  public returnOrphan: boolean;
  public domainIdList: string;
  public subContentDomains: ContentDomainEntity[];
  public contentFilePath: string;
  public contentUsername: string;
  public contentPassword: string;
  public eType: string;
  public guidance: string;
  public subTopicDomainPath: string;
}

export class Topic {
  public title: string;
  public isSelected: boolean;
  public count?: number;
  public topicData: any;
}


export class EssentialFilters {
    public topic: string;
    public isSelected: boolean;
    public count?: number;
    public isTopic: boolean;
    public documentType: string;
}
