import { SubscriberClientViewModel } from './subscriberClient.model';
import { FolderContentViewModel } from './folderContent.model';

export class FolderInfoViewModel {
    public clientList: SubscriberClientViewModel[];
}

export class FolderFileInfoViewModel {
    public folderContentList: FolderContentViewModel[];
}
