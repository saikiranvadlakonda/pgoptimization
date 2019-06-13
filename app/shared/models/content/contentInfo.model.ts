export class ContentInfo {
    contentId: string;
    contentPageType: number;
    data: string;
    errorMessage: string;
    fileExtension: string;
    hasErrors: boolean;
    isExportableToPdf: boolean;
    isExportableToRtf: boolean;
    mimeType: string;
    title: string;
}

//export class ContentPageType {
//    Content = 0;
//    PractiseArea = 1;
//    Topic = 2;
//    SubTopic = 3;
//}


export class DownloadContentInfo {
    authorName: string;
    base64String: string;
    errorMessage: string;
    fileContent: string;
    fileExtension: string;
    fileName: string;
    fileStrContent: string;
    hasErrors: boolean = false;
    mimeType: string;
}