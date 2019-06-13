export class FolderContentViewModel {
    public folderContentID: number;
    public folderNameID: number;
    public caseID: number;
    public flagID: number;
    public trashID?: number;
    public url: string;
    public lmtID: string;
    public title: string;
    public contentType: string;
    public comment: string;
    public commentDated?: Date;
    public dateAdded: Date;
    public zoneID?: number;
    public isCustomView?:boolean;
    public _clientDescription: string;
    public _folderName: string;
    public subscriberClientID: number;
}