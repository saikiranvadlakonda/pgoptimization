import { FolderContentEntity} from './folderContentEntity.model';
export class FolderEntity {
    public folderNameID: number;
    public folderName: string;
    public parentFolderID: number;
    public subscriberClientID: number;
    public subscriberID: number;
    public dateCreated: Date;
    public lastAccessedDate: Date;
    public folders: FolderEntity[];
    public files: FolderContentEntity[];
}