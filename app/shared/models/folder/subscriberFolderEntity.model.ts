import { FolderEntity } from './folderEntity.model';
export class SubscriberFolderEntity {
    public subscriberClientId: number;
    public subscriberId: number;
    public clientDescription: string;
    public dateCreated: Date;
    public lastAccessedDate: Date;
    public zoneId: number;
    public parentFolders: FolderEntity[];
}